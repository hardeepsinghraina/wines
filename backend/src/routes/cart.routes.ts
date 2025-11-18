import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validation rules
const addToCartValidation = [
  body('wineId').notEmpty().withMessage('Wine ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
];

const updateCartItemValidation = [
  param('wineId').notEmpty().withMessage('Wine ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
];

const createOrderFromCartValidation = [
  body('shippingAddressId').notEmpty().withMessage('Shipping address ID is required'),
  body('billingAddressId').optional(),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

// Get cart (works for both authenticated and guest users)
router.get('/', optionalAuth, cartController.getCart);

// Get cart summary
router.get('/summary', optionalAuth, cartController.getCartSummary);

// Add item to cart
router.post('/items', 
  optionalAuth, 
  addToCartValidation,
  handleValidationErrors,
  cartController.addToCart
);

// Update cart item quantity
router.put('/items/:wineId', 
  optionalAuth, 
  updateCartItemValidation,
  handleValidationErrors,
  cartController.updateCartItem
);

// Remove item from cart
router.delete('/items/:wineId', optionalAuth, cartController.removeFromCart);

// Clear cart
router.delete('/', optionalAuth, cartController.clearCart);

// Create order from cart (requires authentication)
router.post('/checkout', 
  authenticateToken, 
  createOrderFromCartValidation,
  handleValidationErrors,
  cartController.createOrderFromCart
);

// Merge guest cart with user cart (requires authentication)
router.post('/merge', authenticateToken, cartController.mergeGuestCart);

// Recover abandoned cart
router.get('/recover', cartController.recoverCart);

// Get abandonment statistics (admin only)
router.get('/abandonment-stats', authenticateToken, cartController.getAbandonmentStats);

export default router;