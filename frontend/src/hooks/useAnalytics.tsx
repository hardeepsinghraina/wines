'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { performanceMonitor } from '@/lib/performance';

// Analytics event interface
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

// E-commerce event interface
interface EcommerceEvent {
  event: string;
  value?: number;
  currency?: string;
  items?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
  properties?: Record<string, any>;
}

class AnalyticsManager {
  private userId?: string;
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private isOnline = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      // Monitor online status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Track page visibility
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_hidden');
        } else {
          this.track('page_visible');
        }
      });

      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.track('page_unload');
        this.flushQueue();
      });
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Track generic events
  track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ...properties,
      },
      userId: this.userId,
    };

    if (this.isOnline) {
      this.sendEvent(analyticsEvent);
    } else {
      this.queue.push(analyticsEvent);
    }
  }

  // Track page views
  trackPageView(path: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      path,
      title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ...properties,
    });
  }

  // Track e-commerce events
  trackEcommerce(ecommerceEvent: EcommerceEvent): void {
    this.track(ecommerceEvent.event, {
      value: ecommerceEvent.value,
      currency: ecommerceEvent.currency,
      items: ecommerceEvent.items,
      ...ecommerceEvent.properties,
    });
  }

  // Track wine-specific events
  trackWineEvent(action: string, wineId: string, properties?: Record<string, any>): void {
    this.track(`wine_${action}`, {
      wineId,
      ...properties,
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track('performance', {
      metric,
      value,
      ...properties,
    });

    // Also record in performance monitor
    performanceMonitor.startTiming(metric);
    setTimeout(() => {
      performanceMonitor.endTiming(metric);
    }, value);
  }

  // Track errors
  trackError(error: Error, properties?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...properties,
    });
  }

  // Track conversion funnel
  trackFunnel(stage: string, properties?: Record<string, any>): void {
    this.track(`funnel_${stage}`, properties);
  }

  // Track search
  trackSearch(query: string, results: number, properties?: Record<string, any>): void {
    this.track('search', {
      query,
      results,
      ...properties,
    });
  }

  // Track crypto payments
  trackCryptoPayment(currency: string, amount: number, properties?: Record<string, any>): void {
    this.track('crypto_payment', {
      cryptoCurrency: currency,
      amount,
      ...properties,
    });
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl('/api/monitoring/analytics/track'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
      // Add back to queue for retry
      this.queue.push(event);
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
const analyticsManager = new AnalyticsManager();

// React hook for analytics
export function useAnalytics() {
  const pathname = usePathname();

  // Track page views automatically
  useEffect(() => {
    analyticsManager.trackPageView(pathname);
  }, [pathname]);

  // Track performance metrics
  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined') {
      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            analyticsManager.trackPerformance('fcp', entry.startTime);
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        analyticsManager.trackPerformance('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
      };
    }
  }, []);

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analyticsManager.track(event, properties);
  }, []);

  const trackEcommerce = useCallback((event: EcommerceEvent) => {
    analyticsManager.trackEcommerce(event);
  }, []);

  const trackWineEvent = useCallback((action: string, wineId: string, properties?: Record<string, any>) => {
    analyticsManager.trackWineEvent(action, wineId, properties);
  }, []);

  const trackPerformance = useCallback((metric: string, value: number, properties?: Record<string, any>) => {
    analyticsManager.trackPerformance(metric, value, properties);
  }, []);

  const trackError = useCallback((error: Error, properties?: Record<string, any>) => {
    analyticsManager.trackError(error, properties);
  }, []);

  const trackFunnel = useCallback((stage: string, properties?: Record<string, any>) => {
    analyticsManager.trackFunnel(stage, properties);
  }, []);

  const trackSearch = useCallback((query: string, results: number, properties?: Record<string, any>) => {
    analyticsManager.trackSearch(query, results, properties);
  }, []);

  const trackCryptoPayment = useCallback((currency: string, amount: number, properties?: Record<string, any>) => {
    analyticsManager.trackCryptoPayment(currency, amount, properties);
  }, []);

  const setUserId = useCallback((userId: string) => {
    analyticsManager.setUserId(userId);
  }, []);

  return {
    track,
    trackEcommerce,
    trackWineEvent,
    trackPerformance,
    trackError,
    trackFunnel,
    trackSearch,
    trackCryptoPayment,
    setUserId,
  };
}

// Error boundary for automatic error tracking
import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AnalyticsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error automatically
    analyticsManager.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600">We've been notified and are working to fix this issue.</p>
        </div>
      );
    }

    return this.props.children;
  }
}