'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CartSummary } from '@/types/cart';
import { ShippingOption } from '@/types/shipping';

interface CheckoutSummaryProps {
  summary: CartSummary;
  shippingCost?: number;
  taxAmount?: number;
  showShipping?: boolean;
  showTax?: boolean;
  isCollapsible?: boolean;
  selectedShipping?: ShippingOption | null;
}

export function CheckoutSummary({
  summary,
  shippingCost = 0,
  taxAmount = 0,
  showShipping = false,
  showTax = false,
  isCollapsible = false,
  selectedShipping
}: CheckoutSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  const total = summary.subtotal + shippingCost + taxAmount;

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className="sticky top-6">
      {/* Header - Always Visible */}
      <div 
        className={`p-4 ${isCollapsible ? 'cursor-pointer' : ''} ${
          isCollapsible && !isExpanded ? 'border-b-0' : 'border-b border-gray-200'
        }`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="w-5 h-5 text-burgundy mr-2" />
            <h3 className="font-semibold text-charcoal-black">
              Order Summary
            </h3>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-burgundy mr-2">
              ${total.toFixed(2)}
            </span>
            {isCollapsible && (
              <Button variant="ghost" size="sm" className="p-1">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Quick Summary - Visible when collapsed */}
        {isCollapsible && !isExpanded && (
          <div className="mt-2 text-sm text-muted-olive">
            {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'}
            {showShipping && shippingCost > 0 && ` • Shipping: $${shippingCost.toFixed(2)}`}
          </div>
        )}
      </div>

      {/* Detailed Summary - Expandable */}
      {isExpanded && (
        <div className="p-4 pt-0">
          {/* Items Summary */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
              </span>
              <span className="font-medium text-gray-900">
                ${summary.subtotal.toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            {showShipping && (
              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-600">Shipping</span>
                  {selectedShipping && (
                    <span className="text-xs text-muted-olive">
                      {selectedShipping.name}
                    </span>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
            )}

            {/* Tax */}
            {showTax && taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Discount/Promo Code Section */}
            <div className="pt-2 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-burgundy hover:text-burgundy/80 p-0 h-auto font-normal"
              >
                + Add promo code
              </Button>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-lg font-bold text-burgundy">
                  ${total.toFixed(2)}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure checkout with SSL encryption</span>
            </div>
            
            {/* Payment Methods */}
            <div className="mt-2 flex items-center space-x-1">
              <span className="text-xs text-gray-500">Accepted:</span>
              <div className="flex space-x-1">
                <span className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">BTC</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">ETH</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">USDT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}