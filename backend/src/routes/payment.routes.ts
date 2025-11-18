import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/joi-validation';
import { paymentValidation } from '../validation/payment.validation';

const router = Router();

// Public routes
router.get('/crypto/rates', paymentController.getCryptoRates);
router.post('/crypto/calculate', 
  validateRequest(paymentValidation.calculateCryptoAmount), 
  paymentController.calculateCryptoAmount
);
router.get('/crypto/wallets', paymentController.getAllWalletAddresses);
router.get('/crypto/wallet/:currency', 
  validateRequest(paymentValidation.getWalletAddress), 
  paymentController.getWalletAddress
);

// Webhook routes (no auth required)
router.post('/crypto/callback', paymentController.handleCryptoCallback);

// Protected routes
router.use(authenticateToken);

router.post('/crypto/initiate', 
  validateRequest(paymentValidation.initiateCryptoPayment), 
  paymentController.initiateCryptoPayment
);

router.get('/crypto/verify/:paymentId', paymentController.verifyCryptoPayment);

router.get('/status/:orderId', paymentController.getPaymentStatus);

router.get('/details/:paymentId', paymentController.getPaymentDetails);

router.get('/receipt/:paymentId', paymentController.generateReceipt);

// Admin routes (require admin authentication)
router.put('/status/:paymentId', 
  validateRequest(paymentValidation.updatePaymentStatus), 
  paymentController.updatePaymentStatus
);

export { router as paymentRoutes };