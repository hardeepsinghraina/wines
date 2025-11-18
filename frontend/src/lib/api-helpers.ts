/**
 * API Response Normalization Helpers
 * 
 * These helpers standardize API responses across different endpoints
 * to handle multiple response formats consistently.
 */

import type { Wine } from '@/types/wine';

/**
 * Normalize product/wine response from API
 * Handles multiple response formats:
 * - { data: { wines: [...] } }
 * - { data: { products: [...] } }
 * - { data: [...] }
 * - { wines: [...] }
 * - { products: [...] }
 * - [...]
 */
export function normalizeProductResponse(response: any): Wine[] {
  if (!response) {
    return [];
  }

  // Handle array response directly
  if (Array.isArray(response)) {
    return response;
  }

  // Handle nested data object
  if (response.data) {
    // Check for wines array
    if (Array.isArray(response.data.wines)) {
      return response.data.wines;
    }
    
    // Check for products array
    if (Array.isArray(response.data.products)) {
      return response.data.products;
    }
    
    // Check if data itself is an array
    if (Array.isArray(response.data)) {
      return response.data;
    }
  }

  // Handle direct wines property
  if (Array.isArray(response.wines)) {
    return response.wines;
  }

  // Handle direct products property
  if (Array.isArray(response.products)) {
    return response.products;
  }

  // If we get a single object, wrap it in an array
  if (typeof response === 'object' && response.id) {
    return [response];
  }

  // Default to empty array if no valid format found
  console.warn('Unable to normalize product response:', response);
  return [];
}

/**
 * Normalize single product/wine response from API
 * Handles multiple response formats for single product endpoints
 */
export function normalizeSingleProductResponse(response: any): Wine | null {
  if (!response) {
    return null;
  }

  // Handle nested data object
  if (response.data) {
    // Check if data is the product itself
    if (response.data.id) {
      return response.data;
    }
    
    // Check for wine property
    if (response.data.wine) {
      return response.data.wine;
    }
    
    // Check for product property
    if (response.data.product) {
      return response.data.product;
    }
  }

  // Handle direct wine property
  if (response.wine) {
    return response.wine;
  }

  // Handle direct product property
  if (response.product) {
    return response.product;
  }

  // If response has an id, it's likely the product itself
  if (response.id) {
    return response;
  }

  console.warn('Unable to normalize single product response:', response);
  return null;
}

/**
 * Normalize paginated response from API
 * Handles pagination metadata along with products
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function normalizePaginatedResponse<T = Wine>(response: any): PaginatedResponse<T> {
  const defaultResponse: PaginatedResponse<T> = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  if (!response) {
    return defaultResponse;
  }

  // Handle nested data object
  const data = response.data || response;

  // Extract items
  let items: T[] = [];
  if (Array.isArray(data.wines)) {
    items = data.wines;
  } else if (Array.isArray(data.products)) {
    items = data.products;
  } else if (Array.isArray(data.items)) {
    items = data.items;
  } else if (Array.isArray(data)) {
    items = data;
  }

  // Extract pagination metadata
  const meta = data.meta || data.pagination || {};

  return {
    items,
    total: meta.total || data.total || items.length,
    page: meta.page || data.page || 1,
    limit: meta.limit || data.limit || items.length || 10,
    totalPages: meta.totalPages || data.totalPages || Math.ceil((meta.total || data.total || items.length) / (meta.limit || data.limit || 10)),
  };
}

/**
 * Normalize order response from API
 */
export function normalizeOrderResponse(response: any): any {
  if (!response) {
    return null;
  }

  // Handle nested data object
  if (response.data) {
    if (response.data.order) {
      return response.data.order;
    }
    return response.data;
  }

  // Handle direct order property
  if (response.order) {
    return response.order;
  }

  // If response has an id, it's likely the order itself
  if (response.id) {
    return response;
  }

  return response;
}

/**
 * Normalize cart response from API
 */
export function normalizeCartResponse(response: any): any {
  if (!response) {
    return { items: [], total: 0 };
  }

  // Handle nested data object
  if (response.data) {
    if (response.data.cart) {
      return response.data.cart;
    }
    return response.data;
  }

  // Handle direct cart property
  if (response.cart) {
    return response.cart;
  }

  // If response has items array, it's likely the cart itself
  if (response.items) {
    return response;
  }

  return { items: [], total: 0 };
}

/**
 * Normalize user response from API
 */
export function normalizeUserResponse(response: any): any {
  if (!response) {
    return null;
  }

  // Handle nested data object
  if (response.data) {
    if (response.data.user) {
      return response.data.user;
    }
    return response.data;
  }

  // Handle direct user property
  if (response.user) {
    return response.user;
  }

  // If response has an id and email, it's likely the user itself
  if (response.id && response.email) {
    return response;
  }

  return response;
}

/**
 * Extract error message from API error response
 */
export function extractErrorMessage(error: any): string {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (error.response) {
    const data = error.response.data;
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      if (typeof data.error === 'string') {
        return data.error;
      }
      if (data.error.message) {
        return data.error.message;
      }
    }
  }

  // Handle direct error messages
  if (error.message) {
    return error.message;
  }

  if (error.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error.message) {
      return error.error.message;
    }
  }

  // Default error message
  return 'An unexpected error occurred';
}
