// Crypto wallet utility functions

import { WALLET_ADDRESSES, CRYPTO_NETWORKS, MIN_PAYMENT_AMOUNTS } from '../constants/crypto-wallets';
import type { WalletCurrency, CryptoPaymentDetails, QRCodeConfig } from '../types/crypto-payment';

/**
 * Get wallet address for a specific cryptocurrency
 */
export function getWalletAddress(currency: WalletCurrency): string {
  return WALLET_ADDRESSES[currency];
}

/**
 * Get network information for a cryptocurrency
 */
export function getCryptoNetworkInfo(currency: WalletCurrency) {
  return CRYPTO_NETWORKS[currency];
}

/**
 * Get minimum payment amount for a cryptocurrency
 */
export function getMinPaymentAmount(currency: WalletCurrency): number {
  return MIN_PAYMENT_AMOUNTS[currency];
}

/**
 * Validate if a payment amount meets the minimum requirement
 */
export function isValidPaymentAmount(currency: WalletCurrency, amount: number): boolean {
  return amount >= getMinPaymentAmount(currency);
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
  const walletAddress = getWalletAddress(currency);
  const networkInfo = getCryptoNetworkInfo(currency);
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

/**
 * Get all supported cryptocurrencies
 */
export function getSupportedCryptoCurrencies(): WalletCurrency[] {
  return (Object.keys(WALLET_ADDRESSES) as Array<keyof typeof WALLET_ADDRESSES>);
}

/**
 * Check if a cryptocurrency is supported
 */
export function isSupportedCryptoCurrency(currency: string): currency is WalletCurrency {
  return (Object.keys(WALLET_ADDRESSES) as string[]).includes(currency);
}