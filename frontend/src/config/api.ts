/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * Get the full API URL for an endpoint
 * @param endpoint - The API endpoint path (e.g., '/api/products')
 * @returns The full URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';
