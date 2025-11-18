'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { AppError, ErrorType, ErrorSeverity, ErrorReporter } from '@/lib/error-handler';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    const reporter = ErrorReporter.getInstance();
    reporter.report(error, {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      additionalData: {
        digest: error.digest,
        globalErrorHandler: true
      }
    });
  }, [error]);

  // Convert to AppError if needed
  const appError = error instanceof AppError 
    ? error 
    : new AppError(error.message || 'An unexpected error occurred', {
        errorType: ErrorType.UNKNOWN,
        severity: ErrorSeverity.HIGH,
        retryable: true
      });

  return (
    <ErrorDisplay
      error={appError}
      onRetry={reset}
      showHome={true}
      variant="fullpage"
    />
  );
}
