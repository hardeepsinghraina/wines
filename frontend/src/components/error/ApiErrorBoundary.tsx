'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConnectionStatusIndicator } from '@/components/connection/ConnectionStatusIndicator';
import { ErrorReporter, AppError, formatErrorForUser } from '@/lib/error-handler';

interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; isApiError: boolean }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryAction?: () => Promise<void>;
  context?: string; // e.g., 'product-loading', 'checkout', 'user-profile'
}

interface ApiErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRetrying: boolean;
  retryCount: number;
}

export class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isRetrying: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ApiErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ApiErrorBoundary caught an error:', error, errorInfo);
    
    // Report API-specific errors with additional context
    const reporter = ErrorReporter.getInstance();
    reporter.report(error, {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'ApiErrorBoundary',
        context: this.props.context,
        retryCount: this.state.retryCount,
        isApiError: this.isApiError(error)
      }
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private isApiError = (error: Error): boolean => {
    // Check if error is related to API calls
    return (
      error instanceof AppError ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('API') ||
      error.message.includes('timeout') ||
      error.message.includes('connection') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError' && error.message.includes('Failed to fetch')
    );
  };

  private handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    try {
      // Use custom retry action if provided, otherwise just reset the boundary
      if (this.props.retryAction) {
        await this.props.retryAction();
      }
      
      // Reset the error boundary after successful retry
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRetrying: false,
        retryCount: this.state.retryCount + 1
      });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({
        isRetrying: false,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  private handleAutoRetry = () => {
    if (this.state.retryCount >= this.maxRetries || !this.isApiError(this.state.error!)) {
      return;
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, this.state.retryCount) * 1000;
    
    const timeout = setTimeout(() => {
      this.handleRetry();
    }, delay);

    this.retryTimeouts.push(timeout);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      isRetrying: false,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const isApiError = this.isApiError(this.state.error);
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return (
          <this.props.fallback 
            error={this.state.error} 
            retry={this.handleRetry}
            isApiError={isApiError}
          />
        );
      }

      // Default API error UI
      return (
        <ApiErrorFallback
          error={this.state.error}
          isApiError={isApiError}
          isRetrying={this.state.isRetrying}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          context={this.props.context}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ApiErrorFallbackProps {
  error: Error;
  isApiError: boolean;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  context?: string;
  onRetry: () => void;
  onReset: () => void;
}

function ApiErrorFallback({
  error,
  isApiError,
  isRetrying,
  retryCount,
  maxRetries,
  context,
  onRetry,
  onReset
}: ApiErrorFallbackProps) {
  const errorDisplay = error instanceof AppError 
    ? formatErrorForUser(error)
    : {
        title: isApiError ? 'Connection Problem' : 'Something went wrong',
        message: isApiError 
          ? 'We\'re having trouble connecting to our servers. This might be a temporary network issue.'
          : 'An unexpected error occurred. Please try again.',
        action: isApiError 
          ? 'Check your internet connection and try again.'
          : 'If the problem persists, please contact support.',
        severity: 'MEDIUM' as any,
        canRetry: true
      };

  const getContextualMessage = () => {
    if (!context) return errorDisplay.message;
    
    const contextMessages: Record<string, string> = {
      'product-loading': 'We couldn\'t load the product information. Please check your connection and try again.',
      'checkout': 'There was a problem processing your order. Your payment has not been charged.',
      'user-profile': 'We couldn\'t load your profile information. Please try refreshing the page.',
      'cart': 'We couldn\'t update your cart. Please try again.',
      'search': 'We couldn\'t complete your search. Please try again.',
      'payment': 'There was a problem with the payment process. Please try again or contact support.'
    };

    return contextMessages[context] || errorDisplay.message;
  };

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-6 text-center">
        {/* Connection Status */}
        {isApiError && (
          <div className="mb-4 flex justify-center">
            <ConnectionStatusIndicator showDetails={false} size="lg" />
          </div>
        )}

        {/* Error Icon */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <span className="text-2xl">
              {isApiError ? '🌐' : '❌'}
            </span>
          </div>
        </div>

        {/* Error Title */}
        <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
          {errorDisplay.title}
        </h3>

        {/* Error Message */}
        <p className="text-muted-olive mb-4">
          {getContextualMessage()}
        </p>

        {/* Retry Information */}
        {isApiError && retryCount > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {errorDisplay.canRetry && retryCount < maxRetries && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Retrying...</span>
                </div>
              ) : (
                'Try Again'
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            Reset
          </Button>

          {isApiError && (
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="w-full text-sm"
            >
              Refresh Page
            </Button>
          )}
        </div>

        {/* Error ID for support */}
        {error instanceof AppError && error.requestId && (
          <p className="text-xs text-gray-400 mt-4">
            Error ID: {error.requestId}
          </p>
        )}

        {/* Development Details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-gray-500">
              Debug Info
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
}

// Specialized error boundaries for specific contexts
export function ProductErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ApiErrorBoundary context="product-loading">
      {children}
    </ApiErrorBoundary>
  );
}

export function CheckoutErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ApiErrorBoundary context="checkout">
      {children}
    </ApiErrorBoundary>
  );
}

export function PaymentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ApiErrorBoundary context="payment">
      {children}
    </ApiErrorBoundary>
  );
}

export function CartErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ApiErrorBoundary context="cart">
      {children}
    </ApiErrorBoundary>
  );
}