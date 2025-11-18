import React from 'react';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  userMessage?: string;
  recoveryAction?: string;
  retryable?: boolean;
  timestamp?: string;
  requestId?: string;
}

export interface ErrorContext {
  url?: string;
  method?: string;
  requestId?: string;
  userId?: string;
  userAgent?: string;
  timestamp: string;
  additionalData?: Record<string, any>;
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  AUTH = 'AUTH',
  PAYMENT = 'PAYMENT',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly details?: any;
  public readonly userMessage: string;
  public readonly recoveryAction: string;
  public readonly retryable: boolean;
  public readonly errorType: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number;
      details?: any;
      userMessage?: string;
      recoveryAction?: string;
      retryable?: boolean;
      errorType?: ErrorType;
      severity?: ErrorSeverity;
      requestId?: string;
    } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.userMessage = options.userMessage || this.getDefaultUserMessage(message);
    this.recoveryAction = options.recoveryAction || this.getDefaultRecoveryAction();
    this.retryable = options.retryable ?? false;
    this.errorType = options.errorType || ErrorType.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.timestamp = new Date().toISOString();
    this.requestId = options.requestId;
  }

  private getDefaultUserMessage(message: string): string {
    return "Something went wrong. Please try again.";
  }

  private getDefaultRecoveryAction(): string {
    return "Please refresh the page and try again. If the problem persists, contact support.";
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      userMessage: this.userMessage,
      code: this.code,
      status: this.status,
      errorType: this.errorType,
      severity: this.severity,
      retryable: this.retryable,
      recoveryAction: this.recoveryAction,
      timestamp: this.timestamp,
      requestId: this.requestId,
      details: this.details
    };
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network connection failed", requestId?: string) {
    super(message, {
      code: "NETWORK_ERROR",
      status: 0,
      userMessage: "Unable to connect to our servers. Please check your internet connection.",
      recoveryAction: "Check your internet connection and try again. If you're on a slow connection, please wait a moment and retry.",
      retryable: true,
      errorType: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      requestId
    });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends AppError {
  constructor(message = "Request timed out", requestId?: string) {
    super(message, {
      code: "TIMEOUT_ERROR",
      status: 408,
      userMessage: "The request is taking longer than expected.",
      recoveryAction: "Please try again. If you're on a slow connection, the request might need more time.",
      retryable: true,
      errorType: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      requestId
    });
    this.name = "TimeoutError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", requestId?: string) {
    super(message, {
      code: "AUTH_ERROR",
      status: 401,
      userMessage: "You need to sign in to access this feature.",
      recoveryAction: "Please sign in to your account. If you're already signed in, try refreshing the page.",
      retryable: false,
      errorType: ErrorType.AUTH,
      severity: ErrorSeverity.HIGH,
      requestId
    });
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied", requestId?: string) {
    super(message, {
      code: "AUTHORIZATION_ERROR",
      status: 403,
      userMessage: "You don't have permission to access this feature.",
      recoveryAction: "Contact support if you believe you should have access to this feature.",
      retryable: false,
      errorType: ErrorType.AUTH,
      severity: ErrorSeverity.HIGH,
      requestId
    });
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: any, requestId?: string) {
    super(message, {
      code: "VALIDATION_ERROR",
      status: 400,
      details,
      userMessage: "Please check your input and try again.",
      recoveryAction: "Review the highlighted fields and correct any errors before submitting.",
      retryable: false,
      errorType: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      requestId
    });
    this.name = "ValidationError";
  }
}

export class PaymentError extends AppError {
  constructor(message = "Payment processing failed", details?: any, requestId?: string) {
    super(message, {
      code: "PAYMENT_ERROR",
      status: 402,
      details,
      userMessage: "We couldn't process your payment.",
      recoveryAction: "Please check your payment details and try again. If the problem persists, try a different payment method or contact your bank.",
      retryable: true,
      errorType: ErrorType.PAYMENT,
      severity: ErrorSeverity.CRITICAL,
      requestId
    });
    this.name = "PaymentError";
  }
}

export class ServerError extends AppError {
  constructor(message = "Internal server error", status = 500, requestId?: string) {
    super(message, {
      code: "SERVER_ERROR",
      status,
      userMessage: "Something went wrong on our end.",
      recoveryAction: "Please try again in a few moments. If the problem persists, contact support.",
      retryable: true,
      errorType: ErrorType.SERVER,
      severity: ErrorSeverity.HIGH,
      requestId
    });
    this.name = "ServerError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", retryAfter?: number, requestId?: string) {
    const retryMessage = retryAfter 
      ? `Please wait ${Math.ceil(retryAfter / 1000)} seconds before trying again.`
      : "Please wait a moment before trying again.";
    
    super(message, {
      code: "RATE_LIMIT_ERROR",
      status: 429,
      userMessage: "You're making requests too quickly.",
      recoveryAction: retryMessage,
      retryable: true,
      errorType: ErrorType.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      requestId,
      details: { retryAfter }
    });
    this.name = "RateLimitError";
  }
}

export function handleApiError(error: any, context?: ErrorContext): AppError {
  const requestId = context?.requestId || error.config?.headers?.['X-Request-ID'] || generateRequestId();
  
  // Network errors (no response received)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new TimeoutError("Request timed out", requestId);
    }
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return new NetworkError("Network connection failed", requestId);
    }
    return new NetworkError("Unable to connect to server", requestId);
  }

  const { status, data, headers } = error.response;
  const message = data?.error?.message || data?.message || "An unexpected error occurred";
  const code = data?.error?.code || data?.code;
  const details = data?.error?.details || data?.details;
  const retryAfter = headers?.['retry-after'] ? parseInt(headers['retry-after']) * 1000 : undefined;

  switch (status) {
    case 400:
      return new ValidationError(message, details, requestId);
    case 401:
      return new AuthenticationError(message, requestId);
    case 403:
      return new AuthorizationError(message, requestId);
    case 402:
      return new PaymentError(message, details, requestId);
    case 404:
      return new AppError("The requested resource was not found", {
        code: "NOT_FOUND",
        status: 404,
        userMessage: "The page or resource you're looking for doesn't exist.",
        recoveryAction: "Check the URL and try again, or go back to the previous page.",
        retryable: false,
        errorType: ErrorType.CLIENT,
        severity: ErrorSeverity.LOW,
        requestId
      });
    case 409:
      return new AppError(message, {
        code: "CONFLICT",
        status: 409,
        details,
        userMessage: "There's a conflict with your request.",
        recoveryAction: "Please refresh the page and try again.",
        retryable: false,
        errorType: ErrorType.CLIENT,
        severity: ErrorSeverity.MEDIUM,
        requestId
      });
    case 422:
      return new ValidationError(message, details, requestId);
    case 429:
      return new RateLimitError(message, retryAfter, requestId);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, requestId);
    default:
      return new AppError(message, {
        code,
        status,
        details,
        userMessage: "An unexpected error occurred.",
        recoveryAction: "Please try again. If the problem persists, contact support.",
        retryable: status >= 500,
        errorType: status >= 500 ? ErrorType.SERVER : ErrorType.CLIENT,
        severity: status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        requestId
      });
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  return "An unexpected error occurred";
}

export function isRetryableError(error: AppError): boolean {
  return error.retryable || [0, 408, 429, 500, 502, 503, 504].includes(error.status || 0);
}

export function getRetryDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.floor(exponentialDelay + jitter);
}

export function shouldRetryError(error: AppError, attempt: number, maxRetries = 3): boolean {
  if (attempt >= maxRetries) return false;
  if (!isRetryableError(error)) return false;
  
  // Special handling for rate limit errors
  if (error instanceof RateLimitError) {
    const retryAfter = error.details?.retryAfter;
    if (retryAfter && retryAfter > 60000) return false; // Don't retry if wait is > 1 minute
  }
  
  return true;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryCondition?: (error: AppError, attempt: number) => boolean;
  onRetry?: (error: AppError, attempt: number, delay: number) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true,
    retryCondition = shouldRetryError,
    onRetry
  } = options;

  let lastError: AppError | undefined;
  const reporter = ErrorReporter.getInstance();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // Mark as resolved if this was a retry
      if (attempt > 0 && lastError) {
        reporter.markResolved(lastError);
      }
      
      return result;
    } catch (error) {
      const appError = error instanceof AppError ? error : handleApiError(error);
      lastError = appError;
      
      // Report the error
      reporter.report(appError);
      
      if (attempt === maxRetries) {
        break;
      }

      if (!retryCondition(appError, attempt)) {
        break;
      }

      // Calculate delay with exponential backoff and optional jitter
      let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
      
      if (jitter) {
        delay = delay + (Math.random() * 0.1 * delay); // Add up to 10% jitter
      }

      // Special handling for rate limit errors
      if (appError instanceof RateLimitError && appError.details?.retryAfter) {
        delay = Math.max(delay, appError.details.retryAfter);
      }

      // Notify about retry attempt
      onRetry?.(appError, attempt + 1, delay);
      reporter.incrementRetryCount(appError);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new AppError('Unknown error occurred during retry');
}

export function logError(error: Error, context?: ErrorContext) {
  const appError = error instanceof AppError ? error : null;
  
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(appError && {
      code: appError.code,
      status: appError.status,
      errorType: appError.errorType,
      severity: appError.severity,
      retryable: appError.retryable,
      requestId: appError.requestId,
      userMessage: appError.userMessage,
      recoveryAction: appError.recoveryAction,
      details: appError.details
    }),
    context: {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      ...context
    }
  };

  // Log with appropriate level based on severity
  const severity = appError?.severity || ErrorSeverity.MEDIUM;
  switch (severity) {
    case ErrorSeverity.LOW:
      console.info("Application Info:", errorInfo);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn("Application Warning:", errorInfo);
      break;
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      console.error("Application Error:", errorInfo);
      break;
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    // Send to analytics
    (window as any).gtag?.("event", "exception", {
      description: error.message,
      fatal: severity === ErrorSeverity.CRITICAL,
      custom_map: {
        error_type: appError?.errorType,
        error_code: appError?.code,
        request_id: appError?.requestId,
        severity: severity
      }
    });

    // Send to external monitoring service (e.g., Sentry)
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          errorType: appError?.errorType,
          severity: severity,
          retryable: appError?.retryable
        },
        extra: {
          requestId: appError?.requestId,
          userMessage: appError?.userMessage,
          recoveryAction: appError?.recoveryAction,
          context
        }
      });
    }
  }
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private errors: Array<{ 
    error: Error; 
    context?: ErrorContext; 
    timestamp: Date;
    resolved?: boolean;
    retryCount?: number;
  }> = [];
  private errorCounts: Map<string, number> = new Map();

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  report(error: Error, context?: ErrorContext) {
    const errorEntry = {
      error,
      context,
      timestamp: new Date(),
      resolved: false,
      retryCount: 0
    };

    this.errors.push(errorEntry);
    
    // Track error frequency
    const errorKey = this.getErrorKey(error);
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    logError(error, context);

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Alert if same error occurs frequently
    if (this.errorCounts.get(errorKey)! > 5) {
      this.alertFrequentError(error, this.errorCounts.get(errorKey)!);
    }
  }

  markResolved(error: Error) {
    const errorKey = this.getErrorKey(error);
    const errorEntry = this.errors.find(e => this.getErrorKey(e.error) === errorKey && !e.resolved);
    if (errorEntry) {
      errorEntry.resolved = true;
    }
  }

  incrementRetryCount(error: Error) {
    const errorKey = this.getErrorKey(error);
    const errorEntry = this.errors.find(e => this.getErrorKey(e.error) === errorKey && !e.resolved);
    if (errorEntry) {
      errorEntry.retryCount = (errorEntry.retryCount || 0) + 1;
    }
  }

  getRecentErrors(limit = 10) {
    return this.errors.slice(-limit);
  }

  getErrorsByType(errorType: ErrorType, limit = 10) {
    return this.errors
      .filter(e => e.error instanceof AppError && e.error.errorType === errorType)
      .slice(-limit);
  }

  getErrorStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = this.errors.filter(e => e.timestamp > oneHourAgo);
    
    const stats = {
      total: this.errors.length,
      lastHour: recentErrors.length,
      resolved: this.errors.filter(e => e.resolved).length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      mostFrequent: Array.from(this.errorCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };

    // Count by type and severity
    this.errors.forEach(({ error }) => {
      if (error instanceof AppError) {
        stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1;
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      }
    });

    return stats;
  }

  clearErrors() {
    this.errors = [];
    this.errorCounts.clear();
  }

  private getErrorKey(error: Error): string {
    if (error instanceof AppError) {
      return `${error.name}:${error.code}:${error.status}`;
    }
    return `${error.name}:${error.message}`;
  }

  private alertFrequentError(error: Error, count: number) {
    console.warn(`Frequent error detected: ${error.message} (${count} occurrences)`);
    
    // Could trigger additional monitoring alerts here
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
      (window as any).gtag?.("event", "frequent_error", {
        error_message: error.message,
        error_count: count,
        custom_map: {
          error_type: error instanceof AppError ? error.errorType : 'unknown'
        }
      });
    }
  }
}

// Utility functions for error handling
export function createErrorContext(
  url?: string,
  method?: string,
  userId?: string,
  additionalData?: Record<string, any>
): ErrorContext {
  return {
    url: url || (typeof window !== "undefined" ? window.location.href : undefined),
    method,
    requestId: generateRequestId(),
    userId,
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    additionalData
  };
}

export function formatErrorForUser(error: AppError): {
  title: string;
  message: string;
  action: string;
  severity: ErrorSeverity;
  canRetry: boolean;
} {
  return {
    title: getErrorTitle(error.errorType),
    message: error.userMessage,
    action: error.recoveryAction,
    severity: error.severity,
    canRetry: error.retryable
  };
}

function getErrorTitle(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return "Connection Problem";
    case ErrorType.SERVER:
      return "Server Error";
    case ErrorType.AUTH:
      return "Authentication Required";
    case ErrorType.PAYMENT:
      return "Payment Error";
    case ErrorType.VALIDATION:
      return "Invalid Input";
    case ErrorType.RATE_LIMIT:
      return "Too Many Requests";
    case ErrorType.TIMEOUT:
      return "Request Timeout";
    default:
      return "Error";
  }
}

export function getErrorIcon(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return "🌐";
    case ErrorType.SERVER:
      return "🔧";
    case ErrorType.AUTH:
      return "🔒";
    case ErrorType.PAYMENT:
      return "💳";
    case ErrorType.VALIDATION:
      return "⚠️";
    case ErrorType.RATE_LIMIT:
      return "⏱️";
    case ErrorType.TIMEOUT:
      return "⏰";
    default:
      return "❌";
  }
}

export function getErrorColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW:
      return "#3B82F6"; // blue
    case ErrorSeverity.MEDIUM:
      return "#F59E0B"; // amber
    case ErrorSeverity.HIGH:
      return "#EF4444"; // red
    case ErrorSeverity.CRITICAL:
      return "#DC2626"; // dark red
    default:
      return "#6B7280"; // gray
  }
}

// Error boundary helper
export function withErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
): React.ComponentType<T> {
  return function WrappedComponent(props: T) {
    // Note: ErrorBoundary should be imported from components/ErrorBoundary
    // This is a placeholder implementation
    return React.createElement(Component, props);
  };
}

// Hook for error handling in components
export function useErrorHandler() {
  const reporter = ErrorReporter.getInstance();
  
  const handleError = React.useCallback((error: Error, context?: Partial<ErrorContext>) => {
    const fullContext = createErrorContext(
      context?.url,
      context?.method,
      context?.userId,
      context?.additionalData
    );
    
    reporter.report(error, fullContext);
  }, [reporter]);

  const handleApiErrorCallback = React.useCallback((error: any, context?: Partial<ErrorContext>) => {
    const appError = handleApiError(error, context as ErrorContext);
    handleError(appError, context);
    return appError;
  }, [handleError]);

  return {
    handleError,
    handleApiError: handleApiErrorCallback,
    getRecentErrors: () => reporter.getRecentErrors(),
    getErrorStats: () => reporter.getErrorStats(),
    clearErrors: () => reporter.clearErrors()
  };
}

// Circuit Breaker Implementation
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeout?: number;
  monitoringPeriod?: number;
  expectedErrors?: (error: AppError) => boolean;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private successCount = 0;

  constructor(
    private name: string,
    private options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      expectedErrors: (error) => error.retryable,
      ...options
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new AppError(`Circuit breaker is OPEN for ${this.name}`, {
          code: 'CIRCUIT_BREAKER_OPEN',
          userMessage: 'This service is temporarily unavailable.',
          recoveryAction: 'Please try again in a few minutes.',
          retryable: false,
          errorType: ErrorType.SERVER,
          severity: ErrorSeverity.HIGH
        });
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      const appError = error instanceof AppError ? error : handleApiError(error);
      this.onFailure(appError);
      throw appError;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) { // Require 3 successful calls to close
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(error: AppError) {
    if (!this.options.expectedErrors!(error)) {
      return; // Don't count unexpected errors
    }

    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold!) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.recoveryTimeout!;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime ? Date.now() >= this.nextAttemptTime : false;
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
  }
}

// Circuit Breaker Manager
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private breakers: Map<string, CircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  getBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, options));
    }
    return this.breakers.get(name)!;
  }

  getAllBreakers(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  resetAll() {
    this.breakers.forEach(breaker => breaker.reset());
  }

  getStats() {
    const stats: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      stats[name] = breaker.getStats();
    });
    return stats;
  }
}

// Enhanced retry with circuit breaker
export async function withRetryAndCircuitBreaker<T>(
  fn: () => Promise<T>,
  circuitBreakerName: string,
  retryOptions: RetryOptions = {},
  circuitBreakerOptions: CircuitBreakerOptions = {}
): Promise<T> {
  const circuitBreaker = CircuitBreakerManager.getInstance()
    .getBreaker(circuitBreakerName, circuitBreakerOptions);

  return withRetry(
    () => circuitBreaker.execute(fn),
    retryOptions
  );
}

// Retry with backoff strategies
export enum BackoffStrategy {
  EXPONENTIAL = 'EXPONENTIAL',
  LINEAR = 'LINEAR',
  FIXED = 'FIXED',
  FIBONACCI = 'FIBONACCI'
}

export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  strategy: BackoffStrategy = BackoffStrategy.EXPONENTIAL,
  maxDelay: number = 30000,
  jitter: boolean = true
): number {
  let delay: number;

  switch (strategy) {
    case BackoffStrategy.LINEAR:
      delay = baseDelay * (attempt + 1);
      break;
    case BackoffStrategy.FIXED:
      delay = baseDelay;
      break;
    case BackoffStrategy.FIBONACCI:
      delay = baseDelay * fibonacci(attempt + 1);
      break;
    case BackoffStrategy.EXPONENTIAL:
    default:
      delay = baseDelay * Math.pow(2, attempt);
      break;
  }

  delay = Math.min(delay, maxDelay);

  if (jitter) {
    delay = delay + (Math.random() * 0.1 * delay);
  }

  return Math.floor(delay);
}

function fibonacci(n: number): number {
  if (n <= 1) return 1;
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// Bulk retry for multiple operations
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<{ success: boolean; result?: T; error?: AppError }>> {
  const results = await Promise.allSettled(
    operations.map(op => withRetry(op, options))
  );

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, result: result.value };
    } else {
      const error = result.reason instanceof AppError 
        ? result.reason 
        : handleApiError(result.reason);
      return { success: false, error };
    }
  });
}