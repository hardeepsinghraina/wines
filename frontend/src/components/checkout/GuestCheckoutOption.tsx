'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, UserPlus, Mail } from 'lucide-react';
import { RealTimeValidator } from '@/lib/checkout-validation';

interface GuestCheckoutOptionProps {
  onGuestCheckout: (email: string) => void;
  onLoginRedirect: () => void;
  onRegisterRedirect: () => void;
  isLoading?: boolean;
}

export function GuestCheckoutOption({
  onGuestCheckout,
  onLoginRedirect,
  onRegisterRedirect,
  isLoading = false
}: GuestCheckoutOptionProps) {
  const [selectedOption, setSelectedOption] = useState<'guest' | 'login' | 'register' | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; message?: string }>({ isValid: true });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setGuestEmail(email);
    
    // Real-time email validation
    const validation = RealTimeValidator.validateFieldRealTime('email', email);
    setEmailValidation(validation);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = RealTimeValidator.validateFieldRealTime('email', guestEmail);
    setEmailValidation(validation);
    
    if (validation.isValid) {
      onGuestCheckout(guestEmail);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-charcoal-black mb-2">
          How would you like to checkout?
        </h2>
        <p className="text-muted-olive">
          Choose your preferred checkout method to continue
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Guest Checkout */}
        <Card 
          className={`p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedOption === 'guest' ? 'ring-2 ring-burgundy border-burgundy' : ''
          }`}
          onClick={() => setSelectedOption('guest')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="font-semibold text-charcoal-black mb-2">Guest Checkout</h3>
            <p className="text-sm text-muted-olive mb-4">
              Quick checkout without creating an account
            </p>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Fastest option
            </div>
          </div>
        </Card>

        {/* Existing User Login */}
        <Card 
          className={`p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedOption === 'login' ? 'ring-2 ring-burgundy border-burgundy' : ''
          }`}
          onClick={() => setSelectedOption('login')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-burgundy" />
            </div>
            <h3 className="font-semibold text-charcoal-black mb-2">Sign In</h3>
            <p className="text-sm text-muted-olive mb-4">
              Access your saved addresses and order history
            </p>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Saved preferences
            </div>
          </div>
        </Card>

        {/* New User Registration */}
        <Card 
          className={`p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedOption === 'register' ? 'ring-2 ring-burgundy border-burgundy' : ''
          }`}
          onClick={() => setSelectedOption('register')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-charcoal-black mb-2">Create Account</h3>
            <p className="text-sm text-muted-olive mb-4">
              Save your info for faster future checkouts
            </p>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Future benefits
            </div>
          </div>
        </Card>
      </div>

      {/* Guest Email Form */}
      {selectedOption === 'guest' && (
        <Card className="p-6">
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div>
              <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="guest-email"
                value={guestEmail}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                  !emailValidation.isValid ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                required
                autoComplete="email"
                aria-invalid={!emailValidation.isValid}
                aria-describedby={!emailValidation.isValid ? 'email-error' : undefined}
              />
              {!emailValidation.isValid && emailValidation.message && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {emailValidation.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                We'll send your order confirmation to this email address
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Guest Checkout Limitations
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>You won't be able to track your order online</li>
                      <li>No order history will be saved</li>
                      <li>Address won't be saved for future purchases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!emailValidation.isValid || !guestEmail.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Continue as Guest'}
            </Button>
          </form>
        </Card>
      )}

      {/* Action Buttons for Login/Register */}
      {selectedOption === 'login' && (
        <div className="text-center">
          <Button onClick={onLoginRedirect} className="w-full md:w-auto px-8">
            Sign In to Your Account
          </Button>
        </div>
      )}

      {selectedOption === 'register' && (
        <div className="text-center">
          <Button onClick={onRegisterRedirect} className="w-full md:w-auto px-8">
            Create New Account
          </Button>
        </div>
      )}

      {/* Benefits Comparison */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4 text-center">
          Why create an account?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Order Tracking</p>
            <p className="text-gray-600">Track your orders in real-time</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Faster Checkout</p>
            <p className="text-gray-600">Saved addresses and payment methods</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">Exclusive Offers</p>
            <p className="text-gray-600">Member-only deals and early access</p>
          </div>
        </div>
      </div>
    </div>
  );
}