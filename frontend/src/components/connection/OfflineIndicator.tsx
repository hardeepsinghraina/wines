'use client';

import React, { useEffect, useState } from 'react';
import { useConnection, useIsOnline } from '@/contexts/ConnectionContext';
import { Button } from '@/components/ui/Button';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showRetry?: boolean;
  className?: string;
}

export function OfflineIndicator({ 
  position = 'top', 
  showRetry = true,
  className = '' 
}: OfflineIndicatorProps) {
  const isOnline = useIsOnline();
  const { reconnect } = useConnection();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  // Show indicator with a slight delay to avoid flashing
  useEffect(() => {
    if (!isOnline) {
      const timer = setTimeout(() => setShowIndicator(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowIndicator(false);
    }
  }, [isOnline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!showIndicator) return null;

  const positionClasses = position === 'top' 
    ? 'top-0 border-b' 
    : 'bottom-0 border-t';

  return (
    <div 
      className={`fixed left-0 right-0 ${positionClasses} bg-yellow-50 border-yellow-200 z-50 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-lg">📱</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                You're currently offline
              </p>
              <p className="text-xs text-yellow-700">
                Some features may not be available. We'll reconnect automatically when your connection is restored.
              </p>
            </div>
          </div>
          
          {showRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4 flex-shrink-0"
            >
              {isRetrying ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Retrying...</span>
                </div>
              ) : (
                'Retry'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const isOnline = useIsOnline();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Show reconnected message briefly
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (showReconnected) {
    return (
      <div 
        className={`fixed top-0 left-0 right-0 bg-green-50 border-b border-green-200 z-50 ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-sm">✓</span>
            </div>
            <p className="text-sm font-semibold text-green-900">
              You're back online!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return <OfflineIndicator position="top" className={className} />;
  }

  return null;
}

interface OfflineModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onRetry?: () => void;
}

export function OfflineModal({ isOpen, onClose, onRetry }: OfflineModalProps) {
  const { reconnect } = useConnection();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await reconnect();
      if (onRetry) {
        await onRetry();
      }
      onClose?.();
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📱</span>
          </div>
          
          <h2 className="text-xl font-bold text-charcoal-black mb-2">
            You're Offline
          </h2>
          
          <p className="text-muted-olive mb-6">
            It looks like you've lost your internet connection. Some features may not work until you're back online.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking Connection...</span>
                </div>
              ) : (
                'Check Connection'
              )}
            </Button>

            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full"
              >
                Continue Offline
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            We'll automatically reconnect when your connection is restored.
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for offline detection with callbacks
export function useOfflineDetection(callbacks?: {
  onOffline?: () => void;
  onOnline?: () => void;
}) {
  const isOnline = useIsOnline();
  const [wasOnline, setWasOnline] = useState(isOnline);

  useEffect(() => {
    if (wasOnline && !isOnline) {
      callbacks?.onOffline?.();
    } else if (!wasOnline && isOnline) {
      callbacks?.onOnline?.();
    }
    setWasOnline(isOnline);
  }, [isOnline, wasOnline, callbacks]);

  return { isOnline };
}
