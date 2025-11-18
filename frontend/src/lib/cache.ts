'use client';



// Cache configuration for different types of data
const CACHE_CONFIG = {
  products: { ttl: 300000 }, // 5 minutes
  categories: { ttl: 600000 }, // 10 minutes
  user: { ttl: 180000 }, // 3 minutes
  cart: { ttl: 60000 }, // 1 minute
  rates: { ttl: 30000 }, // 30 seconds for crypto rates
  static: { ttl: 3600000 }, // 1 hour for static content
} as const;

type CacheType = keyof typeof CACHE_CONFIG;

// Enhanced cache service with automatic invalidation
export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private subscribers = new Map<string, Set<() => void>>();

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Generate cache key
  private generateKey(type: CacheType, identifier: string): string {
    return `${type}:${identifier}`;
  }

  // Set cache with type-specific TTL
  set(type: CacheType, identifier: string, data: any): void {
    const key = this.generateKey(type, identifier);
    const ttl = CACHE_CONFIG[type].ttl;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Notify subscribers
    this.notifySubscribers(key);
  }

  // Get from cache with automatic expiration
  get(type: CacheType, identifier: string): any | null {
    const key = this.generateKey(type, identifier);
    const item = this.cache.get(key);
    
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Check if item exists and is valid
  has(type: CacheType, identifier: string): boolean {
    return this.get(type, identifier) !== null;
  }

  // Invalidate specific cache entry
  invalidate(type: CacheType, identifier: string): void {
    const key = this.generateKey(type, identifier);
    this.cache.delete(key);
    this.notifySubscribers(key);
  }

  // Invalidate all entries of a type
  invalidateType(type: CacheType): void {
    const prefix = `${type}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        this.notifySubscribers(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    // Notify all subscribers
    for (const subscribers of this.subscribers.values()) {
      subscribers.forEach(callback => callback());
    }
  }

  // Subscribe to cache changes
  subscribe(type: CacheType, identifier: string, callback: () => void): () => void {
    const key = this.generateKey(type, identifier);
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback());
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      age: Date.now() - item.timestamp,
      ttl: item.ttl,
    }));

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      entries,
    };
  }
}

// Singleton instance
export const cacheService = CacheService.getInstance();

// React hook for cached data
import { useState, useEffect } from 'react';

export function useCachedData<T>(
  type: CacheType,
  identifier: string,
  fetcher: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = cacheService.get(type, identifier);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      cacheService.set(type, identifier, freshData);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to cache changes
    const unsubscribe = cacheService.subscribe(type, identifier, () => {
      const cached = cacheService.get(type, identifier);
      if (cached) {
        setData(cached);
      }
    });

    return unsubscribe;
  }, [type, identifier]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Browser storage cache for persistence
export class PersistentCache {
  private storageKey = 'wine-app-cache';

  // Save cache to localStorage
  save(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = Array.from(cacheService['cache'].entries());
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  // Load cache from localStorage
  load(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const cacheData = JSON.parse(stored);
        cacheData.forEach(([key, value]: [string, any]) => {
          // Only restore if not expired
          if (Date.now() - value.timestamp < value.ttl) {
            cacheService['cache'].set(key, value);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Clear persistent cache
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}

export const persistentCache = new PersistentCache();

// Offline Request Queue
export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
  formData?: Record<string, any>; // For preserving form data
}

export class OfflineRequestQueue {
  private static instance: OfflineRequestQueue;
  private queue: QueuedRequest[] = [];
  private processing = false;
  private storageKey = 'wine-app-offline-queue';

  static getInstance(): OfflineRequestQueue {
    if (!OfflineRequestQueue.instance) {
      OfflineRequestQueue.instance = new OfflineRequestQueue();
    }
    return OfflineRequestQueue.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
  }

  // Add request to queue
  enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): string {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    // Insert based on priority
    const insertIndex = this.findInsertIndex(queuedRequest.priority);
    this.queue.splice(insertIndex, 0, queuedRequest);
    
    this.saveToStorage();
    return queuedRequest.id;
  }

  // Remove request from queue
  dequeue(id: string): boolean {
    const index = this.queue.findIndex(req => req.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Get all queued requests
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  // Clear queue
  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  // Process queue when online
  async processQueue(): Promise<void> {
    if (this.processing || !navigator.onLine) return;

    this.processing = true;
    const failedRequests: QueuedRequest[] = [];

    for (const request of this.queue) {
      try {
        await this.executeRequest(request);
        console.log(`Successfully processed queued request: ${request.id}`);
      } catch (error) {
        request.retryCount++;
        if (request.retryCount < request.maxRetries) {
          failedRequests.push(request);
        } else {
          console.error(`Failed to process request after ${request.maxRetries} attempts:`, request.id);
        }
      }
    }

    this.queue = failedRequests;
    this.saveToStorage();
    this.processing = false;
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private findInsertIndex(priority: 'low' | 'medium' | 'high'): number {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const targetPriority = priorityOrder[priority];

    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] < targetPriority) {
        return i;
      }
    }
    return this.queue.length;
  }

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOnlineListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Connection restored, processing offline queue...');
        this.processQueue();
      });
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      } catch (error) {
        console.warn('Failed to save offline queue:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load offline queue:', error);
        this.queue = [];
      }
    }
  }
}

// Form Data Preservation
export class FormDataManager {
  private static instance: FormDataManager;
  private formData: Map<string, any> = new Map();
  private storageKey = 'wine-app-form-data';

  static getInstance(): FormDataManager {
    if (!FormDataManager.instance) {
      FormDataManager.instance = new FormDataManager();
    }
    return FormDataManager.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  // Save form data
  saveFormData(formId: string, data: any): void {
    this.formData.set(formId, {
      data,
      timestamp: Date.now()
    });
    this.saveToStorage();
  }

  // Get form data
  getFormData(formId: string): any | null {
    const stored = this.formData.get(formId);
    if (!stored) return null;

    // Auto-expire after 1 hour
    if (Date.now() - stored.timestamp > 3600000) {
      this.formData.delete(formId);
      this.saveToStorage();
      return null;
    }

    return stored.data;
  }

  // Clear form data
  clearFormData(formId: string): void {
    this.formData.delete(formId);
    this.saveToStorage();
  }

  // Clear all form data
  clearAll(): void {
    this.formData.clear();
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = Array.from(this.formData.entries());
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save form data:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          this.formData = new Map(data);
        }
      } catch (error) {
        console.warn('Failed to load form data:', error);
      }
    }
  }
}

// Enhanced Cache with Offline Support
export class OfflineCache extends CacheService {
  private offlineQueue = OfflineRequestQueue.getInstance();
  private formDataManager = FormDataManager.getInstance();

  // Cache with offline fallback
  async getWithFallback<T>(
    type: CacheType,
    identifier: string,
    fetcher: () => Promise<T>,
    fallbackData?: T
  ): Promise<T> {
    // Try cache first
    const cached = this.get(type, identifier);
    if (cached) return cached;

    // If offline, return fallback or throw
    if (!navigator.onLine) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw new Error('No cached data available offline');
    }

    // Fetch fresh data
    try {
      const data = await fetcher();
      this.set(type, identifier, data);
      return data;
    } catch (error) {
      // If fetch fails and we have fallback, use it
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw error;
    }
  }

  // Queue request for offline processing
  queueRequest(
    url: string,
    method: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
      priority?: 'low' | 'medium' | 'high';
      maxRetries?: number;
      formData?: Record<string, any>;
    } = {}
  ): string {
    return this.offlineQueue.enqueue({
      url,
      method,
      headers: options.headers,
      body: options.body,
      priority: options.priority || 'medium',
      maxRetries: options.maxRetries || 3,
      formData: options.formData
    });
  }

  // Get offline queue status
  getOfflineQueueStatus(): {
    count: number;
    processing: boolean;
    requests: QueuedRequest[];
  } {
    return {
      count: this.offlineQueue.getQueue().length,
      processing: this.offlineQueue['processing'],
      requests: this.offlineQueue.getQueue()
    };
  }

  // Preserve form data during connection failures
  preserveFormData(formId: string, data: any): void {
    this.formDataManager.saveFormData(formId, data);
  }

  // Restore preserved form data
  restoreFormData(formId: string): any | null {
    return this.formDataManager.getFormData(formId);
  }

  // Clear preserved form data
  clearPreservedFormData(formId: string): void {
    this.formDataManager.clearFormData(formId);
  }
}

// Create enhanced cache instance
export const offlineCache = new OfflineCache();

// React hook for offline-aware data fetching
export function useOfflineData<T>(
  type: CacheType,
  identifier: string,
  fetcher: () => Promise<T>,
  fallbackData?: T
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await offlineCache.getWithFallback(
        type,
        identifier,
        fetcher,
        fallbackData
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      if (fallbackData !== undefined) {
        setData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, identifier]);

  return {
    data,
    loading,
    error,
    isOffline,
    refetch: fetchData
  };
}

// Hook for form data preservation
export function useFormPreservation(formId: string) {
  const [preservedData, setPreservedData] = useState<any>(null);

  useEffect(() => {
    const restored = offlineCache.restoreFormData(formId);
    if (restored) {
      setPreservedData(restored);
    }
  }, [formId]);

  const preserveData = (data: any) => {
    offlineCache.preserveFormData(formId, data);
    setPreservedData(data);
  };

  const clearPreservedData = () => {
    offlineCache.clearPreservedFormData(formId);
    setPreservedData(null);
  };

  return {
    preservedData,
    preserveData,
    clearPreservedData,
    hasPreservedData: preservedData !== null
  };
}