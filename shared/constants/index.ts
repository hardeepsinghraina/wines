// Shared constants for the luxury wine e-commerce platform

export const CRYPTO_CURRENCIES = [
  'BTC',
  'ETH', 
  'USDT_TRC20'
] as const

export const FIAT_CURRENCIES = ['EUR', 'USD'] as const

export const WINE_CATEGORIES = [
  'red',
  'white', 
  'rose',
  'sparkling',
  'dessert',
  'fortified'
] as const

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
] as const

export const USER_ROLES = ['customer', 'admin'] as const

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  WINES: '/api/wines',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  CRYPTO: '/api/crypto'
} as const

// Re-export crypto wallet configurations
export * from './crypto-wallets'