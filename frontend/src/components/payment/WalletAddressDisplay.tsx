'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  WALLET_ADDRESSES, 
  CRYPTO_NETWORKS,
  type WalletCurrency 
} from '@/lib/crypto-wallets';

interface WalletAddressDisplayProps {
  currency: WalletCurrency;
  amount?: number;
  showQRCode?: boolean;
  className?: string;
}

export const WalletAddressDisplay: React.FC<WalletAddressDisplayProps> = ({
  currency,
  amount,
  showQRCode = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const walletAddress = WALLET_ADDRESSES[currency];
  const networkInfo = CRYPTO_NETWORKS[currency];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const generateQRCode = () => {
    // In a real implementation, this would generate an actual QR code
    // For now, we'll just toggle the display state
    setQrGenerated(!qrGenerated);
  };

  const formatAmount = (amount: number): string => {
    const decimals = networkInfo.decimals;
    const displayDecimals = currency === 'USDT_TRC20' ? 2 : decimals > 6 ? 6 : decimals;
    return amount.toFixed(displayDecimals);
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-charcoal-black">
              {networkInfo.name} Payment
            </h3>
            <p className="text-sm text-muted-olive">
              Network: {networkInfo.network}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-charcoal-black">
              {networkInfo.symbol}
            </div>
            {amount && (
              <div className="text-sm text-muted-olive">
                {formatAmount(amount)} {networkInfo.symbol}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-charcoal-black">
              Wallet Address:
            </label>
            <Button
              onClick={() => copyToClipboard(walletAddress)}
              variant="outline"
              size="sm"
              className={copied ? 'bg-green-50 text-green-700' : ''}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="font-mono text-sm text-charcoal-black break-all">
              {walletAddress}
            </div>
          </div>
        </div>

        {amount && (
          <div className="bg-ivory p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-olive">Amount to send:</span>
              <div className="text-right">
                <div className="font-bold text-charcoal-black">
                  {formatAmount(amount)} {networkInfo.symbol}
                </div>
                <Button
                  onClick={() => copyToClipboard(formatAmount(amount))}
                  variant="outline"
                  size="sm"
                  className="mt-1"
                >
                  Copy Amount
                </Button>
              </div>
            </div>
          </div>
        )}

        {showQRCode && (
          <div className="space-y-2">
            <Button
              onClick={generateQRCode}
              variant="outline"
              className="w-full"
            >
              {qrGenerated ? 'Hide QR Code' : 'Show QR Code'}
            </Button>

            {qrGenerated && (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  {/* In a real implementation, this would be an actual QR code image */}
                  <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-sm text-gray-500 flex-col">
                    <div>QR Code</div>
                    <div className="text-xs mt-1">{currency}</div>
                    {amount && (
                      <div className="text-xs">{formatAmount(amount)}</div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-olive mt-2">
                  Scan with your {networkInfo.name} wallet
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <div className="text-xs text-yellow-800">
            <strong>Network Information:</strong>
            <div className="mt-1 space-y-1">
              <div>• Network: {networkInfo.network}</div>
              <div>• Symbol: {networkInfo.symbol}</div>
              <div>• Decimals: {networkInfo.decimals}</div>
              {currency === 'USDT_TRC20' && (
                <div>• Token Type: TRC20 (Tron Network)</div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={() => window.open(`${networkInfo.explorerUrl}`, '_blank')}
            variant="outline"
            size="sm"
          >
            View on Block Explorer
          </Button>
        </div>
      </div>
    </Card>
  );
};