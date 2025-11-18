export type SupportedCryptoCurrency = 'BTC' | 'ETH' | 'USDT_TRC20';

export type PaymentMethod = 'crypto' | 'paypal';

export type PaymentStatus = 'pending' | 'confirming' | 'completed' | 'failed' | 'expired' | 'cancelled' | 'refunded';

export interface CryptoRates {
  BTC: number;
  ETH: number;
  USDT_TRC20: number;
  lastUpdated: Date;
}

export interface CryptoPaymentRequest {
  orderId: string;
  amount: number;
  currency: string; // EUR, USD
  cryptoCurrency: SupportedCryptoCurrency;
  description?: string;
  customerEmail?: string;
}

export interface CryptoPaymentResponse {
  paymentId: string;
  paymentUrl: string;
  paymentAddress: string;
  amount: number;
  currency: SupportedCryptoCurrency;
  status: string;
  expiresAt: number;
  qrCode?: string;
}



export interface PaymentDetails {
  id: string;
  orderId: string;
  method: PaymentMethod;
  currency: string;
  amount: number;
  cryptoAmount?: number;
  cryptoCurrency?: SupportedCryptoCurrency;
  status: PaymentStatus;
  transactionId?: string;
  transactionHash?: string;
  paymentAddress?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}