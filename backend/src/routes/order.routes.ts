import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Validation rules
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.wineId').notEmpty().withMessage('Wine ID is required'),
  body('items.*.quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
  body('shippingAddressId').notEmpty().withMessage('Shipping address ID is required'),
  body('billingAddressId').optional(),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

const updateOrderStatusValidation = [
  param('orderId').notEmpty().withMessage('Order ID is required'),
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Invalid order status')
];

const getOrdersQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// All order routes require authentication
router.use(authenticateToken);

// Create order directly
router.post('/', createOrderValidation, handleValidationErrors, orderController.createOrder);

// Get user's orders
router.get('/', getOrdersQueryValidation, handleValidationErrors, orderController.getUserOrders);

// Get all orders (admin only)
router.get('/admin/all', getOrdersQueryValidation, handleValidationErrors, orderController.getAllOrders);

// Get specific order
router.get('/:orderId', orderController.getOrder);

// Update order status (admin only)
router.put('/:orderId/status', 
  updateOrderStatusValidation,
  handleValidationErrors,
  orderController.updateOrderStatus
);

// Cancel order
router.put('/:orderId/cancel', orderController.cancelOrder);

// Modify order
router.put('/:orderId/modify', orderController.modifyOrder);

// Get order receipt
router.get('/:orderId/receipt', orderController.getOrderReceipt);

// Get order recommendations
router.get('/:orderId/recommendations', orderController.getOrderRecommendations);

// Email order receipt
router.post('/:orderId/email-receipt', orderController.emailOrderReceipt);

// Get order tracking information
router.get('/:orderId/tracking', orderController.getOrderTracking);

export default router;