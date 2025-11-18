import { Router } from 'express'
import { adminCustomerController } from '@/controllers/admin-customer.controller'
import { validateRequest, validateQuery } from '@/middleware/joi-validation'
import { 
  authenticateAdmin, 
  requirePermission, 
  logAdminAction 
} from '@/middleware/admin-auth'
import { AdminPermission } from '@/types/admin'
import {
  updateCustomerStatusSchema,
  customerQuerySchema,
  searchCustomersSchema,
  analyticsQuerySchema
} from '@/validation/admin-customer.validation'

const router = Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Get all customers (requires view permission)
router.get('/',
  requirePermission(AdminPermission.CUSTOMERS_VIEW),
  validateQuery(customerQuerySchema),
  adminCustomerController.getAllCustomers
)

// Search customers (requires view permission)
router.get('/search',
  requirePermission(AdminPermission.CUSTOMERS_VIEW),
  validateQuery(searchCustomersSchema),
  adminCustomerController.searchCustomers
)

// Get customer analytics (requires view permission)
router.get('/analytics',
  requirePermission(AdminPermission.CUSTOMERS_VIEW),
  validateQuery(analyticsQuerySchema),
  adminCustomerController.getCustomerAnalytics
)

// Get single customer by ID (requires view permission)
router.get('/:id',
  requirePermission(AdminPermission.CUSTOMERS_VIEW),
  adminCustomerController.getCustomerById
)

// Update customer status (requires edit permission)
router.put('/:id/status',
  requirePermission(AdminPermission.CUSTOMERS_EDIT),
  validateRequest(updateCustomerStatusSchema),
  logAdminAction('UPDATE_CUSTOMER_STATUS', 'customer'),
  adminCustomerController.updateCustomerStatus
)

export default router