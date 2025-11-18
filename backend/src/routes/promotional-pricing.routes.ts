import { Router } from 'express'
import { PromotionalPricingController } from '../controllers/promotional-pricing.controller'
import { authenticateToken } from '../middleware/auth'
import { authenticateAdmin } from '../middleware/admin-auth'

const router = Router()
const promotionalPricingController = new PromotionalPricingController()

// Public routes
router.get('/products/:productId/pricing', promotionalPricingController.getPromotionalPricing)
router.get('/products/:productId/bulk-pricing', promotionalPricingController.getBulkPricing)
router.post('/apply-discount', promotionalPricingController.applyDiscount)

// User routes (require authentication)
router.get('/products/:productId/vip-pricing', authenticateToken, promotionalPricingController.getVIPPricing)

// Admin routes (require admin authentication)
router.post('/promotions', authenticateAdmin, promotionalPricingController.createPromotion)
router.post('/discount-codes', authenticateAdmin, promotionalPricingController.createDiscountCode)
router.get('/promotions/:promotionId/analytics', authenticateAdmin, promotionalPricingController.getPromotionalAnalytics)
router.get('/promotions/:promotionId/conversion-funnel', authenticateAdmin, promotionalPricingController.getConversionFunnel)
router.get('/promotions/:promotionId/roi', authenticateAdmin, promotionalPricingController.getPromotionalROI)

// Analytics tracking (public for frontend tracking)
router.post('/promotions/:promotionId/track', promotionalPricingController.trackPromotionalEvent)

export default router