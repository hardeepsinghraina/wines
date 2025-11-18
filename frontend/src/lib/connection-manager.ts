import { AppError, NetworkError, isRetryableError } from './error-handler';

export interface ConnectionConfig {
  maxConnections: number;
  retryAttempts: number;
  baseRetryDelay: number;
  maxRetryDelay: number;
  connectionTimeout: number;
  keepAliveTimeout: number;
}

export interface ConnectionState {
  isConnected: boolean;
  activeConnections: number;
  lastSuccessfulRequest: Date | null;
  failureCount: number;
  currentRetryDelay: number;
  connectionHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export interface ConnectionMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  connectionSuccessRate: number;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private config: ConnectionConfig;
  private state: ConnectionState;
  private metrics: ConnectionMetrics;
  private activeRequests: Set<string> = new Set();
  private connectionPool: Map<string, Date> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor(config: Partial<ConnectionConfig> = {}) {
    this.config = {
      maxConnections: 10,
      retryAttempts: 3,
      baseRetryDelay: 1000,
      maxRetryDelay: 30000,
      connectionTimeout: 30000,
      keepAliveTimeout: 60000,
      ...config,
    };

    this.state = {
      isConnected: true,
      activeConnections: 0,
      lastSuccessfulRequest: null,
      failureCount: 0,
      currentRetryDelay: this.config.baseRetryDelay,
      connectionHealth: 'healthy',
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      connectionSuccessRate: 100,
    };

    this.startHealthCheck();
  }

  static getInstance(config?: Partial<ConnectionConfig>): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager(config);
    }
    return ConnectionManager.instance;
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getConfig(): ConnectionConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<ConnectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.updateConnectionHealth();
      this.cleanupStaleConnections();
    }, 30000); // Check every 30 seconds
  }

  private updateConnectionHealth(): void {
    const successRate = this.metrics.connectionSuccessRate;
    const timeSinceLastSuccess = this.state.lastSuccessfulRequest
      ? Date.now() - this.state.lastSuccessfulRequest.getTime()
      : Infinity;

    if (successRate >= 95 && timeSinceLastSuccess < 60000) {
      this.state.connectionHealth = 'healthy';
    } else if (successRate >= 80 && timeSinceLastSuccess < 300000) {
      this.state.connectionHealth = 'degraded';
    } else {
      this.state.connectionHealth = 'unhealthy';
    }

    // Reset failure count if connection is healthy
    if (this.state.connectionHealth === 'healthy') {
      this.state.failureCount = 0;
      this.state.currentRetryDelay = this.config.baseRetryDelay;
    }
  }

  private cleanupStaleConnections(): void {
    const now = Date.now();
    const staleThreshold = this.config.keepAliveTimeout;

    for (const [connectionId, timestamp] of this.connectionPool.entries()) {
      if (now - timestamp.getTime() > staleThreshold) {
        this.connectionPool.delete(connectionId);
        this.state.activeConnections = Math.max(0, this.state.activeConnections - 1);
      }
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async acquireConnection(): Promise<string> {
    // Check if we can create a new connection
    if (this.state.activeConnections >= this.config.maxConnections) {
      // Wait for an available connection or timeout
      await this.waitForAvailableConnection();
    }

    const connectionId = this.generateConnectionId();
    this.connectionPool.set(connectionId, new Date());
    this.state.activeConnections++;
    this.activeRequests.add(connectionId);

    return connectionId;
  }

  private async waitForAvailableConnection(): Promise<void> {
    const startTime = Date.now();
    const timeout = this.config.connectionTimeout;

    while (this.state.activeConnections >= this.config.maxConnections) {
      if (Date.now() - startTime > timeout) {
        throw new NetworkError('Connection pool exhausted - no available connections');
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  releaseConnection(connectionId: string): void {
    this.connectionPool.delete(connectionId);
    this.activeRequests.delete(connectionId);
    this.state.activeConnections = Math.max(0, this.state.activeConnections - 1);
  }

  recordRequestStart(connectionId: string): void {
    this.metrics.totalRequests++;
  }

  recordRequestSuccess(connectionId: string, responseTime: number): void {
    this.metrics.successfulRequests++;
    this.state.lastSuccessfulRequest = new Date();
    this.state.isConnected = true;
    
    // Update average response time
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1);
    this.metrics.averageResponseTime = (totalResponseTime + responseTime) / this.metrics.successfulRequests;
    
    // Update success rate
    this.metrics.connectionSuccessRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
    
    // Reset retry delay on success
    this.state.currentRetryDelay = this.config.baseRetryDelay;
  }

  recordRequestFailure(connectionId: string, error: Error): void {
    this.metrics.failedRequests++;
    this.state.failureCount++;
    
    // Update success rate
    this.metrics.connectionSuccessRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
    
    // Increase retry delay with exponential backoff
    this.state.currentRetryDelay = Math.min(
      this.state.currentRetryDelay * 2,
      this.config.maxRetryDelay
    );

    // Mark as disconnected if too many consecutive failures
    if (this.state.failureCount >= 5) {
      this.state.isConnected = false;
    }
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      retryAttempts?: number;
      customRetryDelay?: number;
      retryCondition?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      retryAttempts = this.config.retryAttempts,
      customRetryDelay,
      retryCondition = (error) => error instanceof AppError ? isRetryableError(error) : true
    } = options;

    const connectionId = await this.acquireConnection();
    let lastError: Error;
    const startTime = Date.now();

    try {
      this.recordRequestStart(connectionId);

      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          const result = await operation();
          const responseTime = Date.now() - startTime;
          this.recordRequestSuccess(connectionId, responseTime);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt === retryAttempts) {
            break;
          }

          // Check if error is retryable
          if (!retryCondition(lastError)) {
            break;
          }

          // Calculate delay with jitter
          const baseDelay = customRetryDelay || this.state.currentRetryDelay;
          const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
          const delay = baseDelay * Math.pow(2, attempt) + jitter;
          const actualDelay = Math.min(delay, this.config.maxRetryDelay);

          console.warn(`Request failed (attempt ${attempt + 1}/${retryAttempts + 1}), retrying in ${actualDelay}ms:`, lastError.message);
          
          await new Promise(resolve => setTimeout(resolve, actualDelay));
        }
      }

      this.recordRequestFailure(connectionId, lastError!);
      throw lastError!;
    } finally {
      this.releaseConnection(connectionId);
    }
  }

  // Circuit breaker functionality
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private circuitBreakerFailureCount = 0;
  private circuitBreakerLastFailureTime = 0;
  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerTimeout = 60000; // 1 minute

  private shouldAllowRequest(): boolean {
    const now = Date.now();

    switch (this.circuitBreakerState) {
      case 'closed':
        return true;
      
      case 'open':
        if (now - this.circuitBreakerLastFailureTime > this.circuitBreakerTimeout) {
          this.circuitBreakerState = 'half-open';
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return true;
    }
  }

  private recordCircuitBreakerSuccess(): void {
    this.circuitBreakerFailureCount = 0;
    this.circuitBreakerState = 'closed';
  }

  private recordCircuitBreakerFailure(): void {
    this.circuitBreakerFailureCount++;
    this.circuitBreakerLastFailureTime = Date.now();

    if (this.circuitBreakerFailureCount >= this.circuitBreakerThreshold) {
      this.circuitBreakerState = 'open';
    }
  }

  async executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.shouldAllowRequest()) {
      throw new NetworkError('Circuit breaker is open - service temporarily unavailable');
    }

    try {
      const result = await operation();
      this.recordCircuitBreakerSuccess();
      return result;
    } catch (error) {
      this.recordCircuitBreakerFailure();
      throw error;
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.connectionPool.clear();
    this.activeRequests.clear();
    this.state.activeConnections = 0;
  }
}

// Export singleton instance
export const connectionManager = ConnectionManager.getInstance();