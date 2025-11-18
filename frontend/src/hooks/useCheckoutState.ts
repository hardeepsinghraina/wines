'use client';

import { useState, useCallback, useEffect } from 'react';
import { ShippingAddress, ShippingOption } from '@/types/shipping';
import { PaymentMethod } from '@/components/payment/PaymentSelector';
import { CheckoutValidator } from '@/lib/checkout-validation';

export enum CheckoutStep {
  SHIPPING_ADDRESS = 1,
  SHIPPING_METHOD = 2,
  PAYMENT = 3,
  REVIEW = 4,
  CONFIRMATION = 5
}

export interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  useSameAddress: boolean;
  selectedShipping: ShippingOption | null;
  selectedPayment: PaymentMethod | null;
  showCryptoPayment: boolean;
  orderId: string;
  isProcessing: boolean;
  errors: Record<string, string>;
}

const initialState: CheckoutState = {
  step: CheckoutStep.SHIPPING_ADDRESS,
  shippingAddress: null,
  billingAddress: null,
  useSameAddress: true,
  selectedShipping: null,
  selectedPayment: null,
  showCryptoPayment: false,
  orderId: '',
  isProcessing: false,
  errors: {}
};

const STORAGE_KEY = 'checkoutState';

export function useCheckoutState() {
  const [state, setState] = useState<CheckoutState>(initialState);

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setState(prev => ({ ...prev, ...parsedState, isProcessing: false }));
        } catch (error) {
          console.error('Failed to parse saved checkout state:', error);
        }
      }
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<CheckoutState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setShippingAddress = useCallback((address: ShippingAddress) => {
    setState(prev => ({
      ...prev,
      shippingAddress: address,
      billingAddress: prev.useSameAddress ? address : prev.billingAddress,
      errors: { ...prev.errors, shippingAddress: '', firstName: '', lastName: '', street: '', city: '', state: '', postalCode: '', country: '' }
    }));
  }, []);

  const setBillingAddress = useCallback((address: ShippingAddress) => {
    setState(prev => ({
      ...prev,
      billingAddress: address,
      errors: { ...prev.errors, billingAddress: '' }
    }));
  }, []);

  const setUseSameAddress = useCallback((useSame: boolean) => {
    setState(prev => ({
      ...prev,
      useSameAddress: useSame,
      billingAddress: useSame ? prev.shippingAddress : null
    }));
  }, []);

  const setShippingMethod = useCallback((method: ShippingOption) => {
    setState(prev => ({
      ...prev,
      selectedShipping: method,
      errors: { ...prev.errors, shippingMethod: '' }
    }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({
      ...prev,
      selectedPayment: method,
      errors: { ...prev.errors, paymentMethod: '', cryptoCurrency: '', walletAddress: '', cryptoAmount: '' }
    }));
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    let validation;
    const newErrors: Record<string, string> = {};

    switch (state.step) {
      case CheckoutStep.SHIPPING_ADDRESS:
        validation = CheckoutValidator.validateShippingAddress(state.shippingAddress);
        if (!state.useSameAddress) {
          const billingValidation = CheckoutValidator.validateBillingAddress(
            state.billingAddress, 
            state.useSameAddress, 
            state.shippingAddress
          );
          validation.errors.push(...billingValidation.errors);
        }
        break;
      case CheckoutStep.SHIPPING_METHOD:
        validation = CheckoutValidator.validateShippingMethod(state.selectedShipping);
        break;
      case CheckoutStep.PAYMENT:
        validation = CheckoutValidator.validatePaymentMethod(state.selectedPayment);
        break;
      case CheckoutStep.REVIEW:
        validation = CheckoutValidator.validateCompleteCheckout(
          state.shippingAddress,
          state.billingAddress,
          state.useSameAddress,
          state.selectedShipping,
          state.selectedPayment,
          [] // Cart items would be passed from the component
        );
        break;
      default:
        validation = { isValid: true, errors: [] };
    }

    validation.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    setState(prev => ({ ...prev, errors: { ...prev.errors, ...newErrors } }));
    return validation.isValid;
  }, [state]);

  const nextStep = useCallback((): boolean => {
    if (validateCurrentStep()) {
      const nextStepNumber = Math.min(state.step + 1, CheckoutStep.CONFIRMATION);
      setState(prev => ({ ...prev, step: nextStepNumber }));
      return true;
    }
    return false;
  }, [state.step, validateCurrentStep]);

  const previousStep = useCallback(() => {
    const prevStepNumber = Math.max(state.step - 1, CheckoutStep.SHIPPING_ADDRESS);
    setState(prev => ({ ...prev, step: prevStepNumber }));
  }, [state.step]);

  const goToStep = useCallback((step: CheckoutStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }));
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: message }
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const showCryptoPaymentScreen = useCallback((orderId: string) => {
    setState(prev => ({
      ...prev,
      orderId,
      showCryptoPayment: true,
      step: CheckoutStep.CONFIRMATION
    }));
  }, []);

  const hideCryptoPaymentScreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCryptoPayment: false,
      step: CheckoutStep.PAYMENT
    }));
  }, []);

  return {
    state,
    updateState,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
    setShippingMethod,
    setPaymentMethod,
    validateCurrentStep,
    nextStep,
    previousStep,
    goToStep,
    setProcessing,
    setError,
    clearError,
    clearAllErrors,
    reset,
    showCryptoPaymentScreen,
    hideCryptoPaymentScreen
  };
}