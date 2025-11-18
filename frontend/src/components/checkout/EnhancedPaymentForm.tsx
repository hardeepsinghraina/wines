'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PaymentSelector } from '@/components/payment/PaymentSelector';
import { AccessibilityHelper } from '@/lib/checkout-validation';
import type { PaymentMethod } from '@/components/payment/PaymentSelector';

interface EnhancedPaymentFormProps {
  totalAmount: number;
  currency: string;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
  savedPaymentMethods?: PaymentMethod[];
  onSelectSavedMethod?: (method: PaymentMethod) => void;
  isLoading?: boolean;
  formId?: string;
}

export function EnhancedPaymentForm({
  totalAmount,
  currency,
  onPaymentMethodSelect,
  selectedMethod,
  savedPaymentMethods = [],
  onSelectSavedMethod,
  isLoading = false,
  formId = 'payment-form'
}: EnhancedPaymentFormProps) {
  const [showSavedMethods, setShowSavedMethods] = useState(false);

  // Show saved methods if available
  useEffect(() => {
    setShowSavedMethods(savedPaymentMethods.length > 0);
  }, [savedPaymentMethods]);

  const handleSavedMethodSelect = (method: PaymentMethod) => {
    onSelectSavedMethod?.(method);
    onPaymentMethodSelect(method);
  };

  return (
    <div className="space-y-6">
      {/* Saved Payment Methods */}
      {showSavedMethods && (
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Use a saved payment method
          </h4>
          <div className="space-y-2">
            {savedPaymentMethods.map((method, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSavedMethodSelect(method)}
                className={`w-full text-left p-3 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent ${
                  selectedMethod?.currency === method.currency
                    ? 'border-burgundy bg-burgundy/5'
                    : 'border-gray-200 hover:border-burgundy hover:bg-gray-50'
                }`}
                aria-pressed={selectedMethod?.currency === method.currency}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {method.displayName}
                    </div>
                    <div className="text-gray-600">
                      {method.type === 'crypto' ? 'Cryptocurrency' : 'Credit Card'}
                    </div>
                  </div>
                  {selectedMethod?.currency === method.currency && (
                    <div className="w-4 h-4 bg-burgundy rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowSavedMethods(false)}
              className="text-sm text-burgundy hover:text-burgundy/80 focus:outline-none focus:underline"
            >
              or use a different payment method
            </button>
          </div>
        </Card>
      )}

      {/* Payment Method Selection */}
      {(!showSavedMethods || !selectedMethod) && (
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">
              Payment Method
            </h3>
            <p className="text-sm text-muted-olive">
              Select your preferred payment method
            </p>
          </div>

          <PaymentSelector
            totalAmount={totalAmount}
            currency={currency}
            onPaymentMethodSelect={onPaymentMethodSelect}
            selectedMethod={selectedMethod}
          />

          {/* Payment Security Notice */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>
            </div>
          </div>

          {/* Cryptocurrency Benefits */}
          {selectedMethod?.type === 'crypto' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Cryptocurrency Payment Benefits
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Lower transaction fees</li>
                      <li>Faster international payments</li>
                      <li>Enhanced privacy and security</li>
                      <li>No chargebacks or payment disputes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Payment Summary */}
      {selectedMethod && (
        <Card className="p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-900">{selectedMethod.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-gray-900">
                {selectedMethod.type === 'crypto' 
                  ? `${selectedMethod.amount} ${selectedMethod.currency}`
                  : `$${totalAmount.toFixed(2)} ${currency}`
                }
              </span>
            </div>
            {selectedMethod.type === 'crypto' && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Equivalent to:</span>
                <span>${totalAmount.toFixed(2)} {currency}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}