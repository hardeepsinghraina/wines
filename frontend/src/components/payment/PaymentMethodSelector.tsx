'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: 'crypto') => void;
  selectedMethod?: 'crypto';
  amount: number;
  currency: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onMethodSelect,
  selectedMethod,
  amount,
  currency
}) => {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Pay with Bitcoin, Ethereum, and other cryptocurrencies',
      icon: '₿',
      benefits: [
        'Lower transaction fees',
        'Fast international payments',
        'Enhanced privacy',
        'No chargebacks'
      ],
      acceptedCurrencies: ['BTC', 'ETH', 'SOL', 'DOGE', 'LTC', 'USDC', 'USDT']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-charcoal-black mb-2">
          Choose Payment Method
        </h2>
        <p className="text-muted-olive">
          Total: {amount.toFixed(2)} {currency.toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isHovered = hoveredMethod === method.id;

          return (
            <Card
              key={method.id}
              className={`p-6 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-champagne-gold bg-ivory shadow-lg'
                  : isHovered
                  ? 'shadow-md bg-gray-50'
                  : 'hover:shadow-md hover:bg-gray-50'
              }`}
              onClick={() => onMethodSelect(method.id as 'crypto')}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{method.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-black">
                        {method.name}
                      </h3>
                      <p className="text-sm text-muted-olive">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-champagne-gold rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-charcoal-black">
                    Benefits:
                  </h4>
                  <ul className="text-sm text-muted-olive space-y-1">
                    {method.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-charcoal-black">
                    Accepted:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {method.acceptedCurrencies.map((curr, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                      >
                        {curr}
                      </span>
                    ))}
                  </div>
                </div>

                {method.id === 'crypto' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800">
                    <strong>Note:</strong> Cryptocurrency payments may take several minutes to confirm.
                  </div>
                )}


              </div>
            </Card>
          );
        })}
      </div>

      {selectedMethod && (
        <div className="text-center">
          <Button
            onClick={() => {
              // This would typically navigate to the next step
              console.log(`Selected payment method: ${selectedMethod}`);
            }}
            className="bg-champagne-gold hover:bg-champagne-gold/90 px-8 py-3"
          >
            Continue with {paymentMethods.find(m => m.id === selectedMethod)?.name}
          </Button>
        </div>
      )}

      <div className="text-center text-xs text-muted-olive">
        <p>
          All payments are secured with industry-standard encryption. 
          Your financial information is never stored on our servers.
        </p>
      </div>
    </div>
  );
};