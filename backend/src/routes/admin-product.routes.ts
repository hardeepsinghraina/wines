import { Router } from 'express'
import { adminProductController } from '@/controllers/admin-product.controller'
import { validateRequest, validateQuery } from '@/middleware/joi-validation'
import { 
  authenticateAdmin, 
  requirePermission, 
  requireAnyPermission,
  logAdminAction 
} from '@/middleware/admin-auth'
import { AdminPermission } from '@/types/admin'
import {
  createProductSchema,
  updateProductSchema,
  bulkImportSchema,
  updateInventorySchema,
  productQuerySchema
} from '@/validation/admin-product.validation'

const router = Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Get all products (requires view permission)
router.get('/',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  validateQuery(productQuerySchema),
  adminProductController.getAllProducts
)

// Get single product by ID (requires view permission)
router.get('/:id',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  adminProductController.getProductById
)

// Create new product (requires create permission)
router.post('/',
  requirePermission(AdminPermission.PRODUCTS_CREATE),
  validateRequest(createProductSchema),
  logAdminAction('CREATE_PRODUCT', 'product'),
  adminProductController.createProduct
)

// Update existing product (requires edit permission)
router.put('/:id',
  requirePermission(AdminPermission.PRODUCTS_EDIT),
  validateRequest(updateProductSchema),
  logAdminAction('UPDATE_PRODUCT', 'product'),
  adminProductController.updateProduct
)

// Delete product (requires delete permission)
router.delete('/:id',
  requirePermission(AdminPermission.PRODUCTS_DELETE),
  logAdminAction('DELETE_PRODUCT', 'product'),
  adminProductController.deleteProduct
)

// Bulk import products (requires bulk import permission)
router.post('/bulk-import',
  requirePermission(AdminPermission.PRODUCTS_BULK_IMPORT),
  validateRequest(bulkImportSchema),
  logAdminAction('BULK_IMPORT_PRODUCTS', 'product'),
  adminProductController.bulkImportProducts
)

// Update product inventory (requires inventory management permission)
router.put('/:id/inventory',
  requirePermission(AdminPermission.INVENTORY_MANAGE),
  validateRequest(updateInventorySchema),
  logAdminAction('UPDATE_INVENTORY', 'inventory'),
  adminProductController.updateInventory
)

// Get inventory summary (requires inventory or products view permission)
router.get('/inventory/summary',
  requireAnyPermission([AdminPermission.INVENTORY_MANAGE, AdminPermission.PRODUCTS_VIEW]),
  adminProductController.getInventorySummary
)

// Export products (requires view permission)
router.get('/export',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  logAdminAction('EXPORT_PRODUCTS', 'product'),
  adminProductController.exportProducts
)

export default router