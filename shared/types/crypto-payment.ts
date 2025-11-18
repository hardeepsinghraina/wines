// Crypto payment type definitions for direct wallet payments

import { WALLET_ADDRESSES, CRYPTO_NETWORKS } from '../constants/crypto-wallets';

export type WalletCurrency = keyof typeof WALLET_ADDRESSES;

export type CryptoNetwork = keyof typeof CRYPTO_NETWORKS;

export interface CryptoWalletConfig {
  address: string;
  currency: WalletCurrency;
  network: string;
  name: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
}

export interface CryptoPaymentDetails {
  currency: WalletCurrency;
  walletAddress: string;
  amount: number;
  qrCodeData: string;
  networkInfo: {
    name: string;
    symbol: string;
    explorerUrl: string;
  };
}

export interface CryptoPaymentRequest {
  orderId: string;
  currency: WalletCurrency;
  amount: number; // Amount in crypto units
  fiatAmount: number; // Original amount in fiat currency
  fiatCurrency: string; // EUR, USD, etc.
  exchangeRate: number; // Crypto to fiat rate used
}

export interface CryptoPaymentStatus {
  paymentId: string;
  orderId: string;
  currency: WalletCurrency;
  walletAddress: string;
  expectedAmount: number;
  status: 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';
  transactionHash?: string;
  confirmations?: number;
  requiredConfirmations: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface QRCodeConfig {
  currency: WalletCurrency;
  address: string;
  amount?: number;
  label?: string;
  message?: string;
}