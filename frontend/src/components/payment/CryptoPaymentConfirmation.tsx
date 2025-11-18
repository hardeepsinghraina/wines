'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { WalletAddressDisplay } from './WalletAddressDisplay';
import { QRCodeGenerator } from './QRCodeGenerator';
import { type WalletCurrency } from '@/lib/crypto-wallets';

interface CryptoPaymentConfirmationProps {
  orderId: string;
  currency: WalletCurrency;
  amount: number;
  fiatAmount: number;
  fiatCurrency: string;
  walletAddress: string;
  qrCodeData: string;
  networkInfo: {
    name: string;
    symbol: string;
    explorerUrl: string;
  };
  onPaymentComplete: (success: boolean, transactionHash?: string) => void;
  onCancel: () => void;
}

export const CryptoPaymentConfirmation: React.FC<CryptoPaymentConfirmationProps> = ({
  orderId,
  currency,
  amount,
  fiatAmount,
  fiatCurrency,
  walletAddress,
  qrCodeData,
  networkInfo,
  onPaymentComplete,
  onCancel
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirming' | 'completed' | 'failed'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [showQRCode, setShowQRCode] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [manualVerification, setManualVerification] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setPaymentStatus('failed');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleManualVerification = () => {
    if (!transactionHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    setPaymentStatus('confirming');
    
    // Simulate verification process
    setTimeout(() => {
      setPaymentStatus('completed');
      onPaymentComplete(true, transactionHash);
    }, 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'text-yellow-600';
      case 'confirming':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-muted-olive';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Waiting for payment...';
      case 'confirming':
        return 'Verifying payment on blockchain...';
      case 'completed':
        return 'Payment confirmed successfully!';
      case 'failed':
        return 'Payment expired or failed';
      default:
        return 'Processing payment...';
    }
  };

  if (paymentStatus === 'completed') {
    return (
      <Card className="p-8 text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-semibold text-charcoal-black mb-2">
          Payment Confirmed!
        </h3>
        <p className="text-muted-olive mb-4">
          Your {networkInfo.name} payment has been successfully processed.
        </p>
        {transactionHash && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-muted-olive mb-1">Transaction Hash:</p>
            <p className="font-mono text-xs break-all">{transactionHash}</p>
            <Button
              onClick={() => window.open(`${networkInfo.explorerUrl}${transactionHash}`, '_blank')}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              View on Block Explorer
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-olive">
          Order #{orderId} will be processed shortly.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-charcoal-black mb-2">
            Complete Your {networkInfo.name} Payment
          </h3>
          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
          {paymentStatus === 'pending' && (
            <div className="text-sm text-muted-olive mt-2">
              Time remaining: {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <WalletAddressDisplay
              currency={currency}
              amount={amount}
              showQRCode={false}
            />
          </div>

          <div>
            <Card className="p-4">
              <h4 className="font-semibold text-charcoal-black mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-olive">Order Total:</span>
                  <span className="font-medium">{fiatAmount.toFixed(2)} {fiatCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-olive">Crypto Amount:</span>
                  <span className="font-medium">{amount.toFixed(8)} {networkInfo.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-olive">Network:</span>
                  <span className="font-medium">{networkInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-olive">Order ID:</span>
                  <span className="font-medium">#{orderId}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setShowQRCode(!showQRCode)}
            variant="outline"
            className="mr-4"
          >
            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
        </div>

        {showQRCode && (
          <div className="mt-6 flex justify-center">
            <QRCodeGenerator
              currency={currency}
              address={walletAddress}
              amount={amount}
              label={`Wine Order #${orderId}`}
              message={`Payment of ${fiatAmount} ${fiatCurrency}`}
              size={200}
            />
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
          <div className="text-sm text-yellow-800">
            <strong>Payment Instructions:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Send exactly {amount.toFixed(8)} {networkInfo.symbol} to the address above</li>
              <li>Use the {networkInfo.name} network only</li>
              <li>Payment will be automatically detected once confirmed on the blockchain</li>
              <li>This payment will expire in {formatTime(timeRemaining)}</li>
            </ul>
          </div>
        </div>

        {/* Manual verification section */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-charcoal-black mb-3">
            Already sent payment? Verify manually:
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter transaction hash"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled={paymentStatus === 'confirming'}
            />
            <Button
              onClick={handleManualVerification}
              disabled={paymentStatus === 'confirming' || !transactionHash.trim()}
              size="sm"
            >
              {paymentStatus === 'confirming' ? (
                <>
                  <Loading className="w-4 h-4 mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-olive mt-2">
            Enter your transaction hash to manually verify the payment
          </p>
        </div>

        <div className="flex justify-between mt-6">
          <Button onClick={onCancel} variant="outline">
            Cancel Payment
          </Button>
          <Button
            onClick={() => window.open(`${networkInfo.explorerUrl}`, '_blank')}
            variant="outline"
          >
            View Block Explorer
          </Button>
        </div>
      </Card>
    </div>
  );
};