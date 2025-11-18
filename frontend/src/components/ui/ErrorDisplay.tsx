'use client';

import React from 'react';
import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  formatErrorForUser, 
  getErrorIcon, 
  getErrorColor 
} from '@/lib/error-handler';
import { Button } from './Button';
import { Card } from './Card';
import { ConnectionStatusIndicator } from '@/components/connection/ConnectionStatusIndicator';
import { useConnection } from '@/contexts/ConnectionContext';

export interface ErrorDisplayProps {
  error: Error | AppError | string;
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  showRetry?: boolean;
  showDismiss?: boolean;
  showHome?: boolean;
  showConnectionStatus?: boolean;
  variant?: 'inline' | 'card' | 'fullpage';
  className?: string;
}

export function ErrorDisplay({
  error,
  title,
  message,
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = false,
  showHome = false,
  showConnectionStatus = false,
  variant = 'card',
  className = ''
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const { reconnect } = useConnection();

  // Convert error to AppError if needed
  const appError = React.useMemo(() => {
    if (typeof error === 'string') {
      return new AppError(error);
    }
    if (error instanceof AppError) {
      return error;
    }
    // Convert generic Error to AppError
    return new AppError(error.message, {
      errorType: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryable: false
    });
  }, [error]);

  const errorDisplay = formatErrorForUser(appError);
  const displayTitle = title || errorDisplay.title;
  const displayMessage = message || errorDisplay.message;
  const canRetry = showRetry && (onRetry || errorDisplay.canRetry);
  const iconColor = getErrorColor(errorDisplay.severity);
  const icon = getErrorIcon(appError.errorType);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      // If it's a network error, try reconnecting first
      if (appError.errorType === ErrorType.NETWORK) {
        await reconnect();
      }
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const renderContent = () => (
    <>
      {/* Connection Status */}
      {showConnectionStatus && appError.errorType === ErrorType.NETWORK && (
        <div className="mb-4 flex justify-center">
          <ConnectionStatusIndicator showDetails={false} size="lg" />
        </div>
      )}

      {/* Error Icon */}
      <div className="mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>

      {/* Error Title */}
      <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
        {displayTitle}
      </h3>

      {/* Error Message */}
      <p className="text-muted-olive mb-4">
        {displayMessage}
      </p>

      {/* Recovery Action */}
      {errorDisplay.action && (
        <p className="text-sm text-muted-olive mb-4 bg-gray-50 p-3 rounded">
          <strong>What you can do:</strong> {errorDisplay.action}
        </p>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {canRetry && (
          <Button
            onClick={handleRetry}
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

        {showDismiss && onDismiss && (
          <Button
            variant="outline"
            onClick={onDismiss}
            className="w-full"
          >
            Dismiss
          </Button>
        )}

        {showHome && (
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Homepage
          </Button>
        )}
      </div>

      {/* Error ID for support */}
      {appError.requestId && (
        <p className="text-xs text-gray-400 mt-4">
          Error ID: {appError.requestId}
        </p>
      )}

      {/* Development Details */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-gray-500">
            Debug Info
          </summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(appError.toJSON(), null, 2)}
          </pre>
        </details>
      )}
    </>
  );

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={`flex items-start space-x-3 p-4 rounded-lg border ${getSeverityStyles(errorDisplay.severity)} ${className}`}>
        <div className="flex-shrink-0 mt-0.5">
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-charcoal-black mb-1">
            {displayTitle}
          </h4>
          <p className="text-sm text-muted-olive">
            {displayMessage}
          </p>
          {canRetry && (
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-2"
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          )}
        </div>
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card className={`p-6 text-center ${className}`}>
        {renderContent()}
      </Card>
    );
  }

  // Fullpage variant
  return (
    <div className={`min-h-screen bg-ivory flex items-center justify-center p-4 ${className}`}>
      <Card className="max-w-lg w-full p-8 text-center">
        {renderContent()}
      </Card>
    </div>
  );
}

function getSeverityStyles(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'bg-blue-50 border-blue-200';
    case ErrorSeverity.MEDIUM:
      return 'bg-yellow-50 border-yellow-200';
    case ErrorSeverity.HIGH:
      return 'bg-orange-50 border-orange-200';
    case ErrorSeverity.CRITICAL:
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}

// Specialized error display components
export function NetworkErrorDisplay({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error={new AppError('Network connection failed', {
        errorType: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        retryable: true
      })}
      onRetry={onRetry}
      showConnectionStatus={true}
      className={className}
    />
  );
}

export function AuthErrorDisplay({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error={new AppError('Authentication required', {
        errorType: ErrorType.AUTH,
        severity: ErrorSeverity.HIGH,
        retryable: false
      })}
      onRetry={onRetry}
      showHome={true}
      className={className}
    />
  );
}

export function PaymentErrorDisplay({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error={new AppError('Payment processing failed', {
        errorType: ErrorType.PAYMENT,
        severity: ErrorSeverity.CRITICAL,
        retryable: true
      })}
      onRetry={onRetry}
      className={className}
    />
  );
}

export function ValidationErrorDisplay({ 
  message, 
  onDismiss, 
  className 
}: { 
  message: string; 
  onDismiss?: () => void; 
  className?: string;
}) {
  return (
    <ErrorDisplay
      error={new AppError(message, {
        errorType: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        retryable: false
      })}
      variant="inline"
      showRetry={false}
      showDismiss={true}
      onDismiss={onDismiss}
      className={className}
    />
  );
}

export function ServerErrorDisplay({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  return (
    <ErrorDisplay
      error={new AppError('Internal server error', {
        errorType: ErrorType.SERVER,
        severity: ErrorSeverity.HIGH,
        retryable: true
      })}
      onRetry={onRetry}
      showHome={true}
      className={className}
    />
  );
}
