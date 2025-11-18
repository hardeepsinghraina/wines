'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { CryptoPaymentSelector } from './CryptoPaymentSelector';
import { 
  CRYPTO_NETWORKS, 
  getSupportedCryptoCurrencies,
  type WalletCurrency 
} from '@/lib/crypto-wallets';

interface PaymentSelectorProps {
  totalAmount: number;
  currency: string;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}

export interface PaymentMethod {
  type: 'crypto';
  currency: WalletCurrency;
  amount: number;
  displayName: string;
  walletAddress: string;
  qrCodeData: string;
  networkInfo: {
    name: string;
    symbol: string;
    explorerUrl: string;
  };
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  totalAmount,
  currency,
  onPaymentMethodSelect,
  selectedMethod
}) => {
  const [exchangeRates, setExchangeRates] = useState<Record<WalletCurrency, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<WalletCurrency | undefined>(
    selectedMethod?.currency
  );

  // Mock exchange rates - in a real app, you'd fetch these from an API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock rates - in production, fetch from a crypto price API
        const mockRates: Record<WalletCurrency, number> = {
          BTC: 45000,
          ETH: 2500,
          USDT_TRC20: 1
        };
        
        setExchangeRates(mockRates);
      } catch (err) {
        setError('Failed to fetch exchange rates');
        console.error('Error fetching exchange rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 30 seconds
    const interval = setInterval(fetchExchangeRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCryptoSelect = (currency: WalletCurrency, paymentDetails: any) => {
    setSelectedCrypto(currency);
    
    const networkInfo = CRYPTO_NETWORKS[currency];
    onPaymentMethodSelect({
      type: 'crypto',
      currency,
      amount: paymentDetails.amount,
      displayName: `${networkInfo.name} (${networkInfo.symbol})`,
      walletAddress: paymentDetails.walletAddress,
      qrCodeData: paymentDetails.qrCodeData,
      networkInfo: paymentDetails.networkInfo
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loading />
          <span className="ml-2 text-muted-olive">Loading payment options...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CryptoPaymentSelector
        amount={totalAmount}
        fiatCurrency={currency}
        onCurrencySelect={handleCryptoSelect}
        selectedCurrency={selectedCrypto}
        exchangeRates={exchangeRates || undefined}
      />

      {exchangeRates && (
        <div className="text-xs text-muted-olive text-center">
          Exchange rates are updated every 30 seconds
        </div>
      )}
    </div>
  );
};