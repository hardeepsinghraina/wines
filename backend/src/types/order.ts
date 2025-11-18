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
  createdAt: Date;
  updatedAt: Date;
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

export interface CreateOrderRequest {
  items: Array<{
    wineId: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  billingAddressId?: string;
  notes?: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  itemCount: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  currency: string;
  amount: number;
  transactionId?: string;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipping {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string;
  method: string;
  status: ShippingStatus;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  isInsured: boolean;
  insuranceAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CRYPTO = 'CRYPTO',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum ShippingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION'
}