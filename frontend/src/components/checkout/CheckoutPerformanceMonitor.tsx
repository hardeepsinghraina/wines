'use client';

import { useEffect, useRef } from 'react';
import { useCheckoutAnalytics } from '@/lib/checkout-analytics';
import { CheckoutFunnelStage } from '@/lib/checkout-analytics';

interface CheckoutPerformanceMonitorProps {
  currentStep: number;
  isLoading: boolean;
  children: React.ReactNode;
}

export function CheckoutPerformanceMonitor({ 
  currentStep, 
  isLoading, 
  children 
}: CheckoutPerformanceMonitorProps) {
  const analytics = useCheckoutAnalytics();
  const stepStartTime = useRef<number>(0);
  const loadingStartTime = useRef<number>(0);
  const previousStep = useRef<number>(0);

  // Map step numbers to funnel stages
  const getStageFromStep = (step: number): CheckoutFunnelStage => {
    switch (step) {
      case 1: return CheckoutFunnelStage.SHIPPING_ADDRESS;
      case 2: return CheckoutFunnelStage.SHIPPING_METHOD;
      case 3: return CheckoutFunnelStage.PAYMENT_METHOD;
      case 4: return CheckoutFunnelStage.ORDER_REVIEW;
      case 5: return CheckoutFunnelStage.ORDER_COMPLETE;
      default: return CheckoutFunnelStage.CHECKOUT_START;
    }
  };

  // Track step changes and performance
  useEffect(() => {
    const currentStage = getStageFromStep(currentStep);
    const previousStage = getStageFromStep(previousStep.current);

    // Track step transition time
    if (previousStep.current !== 0 && previousStep.current !== currentStep) {
      const transitionTime = performance.now() - stepStartTime.current;
      analytics.trackFormInteraction('step_transition', 'complete', {
        fromStep: previousStep.current,
        toStep: currentStep,
        transitionTime,
        stage: currentStage
      });
    }

    // Start timing for new step
    stepStartTime.current = performance.now();
    previousStep.current = currentStep;

    // Track funnel stage
    analytics.trackFunnelStage(currentStage, {
      stepNumber: currentStep,
      timestamp: Date.now()
    });

    // Start performance timer for step
    analytics.startPerformanceTimer(`step_${currentStep}`);

    return () => {
      // End performance timer when step changes
      analytics.endPerformanceTimer(`step_${currentStep}`, {
        stepNumber: currentStep,
        stage: currentStage
      });
    };
  }, [currentStep, analytics]);

  // Track loading states
  useEffect(() => {
    if (isLoading) {
      loadingStartTime.current = performance.now();
      analytics.startPerformanceTimer('loading_state');
    } else if (loadingStartTime.current > 0) {
      const loadingTime = performance.now() - loadingStartTime.current;
      analytics.endPerformanceTimer('loading_state', {
        loadingTime,
        step: currentStep,
        stage: getStageFromStep(currentStep)
      });
      loadingStartTime.current = 0;
    }
  }, [isLoading, currentStep, analytics]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analytics.trackFormInteraction('page_visibility', 'hidden', {
          step: currentStep,
          stage: getStageFromStep(currentStep)
        });
      } else {
        analytics.trackFormInteraction('page_visibility', 'visible', {
          step: currentStep,
          stage: getStageFromStep(currentStep)
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentStep, analytics]);

  // Track page unload (potential abandonment)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentStep < 5) { // Not completed
        analytics.trackDropOff(getStageFromStep(currentStep), {
          step: currentStep,
          timeOnStep: performance.now() - stepStartTime.current,
          reason: 'page_unload'
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, analytics]);

  // Initialize session on mount
  useEffect(() => {
    analytics.initializeSession();
  }, [analytics]);

  return <>{children}</>;
}