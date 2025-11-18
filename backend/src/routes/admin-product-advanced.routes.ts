import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { adminProductAdvancedController } from '@/controllers/admin-product-advanced.controller'
import { 
  authenticateAdmin, 
  requirePermission, 
  logAdminAction 
} from '@/middleware/admin-auth'
import { AdminPermission } from '@/types/admin'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// All routes require admin authentication
router.use(authenticateAdmin)

// Image management
router.post('/:productId/images',
  requirePermission(AdminPermission.PRODUCTS_EDIT),
  upload.array('images', 10),
  logAdminAction('UPLOAD_PRODUCT_IMAGES', 'product'),
  adminProductAdvancedController.uploadImages
)

// SEO management
router.put('/:productId/seo',
  requirePermission(AdminPermission.PRODUCTS_EDIT),
  logAdminAction('UPDATE_PRODUCT_SEO', 'product'),
  adminProductAdvancedController.updateSEO
)

// Review moderation
router.get('/:productId/reviews',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  adminProductAdvancedController.getProductReviews
)

router.put('/reviews/:reviewId/status',
  requirePermission(AdminPermission.PRODUCTS_EDIT),
  logAdminAction('UPDATE_REVIEW_STATUS', 'review'),
  adminProductAdvancedController.updateReviewStatus
)

router.delete('/reviews/:reviewId',
  requirePermission(AdminPermission.PRODUCTS_DELETE),
  logAdminAction('DELETE_REVIEW', 'review'),
  adminProductAdvancedController.deleteReview
)

// Variant management
router.get('/:productId/variants',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  adminProductAdvancedController.getProductVariants
)

router.post('/:productId/variants',
  requirePermission(AdminPermission.PRODUCTS_CREATE),
  logAdminAction('CREATE_PRODUCT_VARIANT', 'product'),
  adminProductAdvancedController.createVariant
)

router.put('/variants/:variantId',
  requirePermission(AdminPermission.PRODUCTS_EDIT),
  logAdminAction('UPDATE_PRODUCT_VARIANT', 'product'),
  adminProductAdvancedController.updateVariant
)

router.delete('/variants/:variantId',
  requirePermission(AdminPermission.PRODUCTS_DELETE),
  logAdminAction('DELETE_PRODUCT_VARIANT', 'product'),
  adminProductAdvancedController.deleteVariant
)

// Recommendation management
router.get('/:productId/recommendations',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  adminProductAdvancedController.getRecommendations
)

router.put('/:productId/recommendations',
  requirePermission(AdminPermission.PRODUCTS_EDIT),
  logAdminAction('UPDATE_PRODUCT_RECOMMENDATIONS', 'product'),
  adminProductAdvancedController.updateRecommendations
)

// Inventory alerts
router.get('/alerts/low-stock',
  requirePermission(AdminPermission.INVENTORY_MANAGE),
  adminProductAdvancedController.getLowStockAlerts
)

// Export functionality
router.get('/export',
  requirePermission(AdminPermission.PRODUCTS_VIEW),
  logAdminAction('EXPORT_PRODUCTS', 'product'),
  adminProductAdvancedController.exportProducts
)

export default router