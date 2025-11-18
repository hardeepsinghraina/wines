import { Router } from 'express'
import { InventoryController } from '../controllers/inventory.controller'
import { authenticateToken } from '../middleware/auth'
import { authenticateAdmin } from '../middleware/admin-auth'

const router = Router()
const inventoryController = new InventoryController()

// Public routes (for checking availability)
router.get('/wine/:wineId', inventoryController.getInventoryByWineId)

// Protected admin routes
router.use(authenticateToken)
router.use(authenticateAdmin)

// Inventory management
router.get('/', inventoryController.getInventory)
router.put('/:inventoryId', inventoryController.updateInventory)
router.post('/bulk-update', inventoryController.bulkUpdateInventory)

// Inventory operations
router.post('/reserve', inventoryController.reserveInventory)
router.post('/release', inventoryController.releaseReservedInventory)

// Alerts and monitoring
router.get('/alerts', inventoryController.getInventoryAlerts)

// Analytics and reporting
router.get('/forecast/:wineId', inventoryController.generateInventoryForecast)
router.get('/report', inventoryController.generateInventoryReport)
router.get('/analytics', inventoryController.getInventoryAnalytics)

export default router