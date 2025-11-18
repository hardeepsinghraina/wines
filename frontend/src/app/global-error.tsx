'use client';

import { useEffect } from 'react';
import { ErrorReporter } from '@/lib/error-handler';

export default function GlobalError({
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
        globalErrorHandler: true,
        critical: true
      }
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We apologize for the inconvenience. A critical error occurred while loading the application.
              </p>

              {error.digest && (
                <p className="text-xs text-gray-400 mb-6">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-600 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-red-50 p-4 rounded overflow-auto text-red-800">
                  {error.toString()}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
