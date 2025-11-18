'use client';

import React, { useState, useEffect } from 'react';
import { ShippingType, DeliveryEstimate, ShippingZone } from '@/types/shipping';
import { shippingApi } from '@/lib/shipping-api';

interface DeliveryEstimatorProps {
  country: string;
  shippingMethod?: ShippingType;
  className?: string;
}

export function DeliveryEstimator({ 
  country, 
  shippingMethod = ShippingType.STANDARD,
  className = '' 
}: DeliveryEstimatorProps) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShippingZones();
  }, []);

  useEffect(() => {
    if (zones.length > 0) {
      calculateEstimate();
    }
  }, [country, shippingMethod, zones]);

  const loadShippingZones = async () => {
    try {
      const zonesData = await shippingApi.getShippingZones();
      setZones(zonesData);
    } catch (error) {
      console.error('Failed to load shipping zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = () => {
    const zone = zones.find(z => 
      z.countries?.includes(country) || z.id === 'international'
    );

    if (!zone) return;

    let estimatedDays: number;
    
    switch (shippingMethod) {
      case ShippingType.VIP:
        estimatedDays = zone.estimatedDays.vip || zone.estimatedDays.express;
        break;
      case ShippingType.EXPRESS:
      case ShippingType.OVERNIGHT:
        estimatedDays = zone.estimatedDays.express;
        break;
      default:
        estimatedDays = zone.estimatedDays.standard;
    }

    const deliveryDate = calculateDeliveryDate(estimatedDays);
    
    setEstimate({
      method: shippingMethod,
      estimatedDays,
      deliveryDate,
      isBusinessDays: true
    });
  };

  const calculateDeliveryDate = (businessDays: number): string => {
    const today = new Date();
    const currentDate = new Date(today);
    let addedDays = 0;

    while (addedDays < businessDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }

    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMethodDisplayName = (method: ShippingType): string => {
    switch (method) {
      case ShippingType.STANDARD:
        return 'Standard Shipping';
      case ShippingType.EXPRESS:
        return 'Express Shipping';
      case ShippingType.VIP:
        return 'VIP Delivery';
      case ShippingType.OVERNIGHT:
        return 'Overnight Delivery';
      case ShippingType.INTERNATIONAL_STANDARD:
        return 'International Standard';
      case ShippingType.INTERNATIONAL_EXPRESS:
        return 'International Express';
      default:
        return 'Shipping';
    }
  };

  const getDeliveryIcon = (method: ShippingType): string => {
    switch (method) {
      case ShippingType.VIP:
        return '👑';
      case ShippingType.EXPRESS:
      case ShippingType.OVERNIGHT:
        return '⚡';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        <p>Delivery estimate not available</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getDeliveryIcon(estimate.method)}</span>
        <div>
          <p className="font-medium text-gray-900">
            {getMethodDisplayName(estimate.method)}
          </p>
          <p className="text-sm text-gray-600">
            Estimated delivery: <span className="font-medium">{estimate.deliveryDate}</span>
          </p>
          <p className="text-xs text-gray-500">
            ({estimate.estimatedDays} {estimate.isBusinessDays ? 'business' : ''} days)
          </p>
        </div>
      </div>
      
      {estimate.method === ShippingType.VIP && (
        <div className="mt-2 p-2 bg-gold/10 border border-gold/20 rounded text-xs text-gold">
          <p>✨ VIP service includes white-glove delivery and temperature control</p>
        </div>
      )}
      
      {country !== 'US' && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <p>📋 International delivery may require customs clearance</p>
        </div>
      )}
    </div>
  );
}