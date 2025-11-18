'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { connectionManager, ConnectionState, ConnectionMetrics } from '@/lib/connection-manager';

interface ConnectionContextType {
  connectionState: ConnectionState;
  connectionMetrics: ConnectionMetrics;
  isOnline: boolean;
  reconnect: () => Promise<void>;
  getConnectionStatus: () => 'online' | 'offline' | 'reconnecting';
  addConnectionListener: (listener: ConnectionListener) => () => void;
}

type ConnectionListener = (state: ConnectionState) => void;

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

interface ConnectionProviderProps {
  children: ReactNode;
  healthCheckInterval?: number;
  reconnectAttempts?: number;
}

export function ConnectionProvider({ 
  children, 
  healthCheckInterval = 30000,
  reconnectAttempts = 3 
}: ConnectionProviderProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(connectionManager.getState());
  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>(connectionManager.getMetrics());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [listeners, setListeners] = useState<Set<ConnectionListener>>(new Set());

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = connectionManager.getState();
      const newMetrics = connectionManager.getMetrics();
      
      setConnectionState(newState);
      setConnectionMetrics(newMetrics);
      
      // Notify listeners
      listeners.forEach(listener => listener(newState));
    }, 1000); // Update every second for real-time UI

    return () => clearInterval(interval);
  }, [listeners]);

  // Health check to verify actual connectivity
  const performHealthCheck = useCallback(async (): Promise<boolean> => {
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl('/api/health'), {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }, []);

  // Reconnection logic
  const reconnect = useCallback(async (): Promise<void> => {
    if (isReconnecting) return;

    setIsReconnecting(true);
    
    try {
      for (let attempt = 1; attempt <= reconnectAttempts; attempt++) {
        console.log(`Reconnection attempt ${attempt}/${reconnectAttempts}`);
        
        const isHealthy = await performHealthCheck();
        
        if (isHealthy) {
          console.log('Reconnection successful');
          // Reset connection manager state
          connectionManager.getState().isConnected = true;
          connectionManager.getState().failureCount = 0;
          setIsReconnecting(false);
          return;
        }
        
        if (attempt < reconnectAttempts) {
          // Wait before next attempt with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.error('All reconnection attempts failed');
    } catch (error) {
      console.error('Reconnection error:', error);
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, reconnectAttempts, performHealthCheck]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Trigger reconnection when coming back online
      if (!connectionState.isConnected) {
        await reconnect();
        
        // Process offline queue when connection is restored
        try {
          const { processOfflineQueue } = await import('@/lib/offline-queue');
          await processOfflineQueue();
        } catch (error) {
          console.error('Failed to process offline queue:', error);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [connectionState.isConnected, reconnect]);

  // Periodic health checks
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isOnline) return;
      
      const isHealthy = await performHealthCheck();
      const currentState = connectionManager.getState();
      
      if (!isHealthy && currentState.isConnected) {
        // Connection lost, trigger reconnection
        reconnect();
      }
    }, healthCheckInterval);

    return () => clearInterval(interval);
  }, [isOnline, healthCheckInterval, performHealthCheck, reconnect]);

  const getConnectionStatus = useCallback((): 'online' | 'offline' | 'reconnecting' => {
    if (isReconnecting) return 'reconnecting';
    if (!isOnline || !connectionState.isConnected) return 'offline';
    return 'online';
  }, [isOnline, connectionState.isConnected, isReconnecting]);

  const addConnectionListener = useCallback((listener: ConnectionListener): (() => void) => {
    setListeners(prev => new Set(prev).add(listener));
    
    return () => {
      setListeners(prev => {
        const newSet = new Set(prev);
        newSet.delete(listener);
        return newSet;
      });
    };
  }, []);

  const contextValue: ConnectionContextType = {
    connectionState,
    connectionMetrics,
    isOnline,
    reconnect,
    getConnectionStatus,
    addConnectionListener,
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection(): ConnectionContextType {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

// Custom hooks for specific connection aspects
export function useConnectionStatus(): 'online' | 'offline' | 'reconnecting' {
  const { getConnectionStatus } = useConnection();
  return getConnectionStatus();
}

export function useConnectionMetrics(): ConnectionMetrics {
  const { connectionMetrics } = useConnection();
  return connectionMetrics;
}

export function useConnectionHealth(): 'healthy' | 'degraded' | 'unhealthy' {
  const { connectionState } = useConnection();
  return connectionState.connectionHealth;
}

export function useIsOnline(): boolean {
  const { isOnline, connectionState } = useConnection();
  return isOnline && connectionState.isConnected;
}