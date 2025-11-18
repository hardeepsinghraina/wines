'use client';

import { performanceMonitor } from '@/lib/performance';
import { checkoutAnalyticsAPI } from '@/lib/checkout-analytics-api';

// Checkout funnel stages
export enum CheckoutFunnelStage {
  CHECKOUT_START = 'checkout_start',
  SHIPPING_ADDRESS = 'shipping_address',
  SHIPPING_METHOD = 'shipping_method',
  PAYMENT_METHOD = 'payment_method',
  ORDER_REVIEW = 'order_review',
  ORDER_COMPLETE = 'order_complete',
  CHECKOUT_ABANDON = 'checkout_abandon'
}

// Checkout error types
export enum CheckoutErrorType {
  VALIDATION_ERROR = 'validation_error',
  PAYMENT_ERROR = 'payment_error',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  TIMEOUT_ERROR = 'timeout_error'
}

// A/B test variants
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

// Performance metrics
export interface CheckoutPerformanceMetrics {
  pageLoadTime: number;
  stepTransitionTime: number;
  formValidationTime: number;
  paymentProcessingTime: number;
  totalCheckoutTime: number;
}

// User behavior data
export interface CheckoutBehaviorData {
  timeOnStep: number;
  formInteractions: number;
  backButtonClicks: number;
  helpClicks: number;
  errorEncounters: number;
  retryAttempts: number;
}

// Feedback data
export interface CheckoutFeedback {
  rating: number;
  comment?: string;
  step: CheckoutFunnelStage;
  issues: string[];
  suggestions?: string;
}

class CheckoutAnalyticsService {
  private sessionData: Map<string, any> = new Map();
  private performanceTimers: Map<string, number> = new Map();
  private behaviorData: CheckoutBehaviorData = {
    timeOnStep: 0,
    formInteractions: 0,
    backButtonClicks: 0,
    helpClicks: 0,
    errorEncounters: 0,
    retryAttempts: 0
  };
  private sessionId: string = '';

  // Funnel tracking
  trackFunnelStage(stage: CheckoutFunnelStage, properties?: Record<string, any>): void {
    const timestamp = Date.now();
    const previousStage = this.sessionData.get('currentStage');
    const previousTimestamp = this.sessionData.get('stageTimestamp');

    // Calculate time spent on previous stage
    if (previousStage && previousTimestamp) {
      const timeOnPreviousStep = timestamp - previousTimestamp;
      checkoutAnalyticsAPI.trackPerformance({
        metric: 'step_time',
        value: timeOnPreviousStep,
        stage: previousStage,
        sessionId: this.getSessionId(),
        properties: { ...properties }
      });
    }

    // Track current stage
    checkoutAnalyticsAPI.trackFunnel({
      stage,
      sessionId: this.getSessionId(),
      properties: {
        timestamp,
        previousStage,
        ...properties
      }
    });

    // Update session data
    this.sessionData.set('currentStage', stage);
    this.sessionData.set('stageTimestamp', timestamp);

    // Track drop-off if user abandons
    if (stage === CheckoutFunnelStage.CHECKOUT_ABANDON) {
      this.trackDropOff(previousStage, properties);
    }
  }

  // Drop-off tracking
  trackDropOff(stage: CheckoutFunnelStage, properties?: Record<string, any>): void {
    checkoutAnalyticsAPI.trackFunnel({
      stage: CheckoutFunnelStage.CHECKOUT_ABANDON,
      sessionId: this.getSessionId(),
      properties: {
        abandonedStage: stage,
        sessionDuration: this.getSessionDuration(),
        behaviorData: this.behaviorData,
        ...properties
      }
    });
  }

  // Error tracking
  trackCheckoutError(
    errorType: CheckoutErrorType,
    stage: CheckoutFunnelStage,
    error: string,
    properties?: Record<string, any>
  ): void {
    this.behaviorData.errorEncounters++;
    
    checkoutAnalyticsAPI.trackError({
      errorType,
      stage,
      error,
      sessionId: this.getSessionId(),
      properties: {
        errorCount: this.behaviorData.errorEncounters,
        ...properties
      }
    });
  }

  // Performance tracking
  startPerformanceTimer(metric: string): void {
    this.performanceTimers.set(metric, performance.now());
    performanceMonitor.startTiming(`checkout_${metric}`);
  }

  endPerformanceTimer(metric: string, properties?: Record<string, any>): number {
    const startTime = this.performanceTimers.get(metric);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.performanceTimers.delete(metric);
    
    performanceMonitor.endTiming(`checkout_${metric}`);
    
    checkoutAnalyticsAPI.trackPerformance({
      metric: `checkout_${metric}`,
      value: duration,
      stage: this.sessionData.get('currentStage') || 'unknown',
      sessionId: this.getSessionId(),
      properties
    });
    
    return duration;
  }

  // User behavior tracking
  trackFormInteraction(field: string, action: string, properties?: Record<string, any>): void {
    this.behaviorData.formInteractions++;
    
    checkoutAnalyticsAPI.trackFunnel({
      stage: this.sessionData.get('currentStage') || 'unknown',
      sessionId: this.getSessionId(),
      properties: {
        event: 'form_interaction',
        field,
        action,
        interactionCount: this.behaviorData.formInteractions,
        ...properties
      }
    });
  }

  trackBackButtonClick(stage: CheckoutFunnelStage, properties?: Record<string, any>): void {
    this.behaviorData.backButtonClicks++;
    
    checkoutAnalyticsAPI.trackFunnel({
      stage,
      sessionId: this.getSessionId(),
      properties: {
        event: 'back_button_click',
        backClickCount: this.behaviorData.backButtonClicks,
        ...properties
      }
    });
  }

  trackHelpClick(stage: CheckoutFunnelStage, helpType: string, properties?: Record<string, any>): void {
    this.behaviorData.helpClicks++;
    
    checkoutAnalyticsAPI.trackFunnel({
      stage,
      sessionId: this.getSessionId(),
      properties: {
        event: 'help_click',
        helpType,
        helpClickCount: this.behaviorData.helpClicks,
        ...properties
      }
    });
  }

  trackRetryAttempt(stage: CheckoutFunnelStage, action: string, properties?: Record<string, any>): void {
    this.behaviorData.retryAttempts++;
    
    checkoutAnalyticsAPI.trackFunnel({
      stage,
      sessionId: this.getSessionId(),
      properties: {
        event: 'retry_attempt',
        action,
        retryCount: this.behaviorData.retryAttempts,
        ...properties
      }
    });
  }

  // Conversion tracking
  trackConversion(orderValue: number, currency: string, properties?: Record<string, any>): void {
    const sessionDuration = this.getSessionDuration();
    
    checkoutAnalyticsAPI.trackFunnel({
      stage: CheckoutFunnelStage.ORDER_COMPLETE,
      sessionId: this.getSessionId(),
      properties: {
        event: 'purchase',
        value: orderValue,
        currency,
        sessionDuration,
        behaviorData: this.behaviorData,
        checkoutSteps: this.getCompletedSteps(),
        ...properties
      }
    });
  }

  // Feedback collection
  collectFeedback(feedback: CheckoutFeedback): void {
    checkoutAnalyticsAPI.trackFeedback({
      rating: feedback.rating,
      comment: feedback.comment,
      step: feedback.step,
      issues: feedback.issues,
      suggestions: feedback.suggestions,
      sessionId: this.getSessionId()
    });
  }

  // A/B Testing
  getABTestVariant(testId: string): ABTestVariant | null {
    const tests = this.getActiveABTests();
    const test = tests.find(t => t.id === testId);
    
    if (!test) return null;

    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem(`ab_test_${testId}`);
    if (storedVariant) {
      const variant = test.variants.find(v => v.id === storedVariant);
      if (variant) return variant;
    }

    // Assign new variant based on weights
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        localStorage.setItem(`ab_test_${testId}`, variant.id);
        
        // Track variant assignment
        checkoutAnalyticsAPI.trackABTest({
          testId,
          variantId: variant.id,
          event: 'assignment',
          sessionId: this.getSessionId(),
          properties: {
            variantName: variant.name
          }
        });
        
        return variant;
      }
    }
    
    return test.variants[0]; // Fallback to first variant
  }

  trackABTestConversion(testId: string, variantId: string, properties?: Record<string, any>): void {
    checkoutAnalyticsAPI.trackABTest({
      testId,
      variantId,
      event: 'conversion',
      sessionId: this.getSessionId(),
      properties
    });
  }

  // Session management
  private getSessionDuration(): number {
    const startTime = this.sessionData.get('sessionStart') || Date.now();
    return Date.now() - startTime;
  }

  private getCompletedSteps(): CheckoutFunnelStage[] {
    return this.sessionData.get('completedSteps') || [];
  }

  private getSessionSummary(): Record<string, any> {
    return {
      duration: this.getSessionDuration(),
      completedSteps: this.getCompletedSteps(),
      currentStage: this.sessionData.get('currentStage'),
      behaviorData: this.behaviorData
    };
  }

  // Mock A/B tests - in production, these would come from a service
  private getActiveABTests(): ABTest[] {
    return [
      {
        id: 'checkout_layout_test',
        name: 'Checkout Layout Optimization',
        variants: [
          { id: 'control', name: 'Original Layout', weight: 0.5, config: { layout: 'original' } },
          { id: 'simplified', name: 'Simplified Layout', weight: 0.5, config: { layout: 'simplified' } }
        ],
        isActive: true,
        startDate: new Date('2024-01-01')
      },
      {
        id: 'payment_form_test',
        name: 'Payment Form Optimization',
        variants: [
          { id: 'control', name: 'Standard Form', weight: 0.33, config: { formStyle: 'standard' } },
          { id: 'inline', name: 'Inline Form', weight: 0.33, config: { formStyle: 'inline' } },
          { id: 'stepped', name: 'Stepped Form', weight: 0.34, config: { formStyle: 'stepped' } }
        ],
        isActive: true,
        startDate: new Date('2024-01-01')
      }
    ];
  }

  // Get or generate session ID
  private getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  // Initialize session
  initializeSession(): void {
    if (!this.sessionData.has('sessionStart')) {
      this.sessionData.set('sessionStart', Date.now());
      this.sessionData.set('completedSteps', []);
      this.getSessionId(); // Generate session ID
    }
  }

  // Reset session
  resetSession(): void {
    this.sessionData.clear();
    this.behaviorData = {
      timeOnStep: 0,
      formInteractions: 0,
      backButtonClicks: 0,
      helpClicks: 0,
      errorEncounters: 0,
      retryAttempts: 0
    };
    this.performanceTimers.clear();
  }
}

// Singleton instance
export const checkoutAnalytics = new CheckoutAnalyticsService();

// React hook for checkout analytics
export function useCheckoutAnalytics() {
  return {
    trackFunnelStage: checkoutAnalytics.trackFunnelStage.bind(checkoutAnalytics),
    trackDropOff: checkoutAnalytics.trackDropOff.bind(checkoutAnalytics),
    trackCheckoutError: checkoutAnalytics.trackCheckoutError.bind(checkoutAnalytics),
    startPerformanceTimer: checkoutAnalytics.startPerformanceTimer.bind(checkoutAnalytics),
    endPerformanceTimer: checkoutAnalytics.endPerformanceTimer.bind(checkoutAnalytics),
    trackFormInteraction: checkoutAnalytics.trackFormInteraction.bind(checkoutAnalytics),
    trackBackButtonClick: checkoutAnalytics.trackBackButtonClick.bind(checkoutAnalytics),
    trackHelpClick: checkoutAnalytics.trackHelpClick.bind(checkoutAnalytics),
    trackRetryAttempt: checkoutAnalytics.trackRetryAttempt.bind(checkoutAnalytics),
    trackConversion: checkoutAnalytics.trackConversion.bind(checkoutAnalytics),
    collectFeedback: checkoutAnalytics.collectFeedback.bind(checkoutAnalytics),
    getABTestVariant: checkoutAnalytics.getABTestVariant.bind(checkoutAnalytics),
    trackABTestConversion: checkoutAnalytics.trackABTestConversion.bind(checkoutAnalytics),
    initializeSession: checkoutAnalytics.initializeSession.bind(checkoutAnalytics),
    resetSession: checkoutAnalytics.resetSession.bind(checkoutAnalytics)
  };
}