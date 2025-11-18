'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { checkoutAnalytics, CheckoutErrorType, CheckoutFunnelStage } from '@/lib/checkout-analytics';

interface CheckoutAnalyticsErrorBoundaryProps {
  children: ReactNode;
  currentStep?: number;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface CheckoutAnalyticsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
}

export class CheckoutAnalyticsErrorBoundary extends Component<
  CheckoutAnalyticsErrorBoundaryProps,
  CheckoutAnalyticsErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: CheckoutAnalyticsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<CheckoutAnalyticsErrorBoundaryState> {
    const errorId = `checkout_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { currentStep = 0, onError } = this.props;
    const stage = this.getStageFromStep(currentStep);

    // Track error with analytics
    checkoutAnalytics.trackCheckoutError(
      this.categorizeError(error),
      stage,
      error.message,
      {
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        errorStack: error.stack,
        currentStep,
        retryCount: this.state.retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    );

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to console for debugging
    console.error('Checkout Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId: this.state.errorId,
      currentStep,
      stage
    });
  }

  private getStageFromStep(step: number): CheckoutFunnelStage {
    switch (step) {
      case 1: return CheckoutFunnelStage.SHIPPING_ADDRESS;
      case 2: return CheckoutFunnelStage.SHIPPING_METHOD;
      case 3: return CheckoutFunnelStage.PAYMENT_METHOD;
      case 4: return CheckoutFunnelStage.ORDER_REVIEW;
      case 5: return CheckoutFunnelStage.ORDER_COMPLETE;
      default: return CheckoutFunnelStage.CHECKOUT_START;
    }
  }

  private categorizeError(error: Error): CheckoutErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return CheckoutErrorType.NETWORK_ERROR;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return CheckoutErrorType.VALIDATION_ERROR;
    }
    
    if (message.includes('payment') || message.includes('transaction')) {
      return CheckoutErrorType.PAYMENT_ERROR;
    }
    
    if (message.includes('timeout') || message.includes('time out')) {
      return CheckoutErrorType.TIMEOUT_ERROR;
    }
    
    return CheckoutErrorType.SERVER_ERROR;
  }

  private handleRetry = () => {
    const { currentStep = 0 } = this.props;
    const stage = this.getStageFromStep(currentStep);

    // Track retry attempt
    checkoutAnalytics.trackRetryAttempt(stage, 'error_boundary_retry', {
      errorId: this.state.errorId,
      retryCount: this.state.retryCount + 1,
      errorType: this.state.error ? this.categorizeError(this.state.error) : 'unknown'
    });

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReportError = () => {
    const { currentStep = 0 } = this.props;
    const stage = this.getStageFromStep(currentStep);

    // Track error report
    checkoutAnalytics.trackFormInteraction('error_report', 'submit', {
      errorId: this.state.errorId,
      currentStep,
      stage,
      errorMessage: this.state.error?.message
    });

    // In a real implementation, this would send the error to a reporting service
    alert('Error reported. Our team will investigate this issue.');
  };

  private handleGoBack = () => {
    const { currentStep = 0 } = this.props;
    const stage = this.getStageFromStep(currentStep);

    // Track navigation away from error
    checkoutAnalytics.trackFormInteraction('error_navigation', 'go_back', {
      errorId: this.state.errorId,
      currentStep,
      stage
    });

    // Navigate back or reload
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback, currentStep = 0 } = this.props;
      const canRetry = this.state.retryCount < this.maxRetries;
      const errorType = this.state.error ? this.categorizeError(this.state.error) : 'unknown';

      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-charcoal-black mb-2">
                Oops! Something went wrong
              </h2>
              
              <p className="text-muted-olive mb-4">
                {errorType === CheckoutErrorType.NETWORK_ERROR && 
                  "We're having trouble connecting to our servers. Please check your internet connection and try again."
                }
                {errorType === CheckoutErrorType.PAYMENT_ERROR && 
                  "There was an issue processing your payment. Please try again or use a different payment method."
                }
                {errorType === CheckoutErrorType.VALIDATION_ERROR && 
                  "Some information needs to be corrected. Please review your details and try again."
                }
                {errorType === CheckoutErrorType.TIMEOUT_ERROR && 
                  "The request took too long to complete. Please try again."
                }
                {errorType === CheckoutErrorType.SERVER_ERROR && 
                  "We're experiencing technical difficulties. Our team has been notified."
                }
              </p>

              <div className="text-xs text-gray-500 mb-6">
                Error ID: {this.state.errorId}
                {this.state.retryCount > 0 && ` (Attempt ${this.state.retryCount + 1})`}
              </div>
            </div>

            <div className="space-y-3">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-burgundy text-ivory hover:bg-opacity-90"
                >
                  Try Again
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={this.handleGoBack}
                className="w-full"
              >
                Go Back
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleReportError}
                className="w-full text-sm"
              >
                Report This Issue
              </Button>
            </div>

            {!canRetry && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Multiple attempts failed. Please contact support or try again later.
                </p>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}