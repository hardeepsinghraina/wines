import { Router } from 'express';
import { privateSalesController } from '@/controllers/private-sales.controller';
import { validateRequest } from '@/middleware/joi-validation';
import { privateSalesValidation } from '@/validation/private-sales.validation';
import { authenticateToken, optionalAuth } from '@/middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, privateSalesController.getPrivateSales);
router.get('/:id', privateSalesController.getPrivateSaleById);

// Protected routes
router.get('/:id/eligibility', 
  authenticateToken, 
  privateSalesController.checkUserEligibility
);

router.post('/:id/purchase', 
  authenticateToken, 
  validateRequest(privateSalesValidation.purchaseFromPrivateSale), 
  privateSalesController.purchaseFromPrivateSale
);

router.get('/user/purchases', 
  authenticateToken, 
  privateSalesController.getUserPrivateSalePurchases
);

// Admin routes
router.post('/access/grant', 
  authenticateToken, 
  validateRequest(privateSalesValidation.grantAccess), 
  privateSalesController.grantUserAccess
);

export default router;