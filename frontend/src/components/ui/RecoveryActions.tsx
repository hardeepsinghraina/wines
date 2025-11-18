'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConnectionStatusIndicator } from '@/components/connection/ConnectionStatusIndicator';
import { useConnection } from '@/contexts/ConnectionContext';

interface RecoveryActionsProps {
  error?: Error;
  onRetry?: () => Promise<void>;
  onReset?: () => void;
  onGoHome?: () => void;
  context?: string;
  className?: string;
}

export function RecoveryActions({
  error,
  onRetry,
  onReset,
  onGoHome,
  context,
  className = ''
}: RecoveryActionsProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const { reconnect } = useConnection();

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleReconnect = async () => {
    setIsRetrying(true);
    try {
      await reconnect();
    } catch (reconnectError) {
      console.error('Reconnect failed:', reconnectError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getContextualActions = () => {
    const actions = [];

    // Always show retry if available
    if (onRetry) {
      actions.push(
        <Button
          key="retry"
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
      );
    }

    // Connection-specific actions
    if (error?.message.includes('network') || error?.message.includes('fetch')) {
      actions.push(
        <Button
          key="reconnect"
          variant="outline"
          onClick={handleReconnect}
          disabled={isRetrying}
          className="w-full"
        >
          Check Connection
        </Button>
      );
    }

    // Context-specific actions
    switch (context) {
      case 'checkout':
        actions.push(
          <Button
            key="cart"
            variant="outline"
            onClick={() => window.location.href = '/cart'}
            className="w-full"
          >
            Return to Cart
          </Button>
        );
        break;
      
      case 'product-loading':
        actions.push(
          <Button
            key="products"
            variant="outline"
            onClick={() => window.location.href = '/products'}
            className="w-full"
          >
            Browse All Products
          </Button>
        );
        break;
      
      case 'payment':
        actions.push(
          <Button
            key="payment-help"
            variant="outline"
            onClick={() => window.location.href = '/contact'}
            className="w-full"
          >
            Contact Support
          </Button>
        );
        break;
    }

    // Reset action
    if (onReset) {
      actions.push(
        <Button
          key="reset"
          variant="ghost"
          onClick={onReset}
          className="w-full"
        >
          Reset
        </Button>
      );
    }

    // Home action
    actions.push(
      <Button
        key="home"
        variant="ghost"
        onClick={onGoHome || (() => window.location.href = '/')}
        className="w-full"
      >
        Go to Homepage
      </Button>
    );

    return actions;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {getContextualActions()}
    </div>
  );
}

interface ConnectionRecoveryProps {
  onRetry?: () => Promise<void>;
  className?: string;
}

export function ConnectionRecovery({ onRetry, className = '' }: ConnectionRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const { reconnect, connectionState } = useConnection();

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await reconnect();
      if (onRetry) {
        await onRetry();
      }
    } catch (error) {
      console.error('Connection recovery failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className={`p-6 text-center ${className}`}>
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🌐</span>
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
          Connection Problem
        </h3>
        <p className="text-muted-olive mb-4">
          We're having trouble connecting to our servers. This might be a temporary network issue.
        </p>
      </div>

      <div className="mb-4">
        <ConnectionStatusIndicator showDetails={true} />
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full"
        >
          {isRetrying ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Reconnecting...</span>
            </div>
          ) : (
            'Retry Connection'
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Refresh Page
        </Button>

        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Go to Homepage
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>If the problem persists, please check your internet connection or contact support.</p>
      </div>
    </Card>
  );
}

interface OfflineRecoveryProps {
  cachedData?: any;
  onUseCache?: () => void;
  className?: string;
}

export function OfflineRecovery({ 
  cachedData, 
  onUseCache, 
  className = '' 
}: OfflineRecoveryProps) {
  return (
    <Card className={`p-6 text-center ${className}`}>
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📱</span>
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
          You're Offline
        </h3>
        <p className="text-muted-olive mb-4">
          You're currently offline. Some features may not be available.
        </p>
      </div>

      <div className="space-y-3">
        {cachedData && onUseCache && (
          <Button
            onClick={onUseCache}
            className="w-full"
          >
            Use Cached Data
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Try Again
        </Button>

        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Go to Homepage
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>We'll automatically retry when your connection is restored.</p>
      </div>
    </Card>
  );
}

interface ErrorRecoveryGuideProps {
  errorType?: string;
  className?: string;
}

export function ErrorRecoveryGuide({ errorType, className = '' }: ErrorRecoveryGuideProps) {
  const getGuideContent = () => {
    switch (errorType) {
      case 'network':
        return {
          title: 'Network Connection Issues',
          steps: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable any VPN or proxy',
            'Clear your browser cache',
            'Contact support if the issue persists'
          ]
        };
      
      case 'timeout':
        return {
          title: 'Request Timeout',
          steps: [
            'Check your internet speed',
            'Try again in a few moments',
            'Close other browser tabs',
            'Restart your browser',
            'Contact support if timeouts continue'
          ]
        };
      
      case 'server':
        return {
          title: 'Server Error',
          steps: [
            'Wait a few minutes and try again',
            'Check our status page for updates',
            'Clear your browser cache',
            'Try using a different browser',
            'Contact support with error details'
          ]
        };
      
      default:
        return {
          title: 'Troubleshooting Steps',
          steps: [
            'Refresh the page',
            'Check your internet connection',
            'Clear browser cache and cookies',
            'Try using a different browser',
            'Contact support if the problem continues'
          ]
        };
    }
  };

  const guide = getGuideContent();

  return (
    <Card className={`p-6 ${className}`}>
      <h4 className="font-heading text-lg font-bold text-charcoal-black mb-4">
        {guide.title}
      </h4>
      
      <ol className="space-y-2 text-sm text-muted-olive">
        {guide.steps.map((step, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-wine-red text-white rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}