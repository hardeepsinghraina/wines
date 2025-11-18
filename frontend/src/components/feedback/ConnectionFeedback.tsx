'use client';

import React, { useEffect, useState } from 'react';
import { useConnection, useConnectionStatus } from '@/contexts/ConnectionContext';
import { useConnectionToasts } from '@/components/ui/Toast';
import { ConnectionStatusIndicator, ConnectionBanner } from '@/components/connection/ConnectionStatusIndicator';
import { ProgressIndicator } from '@/components/ui/LoadingState';

interface ConnectionFeedbackProps {
  showBanner?: boolean;
  showToasts?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function ConnectionFeedback({
  showBanner = true,
  showToasts = true,
  showProgress = false,
  className = ''
}: ConnectionFeedbackProps) {
  const status = useConnectionStatus();
  const { connectionState, connectionMetrics } = useConnection();
  const [previousStatus, setPreviousStatus] = useState(status);
  const [toastId, setToastId] = useState<string | null>(null);
  
  const {
    showConnectionLost,
    showConnectionRestored,
    showConnectionSlow,
    showOfflineMode
  } = useConnectionToasts();

  // Connection notifications disabled - users don't need to see these
  useEffect(() => {
    // No connection notifications shown to users
    setPreviousStatus(status);
  }, [status, previousStatus]);

  return (
    <div className={className}>
      {showBanner && <ConnectionBanner />}
      
      {showProgress && status === 'reconnecting' && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <ProgressIndicator
            progress={connectionMetrics.connectionSuccessRate}
            message="Reconnecting to server..."
            showPercentage={false}
          />
        </div>
      )}
    </div>
  );
}

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const status = useConnectionStatus();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(status === 'offline');
  }, [status]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-40 ${className}`}>
      <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </div>
  );
}

interface CachedDataNotificationProps {
  isUsingCache: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function CachedDataNotification({
  isUsingCache,
  onRefresh,
  className = ''
}: CachedDataNotificationProps) {
  if (!isUsingCache) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">📦</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Showing cached data
            </p>
            <p className="text-xs text-yellow-600">
              This information may not be up to date
            </p>
          </div>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-yellow-700 hover:text-yellow-900 underline"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

interface RequestProgressProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  onCancel?: () => void;
  className?: string;
}

export function RequestProgress({
  isLoading,
  progress,
  message = 'Loading...',
  onCancel,
  className = ''
}: RequestProgressProps) {
  if (!isLoading) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{message}</span>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
      
      {typeof progress === 'number' ? (
        <ProgressIndicator progress={progress} showPercentage={true} />
      ) : (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-wine-red h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      )}
    </div>
  );
}

interface ConnectionHealthIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function ConnectionHealthIndicator({
  showDetails = false,
  className = ''
}: ConnectionHealthIndicatorProps) {
  const { connectionState, connectionMetrics } = useConnection();
  const status = useConnectionStatus();

  const getHealthColor = () => {
    if (status !== 'online') return 'text-red-500';
    
    switch (connectionState.connectionHealth) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthMessage = () => {
    if (status !== 'online') return 'Offline';
    
    switch (connectionState.connectionHealth) {
      case 'healthy':
        return 'Excellent connection';
      case 'degraded':
        return 'Connection issues detected';
      case 'unhealthy':
        return 'Poor connection quality';
      default:
        return 'Connection status unknown';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getHealthColor().replace('text-', 'bg-')}`} />
      <span className={`text-sm ${getHealthColor()}`}>
        {getHealthMessage()}
      </span>
      
      {showDetails && status === 'online' && (
        <div className="text-xs text-gray-500">
          ({connectionMetrics.averageResponseTime.toFixed(0)}ms avg)
        </div>
      )}
    </div>
  );
}

interface NetworkQualityIndicatorProps {
  className?: string;
}

export function NetworkQualityIndicator({ className = '' }: NetworkQualityIndicatorProps) {
  const { connectionMetrics } = useConnection();
  const status = useConnectionStatus();

  if (status !== 'online') return null;

  const getQualityBars = () => {
    const responseTime = connectionMetrics.averageResponseTime;
    const successRate = connectionMetrics.connectionSuccessRate;
    
    // Determine quality based on response time and success rate
    let quality = 0;
    if (responseTime < 200 && successRate > 95) quality = 4;
    else if (responseTime < 500 && successRate > 90) quality = 3;
    else if (responseTime < 1000 && successRate > 80) quality = 2;
    else if (successRate > 50) quality = 1;

    return Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className={`w-1 rounded-full ${
          index < quality 
            ? quality >= 3 ? 'bg-green-500' : quality >= 2 ? 'bg-yellow-500' : 'bg-red-500'
            : 'bg-gray-300'
        }`}
        style={{ height: `${(index + 1) * 3 + 2}px` }}
      />
    ));
  };

  return (
    <div className={`flex items-end space-x-0.5 ${className}`} title="Network Quality">
      {getQualityBars()}
    </div>
  );
}