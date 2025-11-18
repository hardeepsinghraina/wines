'use client';

import { useEffect, ReactNode } from 'react';
import { performanceMonitor } from '@/lib/performance';
import { serviceWorkerManager } from '@/lib/service-worker';
import { persistentCache } from '@/lib/cache';

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.reportWebVitals();

    // Register service worker
    serviceWorkerManager.register();

    // Load persistent cache
    persistentCache.load();

    // Save cache periodically
    const saveInterval = setInterval(() => {
      persistentCache.save();
    }, 60000); // Save every minute

    // Preload critical resources
    import('@/config/api').then(({ getApiUrl }) => {
      const criticalResources = [
        { href: getApiUrl('/api/products/featured'), as: 'fetch' },
        { href: getApiUrl('/api/products/categories'), as: 'fetch' },
      ];

      // Add resource hints after initial load
      setTimeout(() => {
        import('@/lib/performance').then(({ addResourceHints }) => {
          addResourceHints(criticalResources);
        });
      }, 1000);
    });

    // Cleanup
    return () => {
      clearInterval(saveInterval);
      persistentCache.save();
    };
  }, []);

  // Handle visibility change for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - save cache and pause non-critical operations
        persistentCache.save();
      } else {
        // Page is visible - resume operations
        performanceMonitor.startTiming('page_visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return <>{children}</>;
}