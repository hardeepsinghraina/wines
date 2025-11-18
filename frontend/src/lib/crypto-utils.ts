// Crypto payment utility functions

import { WALLET_ADDRESSES, CRYPTO_NETWORKS, MIN_PAYMENT_AMOUNTS, type WalletCurrency } from './crypto-wallets';

export interface QRCodeConfig {
  currency: WalletCurrency;
  address: string;
  amount?: number;
  label?: string;
  message?: string;
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

/**
 * Generate QR code data for crypto payment
 */
export function generateQRCodeData(config: QRCodeConfig): string {
  const { currency, address, amount, label, message } = config;
  
  switch (currency) {
    case 'BTC':
      let btcUri = `bitcoin:${address}`;
      const btcParams: string[] = [];
      if (amount) btcParams.push(`amount=${amount}`);
      if (label) btcParams.push(`label=${encodeURIComponent(label)}`);
      if (message) btcParams.push(`message=${encodeURIComponent(message)}`);
      if (btcParams.length > 0) btcUri += `?${btcParams.join('&')}`;
      return btcUri;
      
    case 'ETH':
      let ethUri = `ethereum:${address}`;
      const ethParams: string[] = [];
      if (amount) ethParams.push(`value=${amount * Math.pow(10, 18)}`); // Convert to wei
      if (ethParams.length > 0) ethUri += `?${ethParams.join('&')}`;
      return ethUri;
      
    case 'USDT_TRC20':
      // For TRON USDT, we'll use a simple address format
      // Most wallets will recognize the TRC20 format
      return address;
      
    default:
      return address;
  }
}

/**
 * Create crypto payment details object
 */
export function createCryptoPaymentDetails(
  currency: WalletCurrency,
  amount: number,
  label?: string,
  message?: string
): CryptoPaymentDetails {
  const walletAddress = WALLET_ADDRESSES[currency];
  const networkInfo = CRYPTO_NETWORKS[currency];
  const qrCodeData = generateQRCodeData({
    currency,
    address: walletAddress,
    amount,
    label,
    message
  });

  return {
    currency,
    walletAddress,
    amount,
    qrCodeData,
    networkInfo: {
      name: networkInfo.name,
      symbol: networkInfo.symbol,
      explorerUrl: networkInfo.explorerUrl
    }
  };
}