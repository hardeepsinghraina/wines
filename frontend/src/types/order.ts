// Order-related TypeScript interfaces for frontend

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddressId: string;
  billingAddressId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  shippingAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payments?: Payment[];
  shipping?: Shipping;
}

export interface OrderItem {
  id: string;
  orderId: string;
  wineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  wine?: {
    id: string;
    name: string;
    producer: string;
    region: string;
    vintage: number;
    bottleSize: string;
    images: Array<{
      url: string;
      altText?: string;
      isPrimary: boolean;
    }>;
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  method: string;
  cost: number;
  currency: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  status: ShippingStatus;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CRYPTO = 'crypto',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum ShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RETURNED = 'returned'
}

// API Request/Response Types
export interface CreateOrderRequest {
  items: Array<{
    wineId: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethodId: string;
  shippingMethodId: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  notes?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderSearchParams {
  status?: OrderStatus[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}