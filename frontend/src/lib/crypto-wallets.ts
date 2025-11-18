// Crypto wallet addresses for direct payments
// These are the platform's receiving wallet addresses

export const WALLET_ADDRESSES = {
  BTC: 'bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5',
  ETH: '0xc71b5d01e24F8D0d31e464D15B2b04032f58F4b3',
  USDT_TRC20: 'TXeXRbMZuunsMS558WV6xWBFiXTmgbQQnp'
} as const;

export type WalletCurrency = keyof typeof WALLET_ADDRESSES;

// Supported cryptocurrencies for direct wallet payments
export const SUPPORTED_CRYPTO_CURRENCIES = ['BTC', 'ETH', 'USDT_TRC20'] as const;

// Network configurations for each cryptocurrency
export const CRYPTO_NETWORKS = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    network: 'mainnet',
    explorerUrl: 'https://blockstream.info/tx/'
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    network: 'mainnet',
    explorerUrl: 'https://etherscan.io/tx/'
  },
  USDT_TRC20: {
    name: 'Tether USD (TRC20)',
    symbol: 'USDT',
    decimals: 6,
    network: 'tron',
    explorerUrl: 'https://tronscan.org/#/transaction/'
  }
} as const;

// Minimum payment amounts (in crypto units)
export const MIN_PAYMENT_AMOUNTS = {
  BTC: 0.0001,
  ETH: 0.001,
  USDT_TRC20: 1
} as const;

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