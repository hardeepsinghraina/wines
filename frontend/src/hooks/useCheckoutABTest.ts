'use client';

import { useState, useEffect } from 'react';
import { useCheckoutAnalytics, ABTestVariant } from '@/lib/checkout-analytics';

interface CheckoutABTestConfig {
  layout?: 'original' | 'simplified' | 'compact';
  formStyle?: 'standard' | 'inline' | 'stepped';
  progressIndicator?: 'steps' | 'progress_bar' | 'breadcrumb';
  buttonStyle?: 'primary' | 'secondary' | 'gradient';
  colorScheme?: 'default' | 'high_contrast' | 'minimal';
  fieldValidation?: 'onBlur' | 'onChange' | 'onSubmit';
  helpText?: 'tooltip' | 'inline' | 'modal';
  paymentOrder?: 'crypto_first' | 'traditional_first' | 'mixed';
}

interface ABTestResult {
  variant: ABTestVariant | null;
  config: CheckoutABTestConfig;
  isLoading: boolean;
  trackConversion: (properties?: Record<string, any>) => void;
}

export function useCheckoutABTest(testId: string): ABTestResult {
  const analytics = useCheckoutAnalytics();
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVariant = async () => {
      try {
        const assignedVariant = analytics.getABTestVariant(testId);
        setVariant(assignedVariant);
      } catch (error) {
        console.error('Failed to load A/B test variant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVariant();
  }, [testId, analytics]);

  const trackConversion = (properties?: Record<string, any>) => {
    if (variant) {
      analytics.trackABTestConversion(testId, variant.id, properties);
    }
  };

  const getConfig = (): CheckoutABTestConfig => {
    if (!variant) {
      return {}; // Default configuration
    }

    return variant.config as CheckoutABTestConfig;
  };

  return {
    variant,
    config: getConfig(),
    isLoading,
    trackConversion
  };
}

// Specific A/B test hooks for different checkout aspects
export function useCheckoutLayoutTest(): ABTestResult {
  return useCheckoutABTest('checkout_layout_test');
}

export function usePaymentFormTest(): ABTestResult {
  return useCheckoutABTest('payment_form_test');
}

export function useProgressIndicatorTest(): ABTestResult {
  return useCheckoutABTest('progress_indicator_test');
}

export function useCheckoutButtonTest(): ABTestResult {
  return useCheckoutABTest('checkout_button_test');
}

// Hook for multiple A/B tests
export function useMultipleCheckoutTests(testIds: string[]) {
  const [tests, setTests] = useState<Record<string, ABTestResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const analytics = useCheckoutAnalytics();

  useEffect(() => {
    const loadTests = async () => {
      const testResults: Record<string, ABTestResult> = {};

      for (const testId of testIds) {
        try {
          const variant = analytics.getABTestVariant(testId);
          testResults[testId] = {
            variant,
            config: variant?.config as CheckoutABTestConfig || {},
            isLoading: false,
            trackConversion: (properties?: Record<string, any>) => {
              if (variant) {
                analytics.trackABTestConversion(testId, variant.id, properties);
              }
            }
          };
        } catch (error) {
          console.error(`Failed to load A/B test variant for ${testId}:`, error);
          testResults[testId] = {
            variant: null,
            config: {},
            isLoading: false,
            trackConversion: () => {}
          };
        }
      }

      setTests(testResults);
      setIsLoading(false);
    };

    loadTests();
  }, [testIds, analytics]);

  return {
    tests,
    isLoading,
    getTest: (testId: string) => tests[testId] || null,
    trackConversion: (testId: string, properties?: Record<string, any>) => {
      const test = tests[testId];
      if (test) {
        test.trackConversion(properties);
      }
    }
  };
}

// Utility functions for A/B test configurations
export const ABTestUtils = {
  // Apply layout configuration
  getLayoutClasses: (config: CheckoutABTestConfig): string => {
    const { layout = 'original' } = config;
    
    switch (layout) {
      case 'simplified':
        return 'checkout-layout-simplified max-w-4xl mx-auto';
      case 'compact':
        return 'checkout-layout-compact max-w-3xl mx-auto space-y-4';
      default:
        return 'checkout-layout-original max-w-6xl mx-auto';
    }
  },

  // Apply form style configuration
  getFormClasses: (config: CheckoutABTestConfig): string => {
    const { formStyle = 'standard' } = config;
    
    switch (formStyle) {
      case 'inline':
        return 'form-style-inline grid grid-cols-2 gap-4';
      case 'stepped':
        return 'form-style-stepped space-y-6';
      default:
        return 'form-style-standard space-y-4';
    }
  },

  // Apply button style configuration
  getButtonClasses: (config: CheckoutABTestConfig): string => {
    const { buttonStyle = 'primary' } = config;
    
    switch (buttonStyle) {
      case 'secondary':
        return 'btn-secondary bg-gray-600 text-white hover:bg-gray-700';
      case 'gradient':
        return 'btn-gradient bg-gradient-to-r from-burgundy to-red-700 text-white';
      default:
        return 'btn-primary bg-burgundy text-ivory hover:bg-opacity-90';
    }
  },

  // Apply color scheme configuration
  getColorSchemeClasses: (config: CheckoutABTestConfig): string => {
    const { colorScheme = 'default' } = config;
    
    switch (colorScheme) {
      case 'high_contrast':
        return 'color-scheme-high-contrast text-black bg-white';
      case 'minimal':
        return 'color-scheme-minimal text-gray-800 bg-gray-50';
      default:
        return 'color-scheme-default';
    }
  },

  // Get validation timing
  getValidationTiming: (config: CheckoutABTestConfig): 'onBlur' | 'onChange' | 'onSubmit' => {
    return config.fieldValidation || 'onBlur';
  },

  // Get help text style
  getHelpTextStyle: (config: CheckoutABTestConfig): 'tooltip' | 'inline' | 'modal' => {
    return config.helpText || 'inline';
  },

  // Get payment method order
  getPaymentOrder: (config: CheckoutABTestConfig): 'crypto_first' | 'traditional_first' | 'mixed' => {
    return config.paymentOrder || 'crypto_first';
  }
};

// Component wrapper for A/B testing
interface ABTestWrapperProps {
  testId: string;
  children: (config: CheckoutABTestConfig, trackConversion: (properties?: Record<string, any>) => void) => React.ReactNode;
  fallback?: React.ReactNode;
}

export function ABTestWrapper({ testId, children, fallback }: ABTestWrapperProps) {
  const { config, isLoading, trackConversion } = useCheckoutABTest(testId);

  if (isLoading) {
    return fallback || null;
  }

  return children(config, trackConversion);
}