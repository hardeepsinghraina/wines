import { Request, Response } from 'express'
import { InventoryService } from '../services/inventory.service'
import { logger } from '../utils/logger'
import { AppError } from '../middleware/joi-validation'

export class InventoryController {
  private inventoryService: InventoryService

  constructor() {
    this.inventoryService = new InventoryService()
  }

  /**
   * Get inventory for a specific wine
   */
  getInventoryByWineId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wineId } = req.params
      
      if (!wineId) {
        res.status(400).json({
          success: false,
          message: 'Wine ID is required'
        })
        return
      }
      
      const inventory = await this.inventoryService.getInventoryByWineId(wineId)

      res.json({
        success: true,
        data: inventory
      })
    } catch (error) {
      logger.error('Error in getInventoryByWineId:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Get all inventory items with filtering
   */
  getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '50',
        location,
        lowStock,
        outOfStock,
        expiringSoon,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query

      const params = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        location: location as string,
        lowStock: lowStock === 'true',
        outOfStock: outOfStock === 'true',
        expiringSoon: expiringSoon === 'true',
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      }

      const result = await this.inventoryService.getInventory(params)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Error in getInventory:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Update inventory item
   */
  updateInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { inventoryId } = req.params
      const updateData = req.body
      const performedBy = (req as any).admin?.id || (req as any).user?.id || 'system'

      if (!inventoryId) {
        res.status(400).json({
          success: false,
          message: 'Inventory ID is required'
        })
        return
      }

      const updatedInventory = await this.inventoryService.updateInventory(
        inventoryId,
        updateData,
        performedBy
      )

      res.json({
        success: true,
        data: updatedInventory,
        message: 'Inventory updated successfully'
      })
    } catch (error) {
      logger.error('Error in updateInventory:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Reserve inventory for an order
   */
  reserveInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wineId, quantity, location = 'main_warehouse' } = req.body

      if (!wineId || !quantity) {
        res.status(400).json({
          success: false,
          message: 'Wine ID and quantity are required'
        })
        return
      }

      const success = await this.inventoryService.reserveInventory(wineId, quantity, location)

      if (success) {
        res.json({
          success: true,
          message: 'Inventory reserved successfully'
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Insufficient inventory available'
        })
      }
    } catch (error) {
      logger.error('Error in reserveInventory:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Release reserved inventory
   */
  releaseReservedInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wineId, quantity, location = 'main_warehouse' } = req.body

      if (!wineId || !quantity) {
        res.status(400).json({
          success: false,
          message: 'Wine ID and quantity are required'
        })
        return
      }

      await this.inventoryService.releaseReservedInventory(wineId, quantity, location)

      res.json({
        success: true,
        message: 'Reserved inventory released successfully'
      })
    } catch (error) {
      logger.error('Error in releaseReservedInventory:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Get inventory alerts
   */
  getInventoryAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        type,
        severity,
        resolved,
        page = '1',
        limit = '50'
      } = req.query

      const params = {
        type: type as string,
        severity: severity as string,
        resolved: resolved === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }

      const result = await this.inventoryService.getInventoryAlerts(params)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Error in getInventoryAlerts:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Generate inventory forecast
   */
  generateInventoryForecast = async (req: Request, res: Response): Promise<void> => {
    try {
      const { wineId } = req.params
      const { period = 'MONTHLY' } = req.query

      if (!wineId) {
        res.status(400).json({
          success: false,
          message: 'Wine ID is required'
        })
        return
      }

      if (!['WEEKLY', 'MONTHLY', 'QUARTERLY'].includes(period as string)) {
        res.status(400).json({
          success: false,
          message: 'Invalid period. Must be WEEKLY, MONTHLY, or QUARTERLY'
        })
        return
      }

      const forecast = await this.inventoryService.generateInventoryForecast(
        wineId,
        period as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
      )

      res.json({
        success: true,
        data: forecast
      })
    } catch (error) {
      logger.error('Error in generateInventoryForecast:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Generate inventory report
   */
  generateInventoryReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const report = await this.inventoryService.generateInventoryReport()

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      logger.error('Error in generateInventoryReport:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }

  /**
   * Bulk update inventory
   */
  bulkUpdateInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { updates } = req.body
      const performedBy = (req as any).admin?.id || (req as any).user?.id || 'system'

      if (!Array.isArray(updates)) {
        res.status(400).json({
          success: false,
          message: 'Updates must be an array'
        })
        return
      }

      const results = []
      for (const update of updates) {
        try {
          const result = await this.inventoryService.updateInventory(
            update.inventoryId,
            update.data,
            performedBy
          )
          results.push({ success: true, inventoryId: update.inventoryId, data: result })
        } catch (error) {
          results.push({ 
            success: false, 
            inventoryId: update.inventoryId, 
            error: error instanceof AppError ? error.message : 'Update failed' 
          })
        }
      }

      res.json({
        success: true,
        data: results,
        message: 'Bulk inventory update completed'
      })
    } catch (error) {
      logger.error('Error in bulkUpdateInventory:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Get inventory analytics
   */
  getInventoryAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = '30' } = req.query
      const days = parseInt(period as string)

      // This would typically involve more complex analytics
      // For now, we'll return the inventory report
      const report = await this.inventoryService.generateInventoryReport()

      res.json({
        success: true,
        data: {
          period: `${days} days`,
          ...report
        }
      })
    } catch (error) {
      logger.error('Error in getInventoryAnalytics:', error)
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        })
      }
    }
  }
}