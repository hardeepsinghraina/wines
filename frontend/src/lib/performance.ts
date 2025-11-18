import React, { lazy, ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Lazy loading utility with loading fallback
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  return lazy(() => importFn().catch(() => ({ default: fallback || (() => null) })));
}

// Dynamic import with Next.js optimization
export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType;
    ssr?: boolean;
  } = {}
) {
  return dynamic(importFn, {
    loading: options.loading ? () => React.createElement(options.loading!) : undefined,
    ssr: options.ssr ?? true,
  });
}

// Intersection Observer for lazy loading
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private callbacks = new Map<Element, () => void>();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      });
    }
  }

  observe(element: Element, callback: () => void) {
    if (this.observer) {
      this.callbacks.set(element, callback);
      this.observer.observe(element);
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.callbacks.delete(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

// Image preloader
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Resource hints for critical resources
export function addResourceHints(resources: Array<{ href: string; as: string; type?: string }>) {
  if (typeof document === 'undefined') return;

  resources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
}

// Performance metrics collection
export class PerformanceMonitor {
  private metrics: Record<string, number> = {};

  startTiming(name: string) {
    this.metrics[`${name}_start`] = performance.now();
  }

  endTiming(name: string) {
    const startTime = this.metrics[`${name}_start`];
    if (startTime) {
      this.metrics[name] = performance.now() - startTime;
      delete this.metrics[`${name}_start`];
    }
  }

  getMetric(name: string): number | undefined {
    return this.metrics[name];
  }

  getAllMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  // Report Core Web Vitals
  reportWebVitals() {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
      });
    });
    observer.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cls = clsValue;
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Cache management utilities
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const cacheManager = new CacheManager();