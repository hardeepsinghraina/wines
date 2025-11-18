'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { paymentApi } from '@/lib/payment-api';
import { PaymentStatus } from '@/types/payment';

interface PaymentStatusTrackerProps {
  orderId: string;
  onStatusChange?: (status: PaymentStatus) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface PaymentStatusData {
  orderId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  transactionHash?: string;
}

export const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  orderId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 10000
}) => {
  const [statusData, setStatusData] = useState<PaymentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPaymentStatus = async () => {
    try {
      setError(null);
      const data = await paymentApi.getPaymentStatus(orderId);
      setStatusData(data);
      setLastUpdated(new Date());
      
      if (onStatusChange && data.paymentStatus) {
        onStatusChange(data.paymentStatus);
      }
    } catch (err) {
      setError('Failed to fetch payment status');
      console.error('Error fetching payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [orderId]);

  useEffect(() => {
    if (!autoRefresh || !statusData) return;

    // Don't auto-refresh if payment is in a final state
    if (['completed', 'failed', 'expired', 'cancelled', 'refunded'].includes(statusData.paymentStatus)) {
      return;
    }

    const interval = setInterval(fetchPaymentStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, statusData]);

  const getStatusIcon = (status: PaymentStatus): string => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirming':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'expired':
        return '⏰';
      case 'cancelled':
        return '🚫';
      case 'refunded':
        return '↩️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirming':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
      case 'refunded':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-muted-olive bg-gray-50 border-gray-200';
    }
  };

  const getStatusDescription = (status: PaymentStatus): string => {
    switch (status) {
      case 'pending':
        return 'Payment is being processed. Please wait for confirmation.';
      case 'confirming':
        return 'Payment received and being confirmed on the blockchain.';
      case 'completed':
        return 'Payment has been successfully completed and confirmed.';
      case 'failed':
        return 'Payment failed. Please try again or contact support.';
      case 'expired':
        return 'Payment expired. Please initiate a new payment.';
      case 'cancelled':
        return 'Payment was cancelled.';
      case 'refunded':
        return 'Payment has been refunded to your account.';
      default:
        return 'Payment status is being updated.';
    }
  };

  const formatPaymentMethod = (method: string): string => {
    switch (method?.toLowerCase()) {
      case 'crypto':
        return 'Cryptocurrency';

      default:
        return method || 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loading />
          <span className="ml-2 text-muted-olive">Loading payment status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p>{error}</p>
          </div>
          <Button onClick={fetchPaymentStatus} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!statusData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-olive">
          No payment information available for this order.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal-black">
            Payment Status
          </h3>
          <Button
            onClick={fetchPaymentStatus}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor(statusData.paymentStatus)}`}>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3">
              {getStatusIcon(statusData.paymentStatus)}
            </span>
            <div>
              <div className="font-semibold capitalize">
                {statusData.paymentStatus.replace('_', ' ')}
              </div>
              <div className="text-sm opacity-75">
                {formatPaymentMethod(statusData.paymentMethod)}
              </div>
            </div>
          </div>
          <p className="text-sm">
            {getStatusDescription(statusData.paymentStatus)}
          </p>
        </div>

        {statusData.transactionId && (
          <div className="bg-ivory p-4 rounded-lg">
            <div className="text-sm text-muted-olive mb-1">Transaction ID:</div>
            <div className="font-mono text-sm text-charcoal-black break-all">
              {statusData.transactionId}
            </div>
          </div>
        )}

        {statusData.transactionHash && (
          <div className="bg-ivory p-4 rounded-lg">
            <div className="text-sm text-muted-olive mb-1">Transaction Hash:</div>
            <div className="font-mono text-sm text-charcoal-black break-all">
              {statusData.transactionHash}
            </div>
            <Button
              onClick={() => {
                // This would open a blockchain explorer - implementation depends on the crypto
                const explorerUrl = `https://blockchain.info/tx/${statusData.transactionHash}`;
                window.open(explorerUrl, '_blank');
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              View on Blockchain
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-olive text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {autoRefresh && !['completed', 'failed', 'expired', 'cancelled', 'refunded'].includes(statusData.paymentStatus) && (
          <div className="text-xs text-muted-olive text-center">
            Status will refresh automatically every {refreshInterval / 1000} seconds
          </div>
        )}
      </div>
    </Card>
  );
};