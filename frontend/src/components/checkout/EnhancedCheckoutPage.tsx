'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckoutProgressIndicator } from '@/components/checkout/CheckoutProgressIndicator';
import { CheckoutPerformanceMonitor } from '@/components/checkout/CheckoutPerformanceMonitor';
import { CheckoutFeedbackModal } from '@/components/checkout/CheckoutFeedbackModal';
import { CheckoutAnalyticsErrorBoundary } from '@/components/checkout/CheckoutAnalyticsErrorBoundary';
import { useCheckoutAnalytics, CheckoutFunnelStage, CheckoutErrorType } from '@/lib/checkout-analytics';
import { useCheckoutABTest, ABTestUtils } from '@/hooks/useCheckoutABTest';
import { useCheckoutState } from '@/hooks/useCheckoutState';

interface EnhancedCheckoutPageProps {
  initialStep?: number;
}

const CHECKOUT_STEPS = [
  { id: 1, name: 'Shipping Address', stage: CheckoutFunnelStage.SHIPPING_ADDRESS },
  { id: 2, name: 'Shipping Method', stage: CheckoutFunnelStage.SHIPPING_METHOD },
  { id: 3, name: 'Payment Method', stage: CheckoutFunnelStage.PAYMENT_METHOD },
  { id: 4, name: 'Review Order', stage: CheckoutFunnelStage.ORDER_REVIEW },
  { id: 5, name: 'Complete', stage: CheckoutFunnelStage.ORDER_COMPLETE }
];

export function EnhancedCheckoutPage({ initialStep = 1 }: EnhancedCheckoutPageProps) {
  const router = useRouter();
  const analytics = useCheckoutAnalytics();
  const { state, updateState, reset } = useCheckoutState();
  
  // A/B Tests
  const layoutTest = useCheckoutABTest('checkout_layout_test');
  const formTest = useCheckoutABTest('payment_form_test');
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState<CheckoutFunnelStage>(CheckoutFunnelStage.CHECKOUT_START);

  // Initialize analytics session
  useEffect(() => {
    analytics.initializeSession();
    analytics.trackFunnelStage(CheckoutFunnelStage.CHECKOUT_START);
  }, [analytics]);

  // Track step changes
  useEffect(() => {
    const currentStage = CHECKOUT_STEPS.find(step => step.id === currentStep)?.stage;
    if (currentStage) {
      analytics.trackFunnelStage(currentStage, {
        stepNumber: currentStep,
        abTestVariants: {
          layout: layoutTest.variant?.id,
          form: formTest.variant?.id
        }
      });
    }
  }, [currentStep, analytics, layoutTest.variant, formTest.variant]);

  // Handle step navigation
  const handleNextStep = async () => {
    analytics.startPerformanceTimer('step_transition');
    
    try {
      setIsLoading(true);
      
      // Validate current step
      const isValid = await validateCurrentStep();
      if (!isValid) {
        analytics.trackCheckoutError(
          CheckoutErrorType.VALIDATION_ERROR,
          CHECKOUT_STEPS[currentStep - 1].stage,
          'Step validation failed',
          { step: currentStep }
        );
        return;
      }

      // Move to next step
      if (currentStep < CHECKOUT_STEPS.length) {
        setCurrentStep(currentStep + 1);
        analytics.trackFormInteraction('navigation', 'next_step', {
          fromStep: currentStep,
          toStep: currentStep + 1
        });
      }
    } catch (error) {
      analytics.trackCheckoutError(
        CheckoutErrorType.SERVER_ERROR,
        CHECKOUT_STEPS[currentStep - 1].stage,
        error instanceof Error ? error.message : 'Unknown error',
        { step: currentStep }
      );
    } finally {
      setIsLoading(false);
      analytics.endPerformanceTimer('step_transition');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      analytics.trackBackButtonClick(CHECKOUT_STEPS[currentStep - 1].stage, {
        fromStep: currentStep,
        toStep: currentStep - 1
      });
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      analytics.trackFormInteraction('navigation', 'step_click', {
        fromStep: currentStep,
        toStep: stepNumber
      });
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    analytics.startPerformanceTimer('validation');
    
    try {
      // Mock validation logic - replace with actual validation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear any existing errors
      setErrors({});
      
      analytics.endPerformanceTimer('validation', {
        step: currentStep,
        isValid: true
      });
      
      return true;
    } catch (error) {
      analytics.endPerformanceTimer('validation', {
        step: currentStep,
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      });
      
      return false;
    }
  };

  const handleComplete = async () => {
    analytics.startPerformanceTimer('order_completion');
    
    try {
      setIsLoading(true);
      
      // Mock order completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Track conversion
      analytics.trackConversion(299.99, 'USD', {
        paymentMethod: 'crypto',
        abTestVariants: {
          layout: layoutTest.variant?.id,
          form: formTest.variant?.id
        }
      });

      // Track A/B test conversions
      if (layoutTest.variant) {
        layoutTest.trackConversion({ orderValue: 299.99 });
      }
      if (formTest.variant) {
        formTest.trackConversion({ orderValue: 299.99 });
      }

      analytics.endPerformanceTimer('order_completion');
      
      // Redirect to success page
      router.push('/order-confirmation/12345');
    } catch (error) {
      analytics.trackCheckoutError(
        CheckoutErrorType.SERVER_ERROR,
        CheckoutFunnelStage.ORDER_COMPLETE,
        error instanceof Error ? error.message : 'Order completion failed'
      );
      
      analytics.endPerformanceTimer('order_completion', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpClick = (helpType: string) => {
    analytics.trackHelpClick(CHECKOUT_STEPS[currentStep - 1].stage, helpType);
  };

  const handleFeedbackRequest = () => {
    setFeedbackStep(CHECKOUT_STEPS[currentStep - 1].stage);
    setShowFeedbackModal(true);
  };

  const handleRetry = (action: string) => {
    analytics.trackRetryAttempt(CHECKOUT_STEPS[currentStep - 1].stage, action);
  };

  // Apply A/B test configurations
  const layoutClasses = ABTestUtils.getLayoutClasses(layoutTest.config);
  const formClasses = ABTestUtils.getFormClasses(formTest.config);
  const buttonClasses = ABTestUtils.getButtonClasses(layoutTest.config);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-charcoal-black mb-4">
              Shipping Address
            </h2>
            <div className={formClasses}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy"
                  onChange={() => analytics.trackFormInteraction('shipping_name', 'input')}
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy"
                  onChange={() => analytics.trackFormInteraction('shipping_address', 'input')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy"
                    onChange={() => analytics.trackFormInteraction('shipping_city', 'input')}
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy"
                    onChange={() => analytics.trackFormInteraction('shipping_zip', 'input')}
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      
      case 2:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-charcoal-black mb-4">
              Shipping Method
            </h2>
            <div className="space-y-3">
              {['Standard Shipping', 'Express Shipping', 'VIP Delivery'].map((method) => (
                <label key={method} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="shipping"
                    className="text-burgundy focus:ring-burgundy"
                    onChange={() => analytics.trackFormInteraction('shipping_method', 'select', { method })}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </Card>
        );
      
      case 3:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-charcoal-black mb-4">
              Payment Method
            </h2>
            <div className={formClasses}>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {['BTC', 'ETH', 'USDT'].map((crypto) => (
                    <button
                      key={crypto}
                      className="p-3 border rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-burgundy"
                      onClick={() => analytics.trackFormInteraction('payment_method', 'select', { method: crypto })}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      
      case 4:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-charcoal-black mb-4">
              Review Your Order
            </h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="font-medium">Premium Wine Collection</p>
                <p className="text-muted-olive">Quantity: 1</p>
                <p className="font-semibold">$299.99</p>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>$299.99</span>
              </div>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <CheckoutAnalyticsErrorBoundary>
      <CheckoutPerformanceMonitor currentStep={currentStep} isLoading={isLoading}>
        <div className={`min-h-screen bg-ivory py-8 ${layoutClasses}`}>
          <div className="container mx-auto px-4">
            {/* Progress Indicator */}
            <CheckoutProgressIndicator
              steps={CHECKOUT_STEPS.map(step => ({
                number: step.id,
                title: step.name,
                completed: step.id < currentStep,
                isActive: step.id === currentStep
              }))}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            {/* Main Content */}
            <div className="mt-8 space-y-6">
              {renderStepContent()}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={isLoading}
                    >
                      Previous
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHelpClick('general')}
                  >
                    Need Help?
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFeedbackRequest}
                  >
                    Give Feedback
                  </Button>
                  
                  {currentStep < CHECKOUT_STEPS.length ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className={buttonClasses}
                    >
                      {isLoading ? 'Processing...' : 'Continue'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      disabled={isLoading}
                      className={buttonClasses}
                    >
                      {isLoading ? 'Completing Order...' : 'Complete Order'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="text-red-700 text-sm">
                        {error}
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleRetry(`fix_${field}`)}
                        >
                          Retry
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>

          {/* Feedback Modal */}
          <CheckoutFeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            currentStep={feedbackStep}
          />
        </div>
      </CheckoutPerformanceMonitor>
    </CheckoutAnalyticsErrorBoundary>
  );
}