import { Router } from 'express'
import { adminOrderController } from '@/controllers/admin-order.controller'
import { validateRequest, validateQuery } from '@/middleware/joi-validation'
import { 
  authenticateAdmin, 
  requirePermission, 
  requireAnyPermission,
  logAdminAction 
} from '@/middleware/admin-auth'
import { AdminPermission } from '@/types/admin'
import {
  updateOrderStatusSchema,
  cancelOrderSchema,
  refundOrderSchema,
  orderQuerySchema,
  analyticsQuerySchema
} from '@/validation/admin-order.validation'

const router = Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Get all orders (requires view permission)
router.get('/',
  requirePermission(AdminPermission.ORDERS_VIEW),
  validateQuery(orderQuerySchema),
  adminOrderController.getAllOrders
)

// Get order analytics (requires view permission)
router.get('/analytics',
  requirePermission(AdminPermission.ORDERS_VIEW),
  validateQuery(analyticsQuerySchema),
  adminOrderController.getOrderAnalytics
)

// Get single order by ID (requires view permission)
router.get('/:id',
  requirePermission(AdminPermission.ORDERS_VIEW),
  adminOrderController.getOrderById
)

// Update order status (requires edit permission)
router.put('/:id/status',
  requirePermission(AdminPermission.ORDERS_EDIT),
  validateRequest(updateOrderStatusSchema),
  logAdminAction('UPDATE_ORDER_STATUS', 'order'),
  adminOrderController.updateOrderStatus
)

// Cancel order (requires cancel permission)
router.post('/:id/cancel',
  requirePermission(AdminPermission.ORDERS_CANCEL),
  validateRequest(cancelOrderSchema),
  logAdminAction('CANCEL_ORDER', 'order'),
  adminOrderController.cancelOrder
)

// Process refund (requires refund permission)
router.post('/:id/refund',
  requirePermission(AdminPermission.ORDERS_REFUND),
  validateRequest(refundOrderSchema),
  logAdminAction('REFUND_ORDER', 'order'),
  adminOrderController.refundOrder
)

export default router