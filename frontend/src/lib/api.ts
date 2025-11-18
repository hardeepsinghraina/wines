import {
  handleApiError,
  logError,
  createErrorContext,
  withRetryAndCircuitBreaker,
  CircuitBreakerManager
} from "./error-handler";
import { offlineCache } from "./cache";
import { connectionManager } from "./connection-manager";
import {
  InterceptorManager,
  createAuthInterceptor,
  createLoggingInterceptor,
  createResponseLoggingInterceptor,
  createErrorLoggingInterceptor,
  createTokenRefreshInterceptor,
  getTimeoutForEndpoint,
  generateRequestId,
  createDefaultHeaders,
  DEFAULT_TIMEOUT_CONFIG,
  TimeoutConfig,
  RequestInterceptorConfig,
  ResponseInterceptorConfig
} from "./interceptors";

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retry?: boolean;
  timeout?: number;
  skipInterceptors?: boolean;
  useCache?: boolean;
  cacheType?: 'products' | 'categories' | 'user' | 'cart' | 'rates' | 'static';
  fallbackData?: any;
  queueOffline?: boolean;
  queuePriority?: 'low' | 'medium' | 'high';
  formData?: Record<string, any>;
}

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private interceptors: InterceptorManager;
  private timeoutConfig: TimeoutConfig;

  constructor(baseURL: string, timeoutConfig: TimeoutConfig = DEFAULT_TIMEOUT_CONFIG) {
    this.baseURL = baseURL;
    this.timeoutConfig = timeoutConfig;
    this.interceptors = new InterceptorManager();

    // Initialize auth token from localStorage if available
    if (typeof window !== "undefined") {
      this.authToken = localStorage.getItem("authToken");
    }

    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    // Request interceptors
    this.interceptors.addRequestInterceptor(createAuthInterceptor(() => this.authToken));
    this.interceptors.addRequestInterceptor(createLoggingInterceptor());

    // Response interceptors
    this.interceptors.addResponseInterceptor(createResponseLoggingInterceptor());

    // Error interceptors
    this.interceptors.addErrorInterceptor(createErrorLoggingInterceptor());
    this.interceptors.addErrorInterceptor(
      createTokenRefreshInterceptor(
        () => this.refreshAuthToken(),
        (token) => this.setAuthToken(token)
      )
    );
  }

  private async refreshAuthToken(): Promise<string> {
    // Implementation for token refresh
    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return data.token;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("authToken", token);
      } else {
        localStorage.removeItem("authToken");
      }
    }
  }

  updateTimeoutConfig(config: Partial<TimeoutConfig>): void {
    this.timeoutConfig = { ...this.timeoutConfig, ...config };
  }

  getInterceptors(): InterceptorManager {
    return this.interceptors;
  }

  private async requestWithTimeout(
    url: string,
    config: RequestInit,
    timeout = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      retry = true,
      timeout,
      skipInterceptors = false,
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestId = generateRequestId();
    const requestTimeout = timeout || getTimeoutForEndpoint(endpoint, this.timeoutConfig);

    // Create initial request config
    let requestConfig: RequestInterceptorConfig = {
      url,
      method: fetchOptions.method || 'GET',
      headers: {
        ...createDefaultHeaders(),
        ...(fetchOptions.headers as Record<string, string>),
      },
      body: fetchOptions.body,
      timestamp: Date.now(),
      requestId,
    };

    // Process request through interceptors
    if (!skipInterceptors) {
      try {
        requestConfig = await this.interceptors.processRequest(requestConfig);
      } catch (error) {
        console.error('Request interceptor failed:', error);
      }
    }

    const config: RequestInit = {
      ...fetchOptions,
      method: requestConfig.method,
      headers: requestConfig.headers,
      body: requestConfig.body,
    };

    const makeRequest = async (): Promise<T> => {
      const startTime = Date.now();

      try {
        const response = await this.requestWithTimeout(url, config, requestTimeout);
        const responseTime = Date.now() - startTime;

        // Create response config for interceptors
        const responseConfig: ResponseInterceptorConfig = {
          url: requestConfig.url,
          method: requestConfig.method,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseTime,
          requestId,
        };

        // Process response through interceptors
        let processedResponse = response;
        if (!skipInterceptors) {
          try {
            processedResponse = await this.interceptors.processResponse(responseConfig, response);
          } catch (error) {
            console.error('Response interceptor failed:', error);
          }
        }

        // Handle different response types
        if (!processedResponse.ok) {
          const errorData = await processedResponse.json().catch(() => ({}));
          const error = new Error(errorData.message || `HTTP ${processedResponse.status}`);
          (error as any).response = { status: processedResponse.status, data: errorData };
          throw error;
        }

        // Handle empty responses
        const contentType = processedResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return processedResponse.json();
        } else {
          return processedResponse.text() as any;
        }
      } catch (error) {
        // Process error through interceptors
        let processedError = error;
        if (!skipInterceptors) {
          try {
            processedError = await this.interceptors.processError(error as Error, requestConfig);
          } catch (interceptorError) {
            console.error('Error interceptor failed:', interceptorError);
          }
        }

        // Check if interceptor indicates retry is needed
        if ((processedError as any).shouldRetry) {
          if ((processedError as any).updatedConfig) {
            // Update config from interceptor (e.g., new auth token)
            Object.assign(config.headers || {}, (processedError as any).updatedConfig.headers);
          }
          throw processedError; // This will be caught by retry logic
        }

        const errorContext = createErrorContext(url, requestConfig.method, undefined, {
          endpoint,
          requestId,
          responseTime: Date.now() - startTime
        });
        const appError = handleApiError(processedError, errorContext);
        logError(appError, errorContext);
        throw appError;
      }
    };

    if (retry) {
      // Use circuit breaker for API endpoints with more lenient settings
      const circuitBreakerName = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;

      return withRetryAndCircuitBreaker(
        makeRequest,
        circuitBreakerName,
        {
          maxRetries: 3,
          baseDelay: 1000,
          retryCondition: (error, attempt) => {
            // Allow retry for token refresh scenarios
            if ((error as any).shouldRetry) {
              return true;
            }
            // Don't retry auth errors unless handled by interceptor
            return !error.status || error.status !== 401;
          },
          onRetry: (error, attempt, delay) => {
            console.log(`Retrying API request ${endpoint} (attempt ${attempt}) after ${delay}ms`);
          }
        },
        {
          failureThreshold: 10, // Increased threshold
          recoveryTimeout: 30000, // Reduced recovery time
          expectedErrors: (error) => Boolean(error.retryable || (error.status && error.status >= 500))
        }
      );
    } else {
      return makeRequest();
    }
  }

  async get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    const { useCache = false, cacheType = 'static', fallbackData, ...requestOptions } = options || {};

    if (useCache) {
      // Try to get from cache first, with offline fallback
      try {
        return await offlineCache.getWithFallback(
          cacheType,
          endpoint,
          () => this.request<T>(endpoint, { ...requestOptions, method: 'GET' }),
          fallbackData
        );
      } catch (error) {
        // If offline and no cache/fallback, queue the request
        if (!navigator.onLine) {
          offlineCache.queueRequest(
            `${this.baseURL}${endpoint}`,
            'GET',
            {
              headers: requestOptions.headers as Record<string, string>,
              priority: 'medium'
            }
          );
        }
        throw error;
      }
    }

    return this.request<T>(endpoint, { ...requestOptions, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestConfig): Promise<T> {
    const { queueOffline = false, queuePriority = 'medium', formData, ...requestOptions } = options || {};

    try {
      return await this.request<T>(endpoint, {
        ...requestOptions,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    } catch (error) {
      // Queue request if offline and queuing is enabled
      if (!navigator.onLine && queueOffline) {
        const requestId = offlineCache.queueRequest(
          `${this.baseURL}${endpoint}`,
          'POST',
          {
            headers: requestOptions.headers as Record<string, string>,
            body: data,
            priority: queuePriority,
            formData
          }
        );

        // Return a placeholder response indicating the request was queued
        return {
          queued: true,
          requestId,
          message: 'Request queued for when connection is restored'
        } as any;
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestConfig): Promise<T> {
    const { queueOffline = false, queuePriority = 'medium', formData, ...requestOptions } = options || {};

    try {
      return await this.request<T>(endpoint, {
        ...requestOptions,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    } catch (error) {
      if (!navigator.onLine && queueOffline) {
        const requestId = offlineCache.queueRequest(
          `${this.baseURL}${endpoint}`,
          'PUT',
          {
            headers: requestOptions.headers as Record<string, string>,
            body: data,
            priority: queuePriority,
            formData
          }
        );

        return {
          queued: true,
          requestId,
          message: 'Request queued for when connection is restored'
        } as any;
      }
      throw error;
    }
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestConfig): Promise<T> {
    const { queueOffline = false, queuePriority = 'medium', formData, ...requestOptions } = options || {};

    try {
      return await this.request<T>(endpoint, {
        ...requestOptions,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    } catch (error) {
      if (!navigator.onLine && queueOffline) {
        const requestId = offlineCache.queueRequest(
          `${this.baseURL}${endpoint}`,
          'PATCH',
          {
            headers: requestOptions.headers as Record<string, string>,
            body: data,
            priority: queuePriority,
            formData
          }
        );

        return {
          queued: true,
          requestId,
          message: 'Request queued for when connection is restored'
        } as any;
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload method
  async upload<T>(endpoint: string, formData: FormData, options?: RequestConfig): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options || {};

    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData, let browser set it with boundary
    delete headers['Content-Type'];

    if (!skipAuth && this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return this.request<T>(endpoint, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Initialize connection manager with API client
connectionManager.updateConfig({
  maxConnections: 10,
  retryAttempts: 3,
  baseRetryDelay: 1000,
  maxRetryDelay: 30000,
  connectionTimeout: 30000,
  keepAliveTimeout: 60000,
});

// Reset circuit breakers on app initialization
if (typeof window !== 'undefined') {
  import('./error-handler').then(({ CircuitBreakerManager }) => {
    CircuitBreakerManager.getInstance().resetAll();
    console.log('Circuit breakers reset on app initialization');
  }).catch(error => {
    console.warn('Could not reset circuit breakers:', error);
  });
}

// Specific API clients for different domains
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials, { skipAuth: true }),

  register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/api/auth/register', userData, { skipAuth: true }),

  refreshToken: () =>
    api.post('/api/auth/refresh'),

  logout: () =>
    api.post('/api/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }, { skipAuth: true }),

  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }, { skipAuth: true }),

  verifyEmail: (token: string) =>
    api.post('/api/auth/verify-email', { token }, { skipAuth: true }),
};

export const productApi = {
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/api/products${queryString}`, {
      skipAuth: true,
      useCache: true,
      cacheType: 'products'
    });
  },

  getById: (id: string) =>
    api.get(`/api/products/${id}`, {
      skipAuth: true,
      useCache: true,
      cacheType: 'products'
    }),

  search: (query: string, filters?: Record<string, any>) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/products/search?${queryString}`, {
      skipAuth: true,
      useCache: true,
      cacheType: 'products'
    });
  },

  getCategories: () =>
    api.get('/api/products/categories', {
      skipAuth: true,
      useCache: true,
      cacheType: 'categories'
    }),

  getFeatured: () =>
    api.get('/api/products/featured', {
      skipAuth: true,
      useCache: true,
      cacheType: 'products'
    }),

  getRecommendations: (productId?: string) => {
    const endpoint = productId ? `/api/products/recommendations?productId=${productId}` : '/api/products/recommendations';
    return api.get(endpoint, {
      useCache: true,
      cacheType: 'products'
    });
  },
};

export const cartApi = {
  get: () => api.get('/api/cart', { useCache: true, cacheType: 'cart' }),
  add: (productId: string, quantity: number) =>
    api.post('/api/cart/add', { productId, quantity }, { queueOffline: true, queuePriority: 'high' }),
  update: (itemId: string, quantity: number) =>
    api.put(`/api/cart/items/${itemId}`, { quantity }, { queueOffline: true, queuePriority: 'high' }),
  remove: (itemId: string) => api.delete(`/api/cart/items/${itemId}`),
  clear: () => api.delete('/api/cart'),
};

export const orderApi = {
  create: (orderData: any) => api.post('/api/orders', orderData),
  getById: (id: string) => api.get(`/api/orders/${id}`),
  getUserOrders: () => api.get('/api/orders/user'),
  updateStatus: (id: string, status: string) => api.patch(`/api/orders/${id}/status`, { status }),
  cancel: (id: string) => api.post(`/api/orders/${id}/cancel`),
  track: (id: string) => api.get(`/api/orders/${id}/tracking`),
};

export const paymentApi = {
  initiateCrypto: (orderData: any) => api.post('/api/payments/crypto/initiate', orderData),
  getCryptoRates: () => api.get('/api/payments/crypto/rates', {
    skipAuth: true,
    useCache: true,
    cacheType: 'rates'
  }),
  verifyCrypto: (transactionId: string) => api.post('/api/payments/crypto/verify', { transactionId }),
  processTraditional: (paymentData: any) => api.post('/api/payments/traditional/process', paymentData),
  getStatus: (paymentId: string) => api.get(`/api/payments/${paymentId}/status`),
};

export const shippingApi = {
  calculateCost: (address: any, items: any[]) => api.post('/api/shipping/calculate', { address, items }),
  getMethods: (address: any) => api.post('/api/shipping/methods', { address }),
  track: (trackingNumber: string) => api.get(`/api/shipping/track/${trackingNumber}`, { skipAuth: true }),
  getEstimate: (address: any, method: string) => api.post('/api/shipping/estimate', { address, method }),
};

export const userApi = {
  getProfile: () => api.get('/api/user/profile', { useCache: true, cacheType: 'user' }),
  updateProfile: (data: any) => api.put('/api/user/profile', data, { queueOffline: true, queuePriority: 'medium' }),
  getAddresses: () => api.get('/api/user/addresses', { useCache: true, cacheType: 'user' }),
  addAddress: (address: any) => api.post('/api/user/addresses', address, { queueOffline: true, queuePriority: 'medium' }),
  updateAddress: (id: string, address: any) => api.put(`/api/user/addresses/${id}`, address, { queueOffline: true, queuePriority: 'medium' }),
  deleteAddress: (id: string) => api.delete(`/api/user/addresses/${id}`),
  getPreferences: () => api.get('/api/user/preferences', { useCache: true, cacheType: 'user' }),
  updatePreferences: (preferences: any) => api.put('/api/user/preferences', preferences, { queueOffline: true, queuePriority: 'low' }),
};