import { AppError, AuthenticationError, logError } from './error-handler';

export interface RequestInterceptorConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  requestId: string;
}

export interface ResponseInterceptorConfig {
  url: string;
  method: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  responseTime: number;
  requestId: string;
}

export type RequestInterceptor = (config: RequestInterceptorConfig) => RequestInterceptorConfig | Promise<RequestInterceptorConfig>;
export type ResponseInterceptor = (config: ResponseInterceptorConfig, response: Response) => Response | Promise<Response>;
export type ErrorInterceptor = (error: Error, config: RequestInterceptorConfig) => Error | Promise<Error>;

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  async processRequest(config: RequestInterceptorConfig): Promise<RequestInterceptorConfig> {
    let processedConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      try {
        processedConfig = await interceptor(processedConfig);
      } catch (error) {
        console.error('Request interceptor error:', error);
        // Continue with other interceptors
      }
    }
    
    return processedConfig;
  }

  async processResponse(config: ResponseInterceptorConfig, response: Response): Promise<Response> {
    let processedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        processedResponse = await interceptor(config, processedResponse);
      } catch (error) {
        console.error('Response interceptor error:', error);
        // Continue with other interceptors
      }
    }
    
    return processedResponse;
  }

  async processError(error: Error, config: RequestInterceptorConfig): Promise<Error> {
    let processedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      try {
        processedError = await interceptor(processedError, config);
      } catch (interceptorError) {
        console.error('Error interceptor error:', interceptorError);
        // Continue with original error
      }
    }
    
    return processedError;
  }
}

// Default interceptors
export const createAuthInterceptor = (getAuthToken: () => string | null): RequestInterceptor => {
  return (config) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };
};

export const createLoggingInterceptor = (): RequestInterceptor => {
  return (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method} ${config.url}`, {
        requestId: config.requestId,
        headers: config.headers,
        timestamp: new Date(config.timestamp).toISOString(),
      });
    }
    return config;
  };
};

export const createResponseLoggingInterceptor = (): ResponseInterceptor => {
  return (config, response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${config.method} ${config.url} - ${config.status}`, {
        requestId: config.requestId,
        responseTime: `${config.responseTime}ms`,
        status: config.status,
        statusText: config.statusText,
      });
    }
    return response;
  };
};

export const createErrorLoggingInterceptor = (): ErrorInterceptor => {
  return (error, config) => {
    logError(error, {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString(),
    });
    return error;
  };
};

export const createTokenRefreshInterceptor = (
  refreshToken: () => Promise<string>,
  setAuthToken: (token: string) => void
): ErrorInterceptor => {
  return async (error, config) => {
    if (error instanceof AuthenticationError && error.status === 401) {
      try {
        const newToken = await refreshToken();
        setAuthToken(newToken);
        
        // Update the request config with new token
        config.headers.Authorization = `Bearer ${newToken}`;
        
        // Return a special error that indicates retry is needed
        const retryError = new Error('TOKEN_REFRESHED_RETRY_NEEDED');
        (retryError as any).shouldRetry = true;
        (retryError as any).updatedConfig = config;
        return retryError;
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return error;
      }
    }
    return error;
  };
};

export const createRetryInterceptor = (maxRetries = 3): ErrorInterceptor => {
  const retryCount = new Map<string, number>();
  
  return (error, config) => {
    const currentRetries = retryCount.get(config.requestId) || 0;
    
    if (currentRetries < maxRetries && isRetryableError(error)) {
      retryCount.set(config.requestId, currentRetries + 1);
      
      const retryError = new Error('RETRY_NEEDED');
      (retryError as any).shouldRetry = true;
      (retryError as any).retryAttempt = currentRetries + 1;
      (retryError as any).originalError = error;
      return retryError;
    }
    
    // Clean up retry count
    retryCount.delete(config.requestId);
    return error;
  };
};

function isRetryableError(error: Error): boolean {
  if (error instanceof AppError) {
    return [0, 408, 429, 500, 502, 503, 504].includes(error.status || 0);
  }
  
  // Network errors are retryable
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return true;
  }
  
  return false;
}

// Timeout configuration for different endpoint types
export interface TimeoutConfig {
  default: number;
  payment: number;
  upload: number;
  search: number;
  auth: number;
}

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  default: 30000,    // 30 seconds
  payment: 60000,    // 60 seconds for payment processing
  upload: 120000,    // 2 minutes for file uploads
  search: 15000,     // 15 seconds for search queries
  auth: 20000,       // 20 seconds for authentication
};

export function getTimeoutForEndpoint(endpoint: string, config: TimeoutConfig = DEFAULT_TIMEOUT_CONFIG): number {
  if (endpoint.includes('/payment')) {
    return config.payment;
  }
  
  if (endpoint.includes('/upload') || endpoint.includes('/import')) {
    return config.upload;
  }
  
  if (endpoint.includes('/search') || endpoint.includes('/products')) {
    return config.search;
  }
  
  if (endpoint.includes('/auth') || endpoint.includes('/login') || endpoint.includes('/register')) {
    return config.auth;
  }
  
  return config.default;
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Headers utility
export function createDefaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Add client info
  if (typeof window !== 'undefined') {
    headers['X-Client-Version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    headers['X-Client-Platform'] = 'web';
    headers['X-User-Agent'] = navigator.userAgent;
  }

  return headers;
}