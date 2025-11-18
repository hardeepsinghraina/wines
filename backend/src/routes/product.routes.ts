import { Router } from 'express'
import { ProductController } from '../controllers/product.controller'
import { authenticateToken, requireAdmin } from '../middleware/auth'
import { validateRequest } from '../middleware/joi-validation'
import { 
  createWineValidation, 
  updateWineValidation, 
  wineSearchValidation,
  wineParamsValidation,
  searchSuggestionsValidation
} from '../validation/product.validation'

const router = Router()
const productController = new ProductController()

// Public routes
router.get('/', productController.getWines)
router.get('/search', validateRequest(wineSearchValidation), productController.searchWines)
router.get('/search/suggestions', validateRequest(searchSuggestionsValidation), productController.getSearchSuggestions)
router.get('/filters', productController.getFilterOptions)
router.get('/categories', productController.getCategories)
router.get('/featured', productController.getFeaturedWines)
router.get('/:id', validateRequest(wineParamsValidation), productController.getWineById)

// Admin routes (require authentication and admin role)
router.post('/', 
  authenticateToken, 
  requireAdmin,
  validateRequest(createWineValidation), 
  productController.createWine
)

router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  validateRequest(updateWineValidation), 
  productController.updateWine
)

router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  validateRequest(wineParamsValidation), 
  productController.deleteWine
)

export { router as productRoutes }