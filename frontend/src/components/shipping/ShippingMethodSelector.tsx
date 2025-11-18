'use client';

import React, { useState, useEffect } from 'react';
import { ShippingOption, ShippingType, VipDeliveryOptions } from '@/types/shipping';
import { shippingApi } from '@/lib/shipping-api';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

interface ShippingMethodSelectorProps {
  country: string;
  orderValue: number;
  orderWeight?: number;
  selectedMethod?: ShippingType;
  onMethodSelect: (method: ShippingOption) => void;
  onVipOptionsChange?: (options: VipDeliveryOptions) => void;
}

export function ShippingMethodSelector({
  country,
  orderValue,
  orderWeight,
  selectedMethod,
  onMethodSelect,
  onVipOptionsChange
}: ShippingMethodSelectorProps) {
  const [methods, setMethods] = useState<ShippingOption[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [vipOptions, setVipOptions] = useState<VipDeliveryOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVipDetails, setShowVipDetails] = useState(false);

  useEffect(() => {
    loadShippingMethods();
  }, [country, orderValue, orderWeight]);

  useEffect(() => {
    if (selectedMethod === ShippingType.VIP && orderValue >= 500) {
      loadVipOptions();
    }
  }, [selectedMethod, orderValue]);

  const loadShippingMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await shippingApi.getShippingMethods(country, orderWeight, orderValue);
      setMethods(result.availableMethods);
      setRestrictions(result.restrictions);
      
      // Auto-select first method if none selected
      if (!selectedMethod && result.availableMethods.length > 0) {
        onMethodSelect(result.availableMethods[0]);
      }
    } catch (err) {
      setError('Failed to load shipping methods');
      console.error('Failed to load shipping methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVipOptions = async () => {
    try {
      const options = await shippingApi.getVipOptions(orderValue);
      setVipOptions(options);
      onVipOptionsChange?.(options);
    } catch (err) {
      console.error('Failed to load VIP options:', err);
    }
  };

  const formatDeliveryDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMethodIcon = (method: ShippingType): string => {
    switch (method) {
      case ShippingType.STANDARD:
        return '📦';
      case ShippingType.EXPRESS:
        return '⚡';
      case ShippingType.VIP:
        return '👑';
      case ShippingType.OVERNIGHT:
        return '🌙';
      default:
        return '🚚';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>
        <div className="text-red-600 text-center py-4">
          <p>{error}</p>
          <Button onClick={loadShippingMethods} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>
      
      {restrictions.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium text-sm">Important Information:</p>
          <ul className="mt-2 text-sm text-yellow-700">
            {restrictions.map((restriction, index) => (
              <li key={index}>• {restriction}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.method}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.method
                ? 'border-burgundy bg-burgundy/5 ring-2 ring-burgundy/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onMethodSelect(method)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getMethodIcon(method.method)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    {method.isVipService && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Estimated delivery: {formatDeliveryDate(method.estimatedDays)}</p>
                    <p>({method.estimatedDays} business days)</p>
                  </div>

                  {method.features.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {method.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {feature}
                          </span>
                        ))}
                        {method.features.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{method.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${method.totalCost.toFixed(2)}
                </div>
                {method.insuranceCost > 0 && (
                  <div className="text-xs text-gray-500">
                    (incl. ${method.insuranceCost.toFixed(2)} insurance)
                  </div>
                )}
              </div>
            </div>

            {selectedMethod === method.method && method.isVipService && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVipDetails(!showVipDetails);
                  }}
                >
                  {showVipDetails ? 'Hide' : 'Show'} VIP Service Details
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showVipDetails && vipOptions && selectedMethod === ShippingType.VIP && (
        <div className="mt-4 p-4 bg-gold/5 border border-gold/20 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">VIP Service Includes:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {vipOptions.whiteGloveService && (
              <div className="flex items-center space-x-2">
                <span className="text-gold">✓</span>
                <span>White-glove delivery service</span>
              </div>
            )}
            {vipOptions.temperatureControlled && (
              <div className="flex items-center space-x-2">
                <span className="text-gold">✓</span>
                <span>Temperature-controlled transport</span>
              </div>
            )}
            {vipOptions.signatureRequired && (
              <div className="flex items-center space-x-2">
                <span className="text-gold">✓</span>
                <span>Signature required delivery</span>
              </div>
            )}
            {vipOptions.appointmentDelivery && (
              <div className="flex items-center space-x-2">
                <span className="text-gold">✓</span>
                <span>Scheduled appointment delivery</span>
              </div>
            )}
            {vipOptions.unpackingService && (
              <div className="flex items-center space-x-2">
                <span className="text-gold">✓</span>
                <span>Professional unpacking service</span>
              </div>
            )}
          </div>
          
          {vipOptions.additionalCost > 0 && (
            <div className="mt-3 pt-3 border-t border-gold/20">
              <p className="text-sm text-gray-600">
                Additional VIP service fee: <span className="font-medium">${vipOptions.additionalCost.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {methods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No shipping methods available for this location.</p>
          <p className="text-sm mt-1">Please contact customer service for assistance.</p>
        </div>
      )}
    </div>
  );
}