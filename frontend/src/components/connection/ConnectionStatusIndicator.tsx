'use client';

import React from 'react';
import { useConnection, useConnectionStatus } from '@/contexts/ConnectionContext';
import { Button } from '@/components/ui/Button';

interface ConnectionStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ConnectionStatusIndicator({ 
  showDetails = false, 
  className = '',
  size = 'md' 
}: ConnectionStatusIndicatorProps) {
  const { connectionState, connectionMetrics, reconnect } = useConnection();
  const status = useConnectionStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return connectionState.connectionHealth === 'healthy' 
          ? 'text-green-500' 
          : connectionState.connectionHealth === 'degraded'
          ? 'text-yellow-500'
          : 'text-orange-500';
      case 'reconnecting':
        return 'text-blue-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    
    switch (status) {
      case 'online':
        return (
          <div className={`${sizeClass} rounded-full bg-green-500 ${connectionState.connectionHealth !== 'healthy' ? 'animate-pulse' : ''}`} />
        );
      case 'reconnecting':
        return (
          <div className={`${sizeClass} rounded-full bg-blue-500 animate-spin border-2 border-blue-500 border-t-transparent`} />
        );
      case 'offline':
        return (
          <div className={`${sizeClass} rounded-full bg-red-500`} />
        );
      default:
        return (
          <div className={`${sizeClass} rounded-full bg-gray-500`} />
        );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return connectionState.connectionHealth === 'healthy' 
          ? 'Connected' 
          : connectionState.connectionHealth === 'degraded'
          ? 'Connection Issues'
          : 'Poor Connection';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getDetailedInfo = () => {
    if (!showDetails) return null;

    return (
      <div className="mt-2 text-xs text-gray-600 space-y-1">
        <div>Success Rate: {connectionMetrics.connectionSuccessRate.toFixed(1)}%</div>
        <div>Avg Response: {connectionMetrics.averageResponseTime.toFixed(0)}ms</div>
        <div>Active Connections: {connectionState.activeConnections}</div>
        {connectionState.lastSuccessfulRequest && (
          <div>
            Last Success: {new Date(connectionState.lastSuccessfulRequest).toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {status === 'offline' && (
        <Button
          size="sm"
          variant="outline"
          onClick={reconnect}
          className="text-xs px-2 py-1"
        >
          Retry
        </Button>
      )}
      
      {getDetailedInfo()}
    </div>
  );
}

interface ConnectionToastProps {
  onDismiss?: () => void;
}

export function ConnectionToast({ onDismiss }: ConnectionToastProps) {
  // Connection notifications removed - users don't need to see these
  return null;
}

interface ConnectionBannerProps {
  className?: string;
}

export function ConnectionBanner({ className = '' }: ConnectionBannerProps) {
  // Connection banner removed - users don't need to see connection status
  return null;
}