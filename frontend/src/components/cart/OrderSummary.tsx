'use client'

import React from 'react'
import { CartSummary } from '@/types/cart'

interface OrderSummaryProps {
  summary: CartSummary
  showShipping?: boolean
  showTax?: boolean
  shippingCost?: number
  taxAmount?: number
}

export function OrderSummary({ 
  summary, 
  showShipping = false, 
  showTax = false,
  shippingCost = 0,
  taxAmount = 0
}: OrderSummaryProps) {
  // Use enhanced summary data if available, otherwise fall back to props
  const hasDetailedCalculations = summary.tax !== undefined && summary.shipping !== undefined;
  const finalShipping = hasDetailedCalculations ? summary.shipping : (showShipping ? shippingCost : 0);
  const finalTax = hasDetailedCalculations ? summary.tax : (showTax ? taxAmount : 0);
  const finalTotal = hasDetailedCalculations ? summary.total : (summary.subtotal + finalShipping + finalTax);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
        </span>
        <span className="font-medium text-gray-900">
          ${summary.subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        {hasDetailedCalculations || showShipping ? (
          <span className="font-medium text-gray-900">
            {finalShipping === 0 ? 'Free' : `$${finalShipping.toFixed(2)}`}
          </span>
        ) : (
          <span className="text-sm text-gray-500">Calculated at checkout</span>
        )}
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tax</span>
        {hasDetailedCalculations || (showTax && finalTax > 0) ? (
          <span className="font-medium text-gray-900">
            ${finalTax.toFixed(2)}
          </span>
        ) : (
          <span className="text-sm text-gray-500">Calculated at checkout</span>
        )}
      </div>

      {summary.discounts && summary.discounts.length > 0 && (
        <div className="space-y-1">
          {summary.discounts.map((discount, index) => (
            <div key={index} className="flex justify-between text-sm text-green-600">
              <span>Discount ({discount.code})</span>
              <span>-${discount.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-base font-semibold text-burgundy">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Prices in {summary.currency}
        </p>
      </div>

      {summary.estimatedDelivery && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          📦 Estimated delivery: {new Date(summary.estimatedDelivery).toLocaleDateString()}
        </div>
      )}

      {/* Crypto Pricing Note */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        <p>💰 Cryptocurrency payment options available at checkout</p>
      </div>
    </div>
  )
}