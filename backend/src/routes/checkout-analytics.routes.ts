import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { checkoutAnalyticsController } from '@/controllers/checkout-analytics.controller';
import { authenticateToken } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/admin-auth';
import { generalLimiter, apiLimiter, adminRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/joi-validation';
import { checkoutAnalyticsValidation } from '@/validation/checkout-analytics.validation';

// Dynamic rate limiter function
const createRateLimiter = (name: string, max: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests for ${name}, please try again later.`,
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const router = Router();

// Public analytics tracking endpoints (with rate limiting)
router.post('/track/funnel',
  createRateLimiter('checkout_analytics', 100, 15 * 60 * 1000), // 100 requests per 15 minutes
  validateRequest(checkoutAnalyticsValidation.trackFunnel),
  checkoutAnalyticsController.trackFunnel
);

router.post('/track/performance',
  createRateLimiter('checkout_analytics', 100, 15 * 60 * 1000),
  validateRequest(checkoutAnalyticsValidation.trackPerformance),
  checkoutAnalyticsController.trackPerformance
);

router.post('/track/error',
  createRateLimiter('checkout_analytics', 50, 15 * 60 * 1000), // Lower limit for errors
  validateRequest(checkoutAnalyticsValidation.trackError),
  checkoutAnalyticsController.trackError
);

router.post('/track/feedback',
  createRateLimiter('checkout_analytics', 20, 15 * 60 * 1000), // Lower limit for feedback
  validateRequest(checkoutAnalyticsValidation.trackFeedback),
  checkoutAnalyticsController.trackFeedback
);

router.post('/track/ab-test',
  createRateLimiter('checkout_analytics', 100, 15 * 60 * 1000),
  validateRequest(checkoutAnalyticsValidation.trackABTest),
  checkoutAnalyticsController.trackABTest
);

// Authenticated user endpoints
router.get('/my-session',
  authenticateToken,
  createRateLimiter('checkout_analytics_user', 30, 15 * 60 * 1000),
  checkoutAnalyticsController.getUserSession
);

// Admin analytics endpoints
router.get('/funnel-analysis',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 50, 15 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.getAnalysis }),
  checkoutAnalyticsController.getFunnelAnalysis
);

router.get('/performance-analysis',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 50, 15 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.getAnalysis }),
  checkoutAnalyticsController.getPerformanceAnalysis
);

router.get('/error-analysis',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 50, 15 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.getAnalysis }),
  checkoutAnalyticsController.getErrorAnalysis
);

router.get('/feedback-analysis',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 50, 15 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.getAnalysis }),
  checkoutAnalyticsController.getFeedbackAnalysis
);

router.get('/ab-test-analysis',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 50, 15 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.getABTestAnalysis }),
  checkoutAnalyticsController.getABTestAnalysis
);

router.get('/dashboard',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 30, 15 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.getDashboard }),
  checkoutAnalyticsController.getDashboard
);

// Real-time analytics endpoints
router.get('/realtime/funnel',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_realtime', 20, 5 * 60 * 1000), // 20 requests per 5 minutes
  checkoutAnalyticsController.getRealtimeFunnel
);

router.get('/realtime/performance',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_realtime', 20, 5 * 60 * 1000),
  checkoutAnalyticsController.getRealtimePerformance
);

router.get('/realtime/errors',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_realtime', 20, 5 * 60 * 1000),
  checkoutAnalyticsController.getRealtimeErrors
);

// Export and reporting endpoints
router.get('/export/funnel',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_export', 5, 60 * 60 * 1000), // 5 exports per hour
  validateRequest({ query: checkoutAnalyticsValidation.exportData }),
  checkoutAnalyticsController.exportFunnelData
);

router.get('/export/performance',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_export', 5, 60 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.exportData }),
  checkoutAnalyticsController.exportPerformanceData
);

router.get('/export/feedback',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_export', 5, 60 * 60 * 1000),
  validateRequest({ query: checkoutAnalyticsValidation.exportData }),
  checkoutAnalyticsController.exportFeedbackData
);

// A/B test management endpoints
router.get('/ab-tests',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 30, 15 * 60 * 1000),
  checkoutAnalyticsController.getABTests
);

router.post('/ab-tests',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 10, 60 * 60 * 1000), // 10 test creations per hour
  validateRequest(checkoutAnalyticsValidation.createABTest),
  checkoutAnalyticsController.createABTest
);

router.put('/ab-tests/:testId',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 20, 60 * 60 * 1000),
  validateRequest(checkoutAnalyticsValidation.updateABTest),
  checkoutAnalyticsController.updateABTest
);

router.delete('/ab-tests/:testId',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 10, 60 * 60 * 1000),
  checkoutAnalyticsController.deleteABTest
);

// Performance alerts endpoints
router.get('/alerts',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 30, 15 * 60 * 1000),
  checkoutAnalyticsController.getAlerts
);

router.post('/alerts',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 10, 60 * 60 * 1000),
  validateRequest(checkoutAnalyticsValidation.createAlert),
  checkoutAnalyticsController.createAlert
);

router.put('/alerts/:alertId',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 20, 60 * 60 * 1000),
  validateRequest(checkoutAnalyticsValidation.updateAlert),
  checkoutAnalyticsController.updateAlert
);

router.delete('/alerts/:alertId',
  authenticateAdmin,
  createRateLimiter('checkout_analytics_admin', 10, 60 * 60 * 1000),
  checkoutAnalyticsController.deleteAlert
);

export default router;