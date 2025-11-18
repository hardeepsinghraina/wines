import Joi from 'joi';

// Checkout funnel stages enum for validation
const checkoutStages = [
  'checkout_start',
  'shipping_address',
  'shipping_method',
  'payment_method',
  'order_review',
  'order_complete',
  'checkout_abandon'
];

// Error types enum for validation
const errorTypes = [
  'validation_error',
  'payment_error',
  'network_error',
  'server_error',
  'timeout_error'
];

// A/B test events enum for validation
const abTestEvents = ['assignment', 'conversion'];

export const checkoutAnalyticsValidation = {
  // Track funnel stage
  trackFunnel: Joi.object({
    stage: Joi.string().valid(...checkoutStages).required(),
    sessionId: Joi.string().required(),
    properties: Joi.object().default({})
  }),

  // Track performance metrics
  trackPerformance: Joi.object({
    metric: Joi.string().required(),
    value: Joi.number().min(0).required(),
    stage: Joi.string().valid(...checkoutStages).required(),
    sessionId: Joi.string().required(),
    properties: Joi.object().default({})
  }),

  // Track errors
  trackError: Joi.object({
    errorType: Joi.string().valid(...errorTypes).required(),
    stage: Joi.string().valid(...checkoutStages).required(),
    error: Joi.string().required(),
    sessionId: Joi.string().required(),
    properties: Joi.object().default({})
  }),

  // Track feedback
  trackFeedback: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional(),
    step: Joi.string().valid(...checkoutStages).required(),
    issues: Joi.array().items(Joi.string()).default([]),
    suggestions: Joi.string().max(300).optional(),
    sessionId: Joi.string().required()
  }),

  // Track A/B test events
  trackABTest: Joi.object({
    testId: Joi.string().required(),
    variantId: Joi.string().required(),
    event: Joi.string().valid(...abTestEvents).required(),
    sessionId: Joi.string().required(),
    properties: Joi.object().default({})
  }),

  // Get analysis data
  getAnalysis: Joi.object({
    timeRange: Joi.number().integer().min(60000).max(2592000000).default(86400000) // 1 minute to 30 days
  }),

  // Get A/B test analysis
  getABTestAnalysis: Joi.object({
    testId: Joi.string().optional(),
    timeRange: Joi.number().integer().min(60000).max(2592000000).default(86400000)
  }),

  // Get dashboard data
  getDashboard: Joi.object({
    timeRange: Joi.number().integer().min(60000).max(2592000000).default(86400000)
  }),

  // Export data
  exportData: Joi.object({
    timeRange: Joi.number().integer().min(60000).max(2592000000).default(86400000),
    format: Joi.string().valid('json', 'csv').default('json')
  }),

  // Create A/B test
  createABTest: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    variants: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        weight: Joi.number().min(0).max(1).required(),
        config: Joi.object().required()
      })
    ).min(2).required(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
    targetMetric: Joi.string().required(),
    isActive: Joi.boolean().default(false)
  }),

  // Update A/B test
  updateABTest: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    variants: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        weight: Joi.number().min(0).max(1).required(),
        config: Joi.object().required()
      })
    ).min(2).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    targetMetric: Joi.string().optional(),
    isActive: Joi.boolean().optional()
  }),

  // Create alert
  createAlert: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    condition: Joi.string().required(),
    threshold: Joi.number().required(),
    metric: Joi.string().required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    isActive: Joi.boolean().default(true),
    notificationChannels: Joi.array().items(Joi.string()).default([])
  }),

  // Update alert
  updateAlert: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    condition: Joi.string().optional(),
    threshold: Joi.number().optional(),
    metric: Joi.string().optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    isActive: Joi.boolean().optional(),
    notificationChannels: Joi.array().items(Joi.string()).optional()
  })
};