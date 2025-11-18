'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { 
  WALLET_ADDRESSES, 
  CRYPTO_NETWORKS, 
  getSupportedCryptoCurrencies,
  type WalletCurrency 
} from '@/lib/crypto-wallets';
import { generateQRCodeData, createCryptoPaymentDetails } from '@/lib/crypto-utils';

interface CryptoPaymentSelectorProps {
  amount: number;
  fiatCurrency: string;
  onCurrencySelect: (currency: WalletCurrency, paymentDetails: any) => void;
  selectedCurrency?: WalletCurrency;
  exchangeRates?: Record<WalletCurrency, number>;
}

export const CryptoPaymentSelector: React.FC<CryptoPaymentSelectorProps> = ({
  amount,
  fiatCurrency,
  onCurrencySelect,
  selectedCurrency,
  exchangeRates
}) => {
  const [loadingRates, setLoadingRates] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<WalletCurrency, string>>({} as Record<WalletCurrency, string>);
  const [generatingQR, setGeneratingQR] = useState<WalletCurrency | null>(null);

  const supportedCurrencies = getSupportedCryptoCurrencies();

  // Mock exchange rates if not provided
  const defaultRates: Record<WalletCurrency, number> = {
    BTC: 45000,
    ETH: 2500,
    USDT_TRC20: 1
  };

  const rates = exchangeRates || defaultRates;

  const calculateCryptoAmount = (currency: WalletCurrency): number => {
    const rate = rates[currency];
    if (!rate) return 0;
    return amount / rate;
  };

  const generateQRCode = async (currency: WalletCurrency, cryptoAmount: number) => {
    setGeneratingQR(currency);
    try {
      // In a real implementation, you would use a QR code library like qrcode
      // For now, we'll create a data URL that can be used with QR code generation
      const qrData = generateQRCodeData({
        currency,
        address: WALLET_ADDRESSES[currency],
        amount: cryptoAmount,
        label: `Wine Order Payment`,
        message: `Payment of ${cryptoAmount} ${currency}`
      });
      
      // This would typically generate an actual QR code image
      // For now, we'll store the QR data string
      setQrCodes(prev => ({
        ...prev,
        [currency]: qrData
      }));
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleCurrencySelect = (currency: WalletCurrency) => {
    const cryptoAmount = calculateCryptoAmount(currency);
    const paymentDetails = createCryptoPaymentDetails(
      currency,
      cryptoAmount,
      'Wine Order Payment',
      `Payment of ${amount} ${fiatCurrency}`
    );

    onCurrencySelect(currency, {
      ...paymentDetails,
      fiatAmount: amount,
      fiatCurrency,
      exchangeRate: rates[currency]
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatCryptoAmount = (currency: WalletCurrency, amount: number): string => {
    const decimals = CRYPTO_NETWORKS[currency].decimals;
    const displayDecimals = currency === 'USDT_TRC20' ? 2 : decimals > 6 ? 6 : decimals;
    return amount.toFixed(displayDecimals);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-charcoal-black mb-2">
          Select Cryptocurrency
        </h3>
        <p className="text-muted-olive">
          Total: {amount.toFixed(2)} {fiatCurrency.toUpperCase()}
        </p>
      </div>

      {loadingRates && (
        <div className="text-center">
          <Loading />
          <p className="mt-2 text-sm text-muted-olive">Loading exchange rates...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supportedCurrencies.map((currency) => {
          const cryptoAmount = calculateCryptoAmount(currency);
          const networkInfo = CRYPTO_NETWORKS[currency];
          const isSelected = selectedCurrency === currency;
          const walletAddress = WALLET_ADDRESSES[currency];

          return (
            <Card
              key={currency}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-champagne-gold bg-ivory shadow-lg'
                  : 'hover:shadow-md hover:bg-gray-50'
              }`}
              onClick={() => handleCurrencySelect(currency)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-charcoal-black">
                      {networkInfo.name}
                    </h4>
                    <p className="text-sm text-muted-olive">
                      {networkInfo.symbol}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-champagne-gold rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-bold text-charcoal-black">
                    {formatCryptoAmount(currency, cryptoAmount)} {networkInfo.symbol}
                  </div>
                  <div className="text-xs text-muted-olive">
                    Rate: 1 {networkInfo.symbol} = {rates[currency].toLocaleString()} {fiatCurrency}
                  </div>
                </div>

                {isSelected && (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-olive">Wallet Address:</div>
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                        {walletAddress}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(walletAddress);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Copy Address
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateQRCode(currency, cryptoAmount);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={generatingQR === currency}
                      >
                        {generatingQR === currency ? (
                          <>
                            <Loading className="w-4 h-4 mr-2" />
                            Generating QR...
                          </>
                        ) : (
                          'Generate QR Code'
                        )}
                      </Button>

                      {qrCodes[currency] && (
                        <div className="text-center">
                          <div className="bg-white p-2 rounded border inline-block">
                            {/* In a real implementation, this would be an actual QR code image */}
                            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                              QR Code
                              <br />
                              {currency}
                            </div>
                          </div>
                          <div className="text-xs text-muted-olive mt-1">
                            Scan with your wallet app
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800">
                      <strong>Network:</strong> {networkInfo.network}
                      <br />
                      <strong>Send exactly:</strong> {formatCryptoAmount(currency, cryptoAmount)} {networkInfo.symbol}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedCurrency && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="text-sm text-red-800">
            <strong>Important Payment Instructions:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Send exactly {formatCryptoAmount(selectedCurrency, calculateCryptoAmount(selectedCurrency))} {CRYPTO_NETWORKS[selectedCurrency].symbol}</li>
              <li>Use the {CRYPTO_NETWORKS[selectedCurrency].network} network only</li>
              <li>Double-check the wallet address before sending</li>
              <li>Payments may take several minutes to confirm</li>
              <li>Sending wrong amount or to wrong address will result in loss of funds</li>
            </ul>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-muted-olive">
        <p>
          Exchange rates are updated in real-time. 
          Final amount may vary slightly due to market fluctuations.
        </p>
      </div>
    </div>
  );
};