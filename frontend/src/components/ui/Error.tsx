'use client';

import React from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Wine
} from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

export interface ErrorProps {
  variant?: 'error' | 'warning' | 'info' | 'network' | '404' | '500';
  title?: string;
  message?: string;
  details?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  onBack?: () => void;
  fullPage?: boolean;
  className?: string;
}

export const Error: React.FC<ErrorProps> = ({
  variant = 'error',
  title,
  message,
  details,
  showRetry = false,
  showHome = false,
  showBack = false,
  onRetry,
  onHome,
  onBack,
  fullPage = false,
  className = '',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="h-12 w-12 text-blue-500" />;
      case 'network':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case '404':
        return <Wine className="h-12 w-12 text-burgundy" />;
      case '500':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'network':
        return 'Connection Error';
      case '404':
        return 'Wine Not Found';
      case '500':
        return 'Server Error';
      default:
        return 'Error';
    }
  };

  const getDefaultMessage = () => {
    switch (variant) {
      case 'warning':
        return 'Please review the information and try again.';
      case 'info':
        return 'Here\'s some information you should know.';
      case 'network':
        return 'Unable to connect to our servers. Please check your internet connection.';
      case '404':
        return 'The wine you\'re looking for seems to have been enjoyed already. Let\'s find you another bottle.';
      case '500':
        return 'Our wine cellar is temporarily unavailable. Our sommelier is working to fix this.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'network':
        return 'border-red-200 bg-red-50';
      case '404':
        return 'border-burgundy/20 bg-ivory';
      case '500':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  const errorTitle = title || getDefaultTitle();
  const errorMessage = message || getDefaultMessage();

  const content = (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Icon */}
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h2 className="font-display font-semibold text-heading-lg text-charcoal">
          {errorTitle}
        </h2>
        
        <p className="text-body-md text-olive max-w-md leading-relaxed">
          {errorMessage}
        </p>

        {details && (
          <details className="mt-4">
            <summary className="cursor-pointer text-body-sm text-olive hover:text-burgundy transition-colors">
              Show technical details
            </summary>
            <div className="mt-2 p-3 bg-charcoal/5 rounded-lg text-left">
              <code className="text-body-sm text-charcoal font-mono break-all">
                {details}
              </code>
            </div>
          </details>
        )}
      </div>

      {/* Actions */}
      {(showRetry || showHome || showBack) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {showRetry && onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          )}
          
          {showHome && onHome && (
            <Button
              variant="outline"
              onClick={onHome}
              leftIcon={<Home className="h-4 w-4" />}
            >
              Go Home
            </Button>
          )}
          
          {showBack && onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Go Back
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 bg-ivory ${className}`}>
        <Card variant="luxury" padding="xl" className="max-w-lg w-full">
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card 
      variant="outlined" 
      padding="lg" 
      className={`${getVariantStyles()} ${className}`}
    >
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

// Inline Error Component (for forms, etc.)
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className = '',
}) => (
  <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
    <XCircle className="h-4 w-4 flex-shrink-0" />
    <span className="text-body-sm">{message}</span>
  </div>
);

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} />;
      }

      return (
        <Error
          variant="500"
          title="Something went wrong"
          message="An unexpected error occurred. Please refresh the page or try again later."
          details={this.state.error?.message}
          showRetry
          onRetry={() => window.location.reload()}
          fullPage
        />
      );
    }

    return this.props.children;
  }
}

// Network Error Component
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Error
    variant="network"
    title="Connection Problem"
    message="We're having trouble connecting to our wine cellar. Please check your internet connection and try again."
    showRetry
    onRetry={onRetry}
  />
);

// 404 Error Component
export const NotFoundError: React.FC<{ 
  resource?: string;
  onHome?: () => void;
  onBack?: () => void;
}> = ({ 
  resource = 'wine',
  onHome,
  onBack 
}) => (
  <Error
    variant="404"
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
    message={`The ${resource} you're looking for seems to have been enjoyed already. Let's find you something else.`}
    showHome
    showBack
    onHome={onHome}
    onBack={onBack}
    fullPage
  />
);

export default Error;