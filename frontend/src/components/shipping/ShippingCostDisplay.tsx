'use client';

import React, { useState } from 'react';
import { ShippingCalculationResult } from '@/types/shipping';

interface ShippingCostDisplayProps {
  shippingResult: ShippingCalculationResult | null;
  orderSubtotal: number;
  showBreakdown?: boolean;
  className?: string;
}

export function ShippingCostDisplay({
  shippingResult,
  orderSubtotal,
  showBreakdown = true,
  className = ''
}: ShippingCostDisplayProps) {
  const [showCustomsDetails, setShowCustomsDetails] = useState(false);

  if (!shippingResult) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Enter shipping address to calculate costs</p>
        </div>
      </div>
    );
  }

  const totalWithShipping = orderSubtotal + shippingResult.totalCost;
  const totalWithCustoms = shippingResult.customsInfo
    ? totalWithShipping + shippingResult.customsInfo.estimatedDuty + shippingResult.customsInfo.estimatedTax
    : totalWithShipping;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {showBreakdown && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${orderSubtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${shippingResult.shippingCost.toFixed(2)}</span>
            </div>
            
            {shippingResult.insuranceCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance</span>
                <span className="font-medium">${shippingResult.insuranceCost.toFixed(2)}</span>
              </div>
            )}
            
            {shippingResult.customsInfo && shippingResult.customsInfo.isDutyRequired && (
              <>
                {shippingResult.customsInfo.estimatedDuty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Duty</span>
                    <span className="font-medium">${shippingResult.customsInfo.estimatedDuty.toFixed(2)}</span>
                  </div>
                )}
                
                {shippingResult.customsInfo.estimatedTax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Tax</span>
                    <span className="font-medium">${shippingResult.customsInfo.estimatedTax.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-burgundy">
            ${totalWithCustoms.toFixed(2)} {shippingResult.currency}
          </span>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p>Estimated delivery: {shippingResult.estimatedDeliveryDays} business days</p>
        </div>
      </div>

      {shippingResult.customsInfo && (
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setShowCustomsDetails(!showCustomsDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">
              International Shipping Information
            </span>
            <span className="text-gray-400">
              {showCustomsDetails ? '−' : '+'}
            </span>
          </button>
          
          {showCustomsDetails && (
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Customs Value:</span>
                <span>${shippingResult.customsInfo.customsValue.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>HS Code:</span>
                <span>{shippingResult.customsInfo.hsCode}</span>
              </div>
              
              {shippingResult.customsInfo.restrictions.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-medium text-yellow-800 text-xs">Customs Requirements:</p>
                  <ul className="mt-1 text-xs text-yellow-700">
                    {shippingResult.customsInfo.restrictions.map((restriction, index) => (
                      <li key={index}>• {restriction}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                * Duty and tax amounts are estimates. Actual amounts may vary and are collected by customs authorities.
              </p>
            </div>
          )}
        </div>
      )}

      {shippingResult.restrictions && shippingResult.restrictions.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="font-medium text-blue-800 text-sm">Shipping Information:</p>
            <ul className="mt-1 text-sm text-blue-700">
              {shippingResult.restrictions.map((restriction, index) => (
                <li key={index}>• {restriction}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}