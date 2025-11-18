'use client';

import React, { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CheckoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Checkout error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-charcoal-black mb-2">
                Checkout Error
              </h2>
              <p className="text-muted-olive mb-4">
                Something went wrong during checkout. Please try again or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-xs text-gray-600 bg-gray-50 p-2 rounded mb-4">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                </details>
              )}
            </div>
            
            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/cart'}
                className="w-full"
              >
                Return to Cart
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/contact'}
                className="w-full text-sm"
              >
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}