"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorReporter, AppError, formatErrorForUser, getErrorIcon, getErrorColor } from "@/lib/error-handler";

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Report error using our enhanced error handling system
    const reporter = ErrorReporter.getInstance();
    reporter.report(error, {
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} retry={this.handleReset} />;
      }

      const error = this.state.error;
      const isAppError = error instanceof AppError;
      const errorDisplay = isAppError ? formatErrorForUser(error) : {
        title: "Unexpected Error",
        message: "We apologize for the inconvenience. An unexpected error occurred while loading this page.",
        action: "Please try refreshing the page or go back to the homepage.",
        severity: "MEDIUM" as any,
        canRetry: true
      };

      const iconColor = isAppError ? getErrorColor(error.severity) : "#EF4444";

      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 text-center">
            <div className="mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${iconColor}20` }}
              >
                <span className="text-2xl">
                  {isAppError ? getErrorIcon(error.errorType) : "❌"}
                </span>
              </div>
              
              <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
                {errorDisplay.title}
              </h2>
              
              <p className="text-muted-olive mb-6">
                {errorDisplay.message}
              </p>

              {errorDisplay.action && (
                <p className="text-sm text-muted-olive mb-6 bg-gray-50 p-3 rounded">
                  <strong>What you can do:</strong> {errorDisplay.action}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {errorDisplay.canRetry && (
                <Button onClick={this.handleReset} className="w-full">
                  Try Again
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Go to Homepage
              </Button>

              {isAppError && error.requestId && (
                <p className="text-xs text-gray-500">
                  Error ID: {error.requestId}
                </p>
              )}
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-600 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-red-50 p-4 rounded overflow-auto text-red-800">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple error boundary for specific components
export function SimpleErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary fallback={fallback ? () => <>{fallback}</> : undefined}>
      {children}
    </ErrorBoundary>
  );
}