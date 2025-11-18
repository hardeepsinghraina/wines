'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { paymentApi } from '@/lib/payment-api';
import { CryptoPaymentResponse, PaymentStatus, SupportedCryptoCurrency } from '@/types/payment';

interface CryptoPaymentFlowProps {
  orderId: string;
  amount: number;
  currency: string;
  cryptoCurrency: SupportedCryptoCurrency;
  onPaymentComplete: (success: boolean, transactionHash?: string) => void;
  onCancel: () => void;
}

export const CryptoPaymentFlow: React.FC<CryptoPaymentFlowProps> = ({
  orderId,
  amount,
  currency,
  cryptoCurrency,
  onPaymentComplete,
  onCancel
}) => {
  const [paymentData, setPaymentData] = useState<CryptoPaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastVerificationTime, setLastVerificationTime] = useState<Date | null>(null);

  useEffect(() => {
    const initiateCryptoPayment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await paymentApi.initiateCryptoPayment({
          orderId,
          amount,
          currency,
          cryptoCurrency,
          description: `Wine Order #${orderId}`
        });
        
        setPaymentData(response);
        setTimeRemaining(Math.floor((response.expiresAt - Date.now()) / 1000));
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to initiate crypto payment';
        setError(errorMessage);
        setLoading(false);
        console.error('Error initiating crypto payment:', err);
      }
    };

    initiateCryptoPayment();
  }, [orderId, amount, currency, cryptoCurrency]);

  useEffect(() => {
    if (!paymentData) return;

    let pollInterval: NodeJS.Timeout;
    let pollCount = 0;
    const maxPollAttempts = 180; // 30 minutes with 10-second intervals

    // Start polling for payment status with enhanced error handling
    const startPolling = () => {
      pollInterval = setInterval(async () => {
        try {
          setIsRetrying(true);
          const verification = await paymentApi.verifyCryptoPayment(paymentData.paymentId);
          setPaymentStatus(verification.status as PaymentStatus);
          setLastVerificationTime(new Date());
          setIsRetrying(false);
          
          if (verification.status === 'completed') {
            clearInterval(pollInterval);
            onPaymentComplete(true, verification.transactionHash);
            return;
          } 
          
          if (verification.status === 'failed') {
            clearInterval(pollInterval);
            setError('Payment failed. Please try again with a new payment.');
            onPaymentComplete(false);
            return;
          }
          
          if (verification.status === 'expired') {
            clearInterval(pollInterval);
            setError('Payment expired. Please start a new payment.');
            onPaymentComplete(false);
            return;
          }

          pollCount++;
          if (pollCount >= maxPollAttempts) {
            clearInterval(pollInterval);
            setError('Payment verification timeout. Please contact support if you have sent the payment.');
          }

        } catch (err: any) {
          setIsRetrying(false);
          setRetryCount(prev => prev + 1);
          
          // If we've had too many consecutive errors, stop polling
          if (retryCount >= 5) {
            clearInterval(pollInterval);
            setError('Unable to verify payment status. Please contact support.');
            return;
          }
          
          console.error('Error verifying payment:', err);
        }
      }, 10000); // Poll every 10 seconds
    };

    startPolling();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [paymentData, onPaymentComplete, retryCount]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success feedback
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = '#10b981';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleRetryPayment = async () => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(true);
    
    try {
      const verification = await paymentApi.verifyCryptoPayment(paymentData!.paymentId);
      setPaymentStatus(verification.status as PaymentStatus);
      setLastVerificationTime(new Date());
    } catch (err: any) {
      setError('Failed to retry payment verification. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'confirming':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-muted-olive';
    }
  };

  const getStatusMessage = (status: PaymentStatus): string => {
    switch (status) {
      case 'pending':
        return 'Waiting for payment...';
      case 'confirming':
        return 'Payment received, confirming on blockchain...';
      case 'completed':
        return 'Payment confirmed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'expired':
        return 'Payment expired. Please start a new payment.';
      default:
        return 'Processing payment...';
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center">
          <Loading />
          <p className="mt-4 text-muted-olive">Preparing crypto payment...</p>
        </div>
      </Card>
    );
  }

  if (error || !paymentData) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p>{error || 'Failed to load payment data'}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-charcoal-black mb-2">
            Pay with {cryptoCurrency}
          </h3>
          <div className={`text-lg font-medium ${getStatusColor(paymentStatus)}`}>
            {getStatusMessage(paymentStatus)}
          </div>
          {timeRemaining > 0 && paymentStatus === 'pending' && (
            <div className="text-sm text-muted-olive mt-2">
              Time remaining: {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Payment Status Indicator */}
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-charcoal-black">Payment Status</div>
                <div className={`text-lg font-semibold ${getStatusColor(paymentStatus)}`}>
                  {getStatusMessage(paymentStatus)}
                </div>
                {lastVerificationTime && (
                  <div className="text-xs text-muted-olive">
                    Last checked: {lastVerificationTime.toLocaleTimeString()}
                  </div>
                )}
              </div>
              {isRetrying && (
                <div className="flex items-center text-blue-600">
                  <Loading />
                  <span className="ml-2 text-sm">Checking...</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-ivory p-4 rounded-lg">
            <div className="text-sm text-muted-olive mb-1">Amount to send:</div>
            <div className="text-2xl font-bold text-charcoal-black flex items-center justify-between">
              <span>{paymentData.amount} {cryptoCurrency}</span>
              <Button
                onClick={() => copyToClipboard(paymentData.amount.toString())}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="bg-ivory p-4 rounded-lg">
            <div className="text-sm text-muted-olive mb-1">Payment address:</div>
            <div className="font-mono text-sm text-charcoal-black break-all flex items-start justify-between">
              <span className="flex-1 mr-2">{paymentData.paymentAddress}</span>
              <Button
                onClick={() => copyToClipboard(paymentData.paymentAddress)}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                Copy
              </Button>
            </div>
          </div>

          {paymentData.qrCode && (
            <div className="text-center">
              <Button
                onClick={() => setShowInstructions(true)}
                variant="outline"
                className="mb-4"
              >
                Show QR Code & Instructions
              </Button>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Send exactly {paymentData.amount} {cryptoCurrency}</li>
                <li>Use the exact address provided above</li>
                <li>Payment will expire in {formatTime(timeRemaining)}</li>
                <li>Confirmation may take several minutes</li>
                <li>Do not send from an exchange - use a personal wallet</li>
              </ul>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">Payment Error</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
                <Button
                  onClick={handleRetryPayment}
                  variant="outline"
                  size="sm"
                  disabled={isRetrying}
                  className="ml-4 text-red-700 border-red-300 hover:bg-red-50"
                >
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </Button>
              </div>
            </div>
          )}

          {/* Retry Information */}
          {retryCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Verification attempts:</strong> {retryCount}
                <br />
                If you have sent the payment, please wait for blockchain confirmation.
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-6">
          <Button onClick={onCancel} variant="outline" className="w-full sm:w-auto">
            Cancel Payment
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handleRetryPayment}
              variant="outline"
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              {isRetrying ? 'Checking...' : 'Check Status'}
            </Button>
            <Button
              onClick={() => window.open(paymentData.paymentUrl, '_blank')}
              className="bg-champagne-gold hover:bg-champagne-gold/90 w-full sm:w-auto"
            >
              Open in Wallet
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title={`${cryptoCurrency} Payment Instructions`}
      >
        <div className="space-y-4">
          <div className="text-center">
            {paymentData.qrCode && (
              <div className="mb-4">
                <img
                  src={paymentData.qrCode}
                  alt="Payment QR Code"
                  className="mx-auto max-w-xs"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <strong>Step 1:</strong> Open your {cryptoCurrency} wallet
            </div>
            <div>
              <strong>Step 2:</strong> Scan the QR code or copy the payment address
            </div>
            <div>
              <strong>Step 3:</strong> Send exactly {paymentData.amount} {cryptoCurrency}
            </div>
            <div>
              <strong>Step 4:</strong> Wait for blockchain confirmation
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
            <strong>Warning:</strong> Sending the wrong amount or to the wrong address will result in loss of funds.
          </div>
        </div>
      </Modal>
    </div>
  );
};