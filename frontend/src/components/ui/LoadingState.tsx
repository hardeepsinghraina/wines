'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ConnectionStatusIndicator } from '@/components/connection/ConnectionStatusIndicator';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  showConnectionStatus?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({
  message = 'Loading...',
  showSpinner = true,
  showConnectionStatus = false,
  onRetry,
  retryLabel = 'Retry',
  className = '',
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  const spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      {showSpinner && (
        <div className={`${spinnerSizes[size]} border-4 border-gray-200 border-t-wine-red rounded-full animate-spin mb-4`} />
      )}
      
      <p className={`text-muted-olive ${textSizes[size]} mb-4 text-center`}>
        {message}
      </p>

      {showConnectionStatus && (
        <div className="mb-4">
          <ConnectionStatusIndicator showDetails={true} />
        </div>
      )}

      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          size={size === 'lg' ? 'lg' : 'md'}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

interface ProgressIndicatorProps {
  progress: number; // 0-100
  message?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressIndicator({
  progress,
  message,
  showPercentage = true,
  className = ''
}: ProgressIndicatorProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <p className="text-sm text-muted-olive text-center">{message}</p>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-wine-red h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      
      {showPercentage && (
        <p className="text-xs text-gray-500 text-center">
          {Math.round(clampedProgress)}%
        </p>
      )}
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function InlineLoading({
  message = 'Loading...',
  size = 'sm',
  className = ''
}: InlineLoadingProps) {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${spinnerSize} border-2 border-gray-300 border-t-wine-red rounded-full animate-spin`} />
      <span className={`text-muted-olive ${textSize}`}>{message}</span>
    </div>
  );
}

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function RetryButton({
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  disabled = false,
  className = '',
  size = 'md'
}: RetryButtonProps) {
  const isMaxRetriesReached = retryCount >= maxRetries;
  const isDisabled = disabled || isRetrying || isMaxRetriesReached;

  const getButtonText = () => {
    if (isRetrying) return 'Retrying...';
    if (isMaxRetriesReached) return 'Max retries reached';
    if (retryCount > 0) return `Retry (${retryCount}/${maxRetries})`;
    return 'Retry';
  };

  return (
    <Button
      onClick={onRetry}
      disabled={isDisabled}
      variant={isMaxRetriesReached ? 'ghost' : 'outline'}
      size={size}
      className={className}
    >
      {isRetrying && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {getButtonText()}
    </Button>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = 'Processing...',
  progress,
  onCancel,
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-wine-red rounded-full animate-spin mx-auto mb-4" />
        
        <p className="text-charcoal-black font-medium mb-4">{message}</p>
        
        {typeof progress === 'number' && (
          <ProgressIndicator progress={progress} className="mb-4" />
        )}
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

// Specialized loading states for different contexts
export function ProductLoadingState({ className = '' }: { className?: string }) {
  return (
    <LoadingState
      message="Loading product information..."
      showConnectionStatus={true}
      className={className}
    />
  );
}

export function CheckoutLoadingState({ className = '' }: { className?: string }) {
  return (
    <LoadingState
      message="Processing your order..."
      showSpinner={true}
      className={className}
    />
  );
}

export function PaymentLoadingState({ 
  progress, 
  className = '' 
}: { 
  progress?: number; 
  className?: string; 
}) {
  return (
    <div className={`text-center p-8 ${className}`}>
      <LoadingState
        message="Processing payment..."
        showSpinner={true}
        size="lg"
      />
      {typeof progress === 'number' && (
        <ProgressIndicator 
          progress={progress} 
          message="Please wait while we process your payment"
          className="mt-4"
        />
      )}
    </div>
  );
}

export function SearchLoadingState({ className = '' }: { className?: string }) {
  return (
    <LoadingState
      message="Searching products..."
      size="sm"
      className={className}
    />
  );
}