import { Router } from 'express'
import { gdprController } from '@/controllers/gdpr.controller'
import { authenticateToken } from '@/middleware/auth'
import { validateRequest } from '@/middleware/joi-validation'
import { gdprValidation } from '@/validation/gdpr.validation'

const router = Router()

/**
 * @route GET /api/gdpr/privacy-policy
 * @desc Get current privacy policy
 * @access Public
 */
router.get('/privacy-policy', gdprController.getPrivacyPolicy)

/**
 * @route GET /api/gdpr/terms-of-service
 * @desc Get current terms of service
 * @access Public
 */
router.get('/terms-of-service', gdprController.getTermsOfService)

/**
 * @route GET /api/gdpr/cookie-policy
 * @desc Get current cookie policy
 * @access Public
 */
router.get('/cookie-policy', gdprController.getCookiePolicy)

// Protected routes require authentication
router.use(authenticateToken)

/**
 * @route GET /api/gdpr/export
 * @desc Export user's personal data
 * @access Private
 */
router.get('/export', gdprController.exportUserData as any)

/**
 * @route POST /api/gdpr/delete-request
 * @desc Request deletion of user's personal data
 * @access Private
 */
router.post(
  '/delete-request',
  validateRequest(gdprValidation.deletionRequest),
  gdprController.requestDataDeletion as any
)

/**
 * @route GET /api/gdpr/consent
 * @desc Get user's current consent status
 * @access Private
 */
router.get('/consent', gdprController.getUserConsent as any)

/**
 * @route POST /api/gdpr/consent
 * @desc Update user's consent preferences
 * @access Private
 */
router.post(
  '/consent',
  validateRequest(gdprValidation.consentUpdate),
  gdprController.updateConsent as any
)

export default router