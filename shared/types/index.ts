// Shared TypeScript types for the luxury wine e-commerce platform

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'admin'
  createdAt: Date
  updatedAt: Date
}

// Re-export product types
export * from './product'

// Re-export crypto payment types
export * from './crypto-payment'

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  currency: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  shippingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  wineId: string
  quantity: number
  price: number
  currency: string
}

export type PaymentMethod = 'crypto' | 'fiat'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
}