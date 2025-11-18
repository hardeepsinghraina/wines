'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  completed: boolean;
  isActive: boolean;
}

interface CheckoutProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
}

export function CheckoutProgressIndicator({ 
  steps, 
  currentStep, 
  onStepClick 
}: CheckoutProgressIndicatorProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-4 max-w-4xl w-full">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <button
                onClick={() => onStepClick?.(step.number)}
                disabled={!onStepClick || step.number > currentStep}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                  ${step.isActive 
                    ? "bg-burgundy text-ivory ring-4 ring-burgundy/20" 
                    : step.completed
                    ? "bg-champagne-gold text-charcoal-black hover:bg-champagne-gold/80"
                    : "bg-gray-200 text-gray-600"
                  }
                  ${onStepClick && step.number < currentStep ? 'cursor-pointer hover:scale-105' : ''}
                  ${step.number > currentStep ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </button>
              
              {/* Step Title */}
              <div className="ml-3 hidden sm:block">
                <span className={`text-sm font-medium ${
                  step.isActive 
                    ? "text-burgundy" 
                    : step.completed
                    ? "text-charcoal-black"
                    : "text-gray-500"
                }`}>
                  {step.title}
                </span>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-px transition-colors duration-200 ${
                  step.completed ? "bg-champagne-gold" : "bg-gray-300"
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}