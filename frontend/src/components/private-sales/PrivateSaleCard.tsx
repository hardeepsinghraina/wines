'use client';

import React, { useState, useEffect } from 'react';
import { PrivateSale, UserEligibilityStatus } from '../../types/private-sales';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { privateSalesApi } from '../../lib/private-sales-api';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateSaleCardProps {
  sale: PrivateSale;
  onPurchase?: (sale: PrivateSale) => void;
}

export const PrivateSaleCard: React.FC<PrivateSaleCardProps> = ({
  sale,
  onPurchase
}) => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<UserEligibilityStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkEligibility();
    }
  }, [user, sale.id]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const status = await privateSalesApi.checkEligibility(sale.id);
      setEligibility(status);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailabilityPercentage = () => {
    return ((sale.maxQuantity - sale.soldQuantity) / sale.maxQuantity) * 100;
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    return now >= start && now <= end && sale.isActive;
  };

  const isSoldOut = () => {
    return sale.soldQuantity >= sale.maxQuantity;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-charcoal-black mb-2">
              {sale.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy text-white">
                Exclusive
              </span>
              {!isActive() && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-400 text-white">
                  {new Date() < new Date(sale.startDate) ? 'Upcoming' : 'Ended'}
                </span>
              )}
              {isSoldOut() && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                  Sold Out
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-champagne-gold">
              ${sale.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{sale.currency}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {sale.description}
        </p>

        {/* Availability */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500">Available</span>
            <span className="font-medium">
              {sale.maxQuantity - sale.soldQuantity} / {sale.maxQuantity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-champagne-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${getAvailabilityPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Starts:</span>
            <span className="font-medium">{formatDate(sale.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ends:</span>
            <span className="font-medium">{formatDate(sale.endDate)}</span>
          </div>
        </div>

        {/* Eligibility Status */}
        {user && eligibility && (
          <div className="mb-4">
            {eligibility.isEligible ? (
              <div className="flex items-center text-green-600 text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You're eligible for this sale
              </div>
            ) : (
              <div className="text-red-600 text-sm">
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Not eligible
                </div>
                <ul className="text-xs text-gray-500 ml-6">
                  {eligibility.missingCriteria.map((criteria, index) => (
                    <li key={index}>• {criteria}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Eligibility Requirements */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
          <div className="text-xs text-gray-500 space-y-1">
            {sale.eligibilityCriteria.minSpent && (
              <div>• Minimum spending: ${sale.eligibilityCriteria.minSpent.toLocaleString()}</div>
            )}
            {sale.eligibilityCriteria.loyaltyTier && (
              <div>• Loyalty tier: {sale.eligibilityCriteria.loyaltyTier.join(', ')}</div>
            )}
            {sale.eligibilityCriteria.minAccountAge && (
              <div>• Account age: {sale.eligibilityCriteria.minAccountAge} days</div>
            )}
            {sale.eligibilityCriteria.previousPurchases && (
              <div>• Previous purchases: {sale.eligibilityCriteria.previousPurchases}</div>
            )}
            {sale.eligibilityCriteria.inviteOnly && (
              <div>• Invitation required</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`/wines/${sale.wineId}`, '_blank')}
          >
            View Wine
          </Button>
          {user && isActive() && !isSoldOut() && (
            <Button
              className="flex-1"
              disabled={!eligibility?.isEligible || loading}
              onClick={() => onPurchase?.(sale)}
            >
              {loading ? 'Checking...' : eligibility?.isEligible ? 'Purchase' : 'Not Eligible'}
            </Button>
          )}
          {!user && (
            <Button
              className="flex-1"
              onClick={() => window.location.href = '/login'}
            >
              Login to Purchase
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};