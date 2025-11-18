// Common types used across the application

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: any
}

export interface SearchParams extends PaginationParams, SortParams {
  search?: string
  filters?: FilterParams
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CRYPTO = 'crypto',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
}

export enum CryptoCurrency {
  BTC = 'BTC',
  ETH = 'ETH',
  SOL = 'SOL',
  DOGE = 'DOGE',
  LTC = 'LTC',
  USDC = 'USDC',
  USDT = 'USDT',
}