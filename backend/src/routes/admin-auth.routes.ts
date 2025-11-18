import { Router } from 'express'
import { adminAuthController } from '@/controllers/admin-auth.controller'
import { validateRequest } from '@/middleware/joi-validation'
import { authenticateAdmin, requireMFA, logAdminAction } from '@/middleware/admin-auth'
import {
  adminLoginSchema,
  mfaVerifySchema,
  mfaSetupSchema,
  refreshTokenSchema
} from '@/validation/admin.validation'

const router = Router()

// Public routes (no authentication required)
router.post('/login', 
  validateRequest(adminLoginSchema), 
  adminAuthController.login
)

router.post('/verify-mfa', 
  validateRequest(mfaVerifySchema), 
  adminAuthController.verifyMFA
)

router.post('/refresh-token', 
  validateRequest(refreshTokenSchema), 
  adminAuthController.refreshToken
)

// Protected routes (authentication required)
router.use(authenticateAdmin)

router.get('/profile', 
  adminAuthController.getProfile
)

router.get('/permissions', 
  adminAuthController.getPermissions
)

router.post('/logout', 
  logAdminAction('LOGOUT', 'auth'),
  adminAuthController.logout
)

// MFA management routes
router.post('/mfa/setup', 
  logAdminAction('MFA_SETUP', 'security'),
  adminAuthController.setupMFA
)

router.post('/mfa/confirm', 
  validateRequest(mfaSetupSchema),
  logAdminAction('MFA_CONFIRM', 'security'),
  adminAuthController.confirmMFASetup
)

router.delete('/mfa', 
  requireMFA,
  logAdminAction('MFA_DISABLE', 'security'),
  adminAuthController.disableMFA
)

export default router