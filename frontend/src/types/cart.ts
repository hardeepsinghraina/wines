// Cart-related TypeScript interfaces for frontend

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  wineId: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
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
    prices: Array<{
      currency: string;
      price: number;
    }>;
    inventory: Array<{
      quantity: number;
      location: string;
    }>;
  };
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  items: CartItem[];
  discounts?: Array<{
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
  }>;
  estimatedDelivery?: string;
}

export interface AddToCartRequest {
  wineId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CreateOrderFromCartRequest {
  shippingAddressId: string;
  billingAddressId?: string;
  notes?: string;
}

export interface CartResponse {
  cart: Cart;
  summary: CartSummary;
}

export interface MergeGuestCartRequest {
  guestSessionId: string;
}