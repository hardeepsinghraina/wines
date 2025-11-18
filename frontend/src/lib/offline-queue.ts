/**
 * Offline Queue Manager
 * Queues operations when offline and processes them when connection is restored
 */

export interface QueuedOperation {
  id: string;
  type: 'api-call' | 'cart-update' | 'form-submission' | 'custom';
  operation: () => Promise<any>;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private storageKey = 'offline_queue';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  /**
   * Add an operation to the queue
   */
  enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): string {
    const id = this.generateId();
    const queuedOp: QueuedOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(queuedOp);
    this.sortQueue();
    this.saveToStorage();

    return id;
  }

  /**
   * Remove an operation from the queue
   */
  dequeue(id: string): boolean {
    const index = this.queue.findIndex(op => op.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  getSize(): number {
    return this.queue.length;
  }

  /**
   * Clear all operations from the queue
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  /**
   * Process all queued operations
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process operations in priority order
      while (this.queue.length > 0) {
        const operation = this.queue[0];

        try {
          const result = await operation.operation();
          
          // Success - remove from queue and call success callback
          this.dequeue(operation.id);
          operation.onSuccess?.(result);
        } catch (error) {
          console.error(`Failed to process queued operation ${operation.id}:`, error);
          
          // Increment retry count
          operation.retries++;

          if (operation.retries >= operation.maxRetries) {
            // Max retries reached - remove from queue and call error callback
            this.dequeue(operation.id);
            operation.onError?.(error as Error);
          } else {
            // Move to end of queue for retry
            this.queue.shift();
            this.queue.push(operation);
            this.saveToStorage();
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a specific operation by ID
   */
  async processOperation(id: string): Promise<boolean> {
    const operation = this.queue.find(op => op.id === id);
    if (!operation) {
      return false;
    }

    try {
      const result = await operation.operation();
      this.dequeue(id);
      operation.onSuccess?.(result);
      return true;
    } catch (error) {
      console.error(`Failed to process operation ${id}:`, error);
      operation.retries++;

      if (operation.retries >= operation.maxRetries) {
        this.dequeue(id);
        operation.onError?.(error as Error);
      } else {
        this.saveToStorage();
      }
      return false;
    }
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue(): void {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    this.queue.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Generate unique ID for operation
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Only save serializable data (not the operation functions)
      const serializableQueue = this.queue.map(op => ({
        id: op.id,
        type: op.type,
        data: op.data,
        timestamp: op.timestamp,
        retries: op.retries,
        maxRetries: op.maxRetries,
        priority: op.priority
      }));

      localStorage.setItem(this.storageKey, JSON.stringify(serializableQueue));
    } catch (error) {
      console.error('Failed to save queue to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Note: Operations need to be re-created when loading from storage
        // This is just for persistence of metadata
        console.log(`Loaded ${parsed.length} operations from storage`);
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
    }
  }
}

// Helper functions for common operations

/**
 * Queue an API call to be executed when online
 */
export function queueApiCall(
  apiCall: () => Promise<any>,
  data: any,
  options: {
    priority?: 'low' | 'medium' | 'high';
    maxRetries?: number;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
  } = {}
): string {
  const queue = OfflineQueue.getInstance();
  
  return queue.enqueue({
    type: 'api-call',
    operation: apiCall,
    data,
    priority: options.priority || 'medium',
    maxRetries: options.maxRetries || 3,
    onSuccess: options.onSuccess,
    onError: options.onError
  });
}

/**
 * Queue a cart update to be executed when online
 */
export function queueCartUpdate(
  updateFn: () => Promise<any>,
  data: any,
  options: {
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
  } = {}
): string {
  const queue = OfflineQueue.getInstance();
  
  return queue.enqueue({
    type: 'cart-update',
    operation: updateFn,
    data,
    priority: 'high', // Cart updates are high priority
    maxRetries: 5,
    onSuccess: options.onSuccess,
    onError: options.onError
  });
}

/**
 * Queue a form submission to be executed when online
 */
export function queueFormSubmission(
  submitFn: () => Promise<any>,
  formData: any,
  options: {
    priority?: 'low' | 'medium' | 'high';
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
  } = {}
): string {
  const queue = OfflineQueue.getInstance();
  
  return queue.enqueue({
    type: 'form-submission',
    operation: submitFn,
    data: formData,
    priority: options.priority || 'high',
    maxRetries: 3,
    onSuccess: options.onSuccess,
    onError: options.onError
  });
}

/**
 * Process all queued operations when connection is restored
 */
export async function processOfflineQueue(): Promise<void> {
  const queue = OfflineQueue.getInstance();
  await queue.processQueue();
}

/**
 * Get the current queue size
 */
export function getQueueSize(): number {
  const queue = OfflineQueue.getInstance();
  return queue.getSize();
}

/**
 * Clear all queued operations
 */
export function clearOfflineQueue(): void {
  const queue = OfflineQueue.getInstance();
  queue.clear();
}
