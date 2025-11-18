'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.persistent ? undefined : 5000)
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-remove toast after duration
    if (newToast.duration && !newToast.persistent) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(toast.id), 150);
  };

  const getToastStyles = () => {
    const baseStyles = 'border rounded-lg shadow-lg p-4 transition-all duration-150 ease-in-out';
    
    const typeStyles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const visibilityStyles = isVisible 
      ? 'translate-x-0 opacity-100' 
      : 'translate-x-full opacity-0';

    return `${baseStyles} ${typeStyles[toast.type]} ${visibilityStyles}`;
  };

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[toast.type];
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">{getIcon()}</span>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-medium text-sm mb-1">{toast.title}</h4>
          )}
          <p className="text-sm">{toast.message}</p>
          
          {toast.action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toast.action.onClick}
                className="text-xs border-current text-current hover:bg-current hover:text-white"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Convenience hooks for different toast types
export function useConnectionToasts() {
  const { addToast } = useToast();

  const showConnectionLost = useCallback(() => {
    // Removed connection lost notification - users don't need to see this
    return '';
  }, [addToast]);

  const showConnectionRestored = useCallback(() => {
    return addToast({
      type: 'success',
      title: 'Connection Restored',
      message: 'Successfully reconnected to server.',
      duration: 3000
    });
  }, [addToast]);

  const showConnectionSlow = useCallback(() => {
    return addToast({
      type: 'warning',
      title: 'Slow Connection',
      message: 'Connection is slower than usual. Some features may be delayed.',
      duration: 5000
    });
  }, [addToast]);

  const showOfflineMode = useCallback(() => {
    // Removed offline mode notification - users don't need to see this
    return '';
  }, [addToast]);

  const showRetrySuccess = useCallback(() => {
    return addToast({
      type: 'success',
      title: 'Retry Successful',
      message: 'Operation completed successfully after retry.',
      duration: 3000
    });
  }, [addToast]);

  const showRetryFailed = useCallback((retryCount: number, maxRetries: number) => {
    return addToast({
      type: 'error',
      title: 'Retry Failed',
      message: `Retry ${retryCount}/${maxRetries} failed. ${retryCount >= maxRetries ? 'Please try again later.' : 'Trying again...'}`,
      duration: 4000
    });
  }, [addToast]);

  return {
    showConnectionLost,
    showConnectionRestored,
    showConnectionSlow,
    showOfflineMode,
    showRetrySuccess,
    showRetryFailed
  };
}