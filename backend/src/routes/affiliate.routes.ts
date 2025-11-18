import { Router } from 'express';
import { affiliateController } from '@/controllers/affiliate.controller';
import { validateRequest } from '@/middleware/joi-validation';
import { affiliateValidation } from '@/validation/affiliate.validation';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = Router();

// Affiliate routes
router.post('/program', authenticateToken, affiliateController.createAffiliateProgram);
router.get('/program', authenticateToken, affiliateController.getAffiliateProgram);
router.get('/stats', authenticateToken, affiliateController.getAffiliateStats);
router.get('/referrals', authenticateToken, affiliateController.getUserReferrals);
router.get('/commissions', authenticateToken, affiliateController.getUserCommissions);
router.post('/track', 
  authenticateToken, 
  validateRequest(affiliateValidation.trackReferral), 
  affiliateController.trackReferral
);

// Loyalty routes
router.get('/loyalty/status', authenticateToken, affiliateController.getLoyaltyStatus);
router.get('/loyalty/transactions', 
  authenticateToken, 
  affiliateController.getLoyaltyTransactions
);
router.get('/loyalty/rewards', affiliateController.getAvailableRewards);
router.post('/loyalty/rewards/:rewardId/redeem', 
  authenticateToken, 
  affiliateController.redeemReward
);

// Admin routes
router.post('/loyalty/award', 
  authenticateToken, 
  requireAdmin, 
  affiliateController.awardPoints
);

export default router;