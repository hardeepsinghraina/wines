'use client';

import React from 'react';
import { ChevronLeft, ShoppingCart, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CheckoutMobileNavigationProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  onPrevious: () => void;
  canGoBack: boolean;
}

const stepIcons = {
  1: ShoppingCart,
  2: Truck,
  3: CreditCard,
  4: CheckCircle,
};

export function CheckoutMobileNavigation({
  currentStep,
  totalSteps,
  stepTitle,
  onPrevious,
  canGoBack
}: CheckoutMobileNavigationProps) {
  const IconComponent = stepIcons[currentStep as keyof typeof stepIcons] || ShoppingCart;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="p-1 mr-2 hover:bg-gray-100"
              aria-label="Go back to previous step"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-burgundy/10 rounded-full flex items-center justify-center mr-2">
              <IconComponent className="w-4 h-4 text-burgundy" />
            </div>
            <h2 className="font-semibold text-charcoal-black text-sm">
              {stepTitle}
            </h2>
          </div>
        </div>
        
        <div className="text-xs text-muted-olive bg-gray-100 px-2 py-1 rounded">
          {currentStep}/{totalSteps}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-burgundy to-champagne-gold h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index + 1}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index + 1 <= currentStep ? 'bg-burgundy' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}