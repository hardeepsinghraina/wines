import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import { AppError } from '../middleware/joi-validation'

export interface InventoryItem {
  id: string
  wineId: string
  quantity: number
  reservedQty: number
  availableQty: number
  damagedQty: number
  location: string
  warehouse?: string
  zone?: string
  temperature?: number
  humidity?: number
  lowStockThreshold: number
  reorderPoint: number
  maxStockLevel?: number
  lastRestocked?: Date
  lastSold?: Date
  lastInventoryCheck?: Date
  expiryDate?: Date
  batchNumber?: string
  lotNumber?: string
  supplierRef?: string
  unitCost?: number
  totalValue?: number
  createdAt: Date
  updatedAt: Date
  wine?: {
    id: string
    name: string
    producer: string
    sku: string
    category: string
    currentPrice: number
  }
}

export interface InventoryAlert {
  id: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT' | 'EXPIRY_WARNING' | 'DAMAGED_STOCK'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  wineId: string
  inventoryId: string
  message: string
  threshold?: number
  currentValue?: number
  isResolved: boolean
  resolvedAt?: Date
  createdAt: Date
}

export interface InventoryMovement {
  id: string
  inventoryId: string
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN'
  quantity: number
  reason: string
  reference?: string
  fromLocation?: string
  toLocation?: string
  unitCost?: number
  totalCost?: number
  performedBy: string
  notes?: string
  createdAt: Date
}

export interface InventoryForecast {
  wineId: string
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  predictedDemand: number
  currentStock: number
  recommendedOrderQty: number
  stockoutRisk: number
  seasonalFactor: number
  trendFactor: number
  confidence: number
}

export interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  damagedItems: number
  turnoverRate: number
  averageDaysInStock: number
  topMovingProducts: Array<{
    wineId: string
    name: string
    quantitySold: number
    revenue: number
  }>
  slowMovingProducts: Array<{
    wineId: string
    name: string
    daysInStock: number
    currentStock: number
  }>
}

export interface SupplierIntegration {
  id: string
  supplierId: string
  supplierName: string
  apiEndpoint?: string
  apiKey?: string
  lastSync?: Date
  syncStatus: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  autoReorder: boolean
  leadTimeDays: number
  minimumOrderQty: number
  products: string[] // Array of wine IDs
}

export class InventoryService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Get inventory for a specific wine
   */
  async getInventoryByWineId(wineId: string): Promise<InventoryItem[]> {
    try {
      const inventory = await this.prisma.wineInventory.findMany({
        where: { wineId },
        include: {
          wine: {
            select: {
              id: true,
              name: true,
              producer: true,
              sku: true,
              category: true,
              currentPrice: true
            }
          }
        }
      })

      return inventory.map(this.transformInventoryData)
    } catch (error) {
      logger.error('Error fetching inventory by wine ID:', error)
      throw new AppError('Failed to fetch inventory', 500)
    }
  }

  /**
   * Get all inventory items with filtering and pagination
   */
  async getInventory(params: {
    page?: number
    limit?: number
    location?: string
    lowStock?: boolean
    outOfStock?: boolean
    expiringSoon?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    items: InventoryItem[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const {
        page = 1,
        limit = 50,
        location,
        lowStock,
        outOfStock,
        expiringSoon,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = params

      const skip = (page - 1) * limit
      const where: any = {}

      if (location) {
        where.location = location
      }

      if (lowStock) {
        where.availableQty = { lte: this.prisma.wineInventory.fields.lowStockThreshold }
      }

      if (outOfStock) {
        where.availableQty = { lte: 0 }
      }

      if (expiringSoon) {
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        where.expiryDate = {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      }

      const [items, total] = await Promise.all([
        this.prisma.wineInventory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            wine: {
              select: {
                id: true,
                name: true,
                producer: true,
                sku: true,
                category: true,
                currentPrice: true
              }
            }
          }
        }),
        this.prisma.wineInventory.count({ where })
      ])

      return {
        items: items.map(this.transformInventoryData),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      logger.error('Error fetching inventory:', error)
      throw new AppError('Failed to fetch inventory', 500)
    }
  }

  /**
   * Update inventory quantity
   */
  async updateInventory(
    inventoryId: string,
    data: {
      quantity?: number
      reservedQty?: number
      damagedQty?: number
      location?: string
      temperature?: number
      humidity?: number
      lowStockThreshold?: number
      reorderPoint?: number
      maxStockLevel?: number
      batchNumber?: string
      lotNumber?: string
      supplierRef?: string
      unitCost?: number
      notes?: string
    },
    performedBy: string
  ): Promise<InventoryItem> {
    try {
      const currentInventory = await this.prisma.wineInventory.findUnique({
        where: { id: inventoryId }
      })

      if (!currentInventory) {
        throw new AppError('Inventory item not found', 404)
      }

      // Calculate available quantity
      const newQuantity = data.quantity ?? currentInventory.quantity
      const newReservedQty = data.reservedQty ?? currentInventory.reservedQty
      const newDamagedQty = data.damagedQty ?? currentInventory.damagedQty
      const availableQty = Math.max(0, newQuantity - newReservedQty - newDamagedQty)

      // Calculate total value if unit cost is provided
      const unitCost = data.unitCost ?? currentInventory.unitCost
      const totalValue = unitCost ? newQuantity * unitCost : currentInventory.totalValue

      const updatedInventory = await this.prisma.wineInventory.update({
        where: { id: inventoryId },
        data: {
          ...data,
          availableQty,
          totalValue,
          lastInventoryCheck: new Date()
        },
        include: {
          wine: {
            select: {
              id: true,
              name: true,
              producer: true,
              sku: true,
              category: true,
              currentPrice: true
            }
          }
        }
      })

      // Record inventory movement if quantity changed
      if (data.quantity !== undefined && data.quantity !== currentInventory.quantity) {
        const quantityDiff = data.quantity - currentInventory.quantity
        await this.recordInventoryMovement({
          inventoryId,
          type: quantityDiff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDiff),
          reason: 'Manual adjustment',
          notes: data.notes || '',
          performedBy,
          ...(data.unitCost && { unitCost: data.unitCost })
        })
      }

      // Check for alerts
      await this.checkInventoryAlerts(inventoryId)

      return this.transformInventoryData(updatedInventory)
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error updating inventory:', error)
      throw new AppError('Failed to update inventory', 500)
    }
  }

  /**
   * Reserve inventory for pending orders
   */
  async reserveInventory(wineId: string, quantity: number, location: string = 'main_warehouse'): Promise<boolean> {
    try {
      const inventory = await this.prisma.wineInventory.findFirst({
        where: {
          wineId,
          location,
          availableQty: { gte: quantity }
        }
      })

      if (!inventory) {
        return false
      }

      await this.prisma.wineInventory.update({
        where: { id: inventory.id },
        data: {
          reservedQty: inventory.reservedQty + quantity,
          availableQty: inventory.availableQty - quantity
        }
      })

      await this.recordInventoryMovement({
        inventoryId: inventory.id,
        type: 'OUT',
        quantity,
        reason: 'Order reservation',
        performedBy: 'system'
      })

      return true
    } catch (error) {
      logger.error('Error reserving inventory:', error)
      return false
    }
  }

  /**
   * Release reserved inventory
   */
  async releaseReservedInventory(wineId: string, quantity: number, location: string = 'main_warehouse'): Promise<void> {
    try {
      const inventory = await this.prisma.wineInventory.findFirst({
        where: {
          wineId,
          location,
          reservedQty: { gte: quantity }
        }
      })

      if (!inventory) {
        throw new AppError('Reserved inventory not found', 404)
      }

      await this.prisma.wineInventory.update({
        where: { id: inventory.id },
        data: {
          reservedQty: inventory.reservedQty - quantity,
          availableQty: inventory.availableQty + quantity
        }
      })

      await this.recordInventoryMovement({
        inventoryId: inventory.id,
        type: 'IN',
        quantity,
        reason: 'Reservation release',
        performedBy: 'system'
      })
    } catch (error) {
      logger.error('Error releasing reserved inventory:', error)
      throw new AppError('Failed to release reserved inventory', 500)
    }
  }

  /**
   * Get inventory alerts
   */
  async getInventoryAlerts(params: {
    type?: string
    severity?: string
    resolved?: boolean
    page?: number
    limit?: number
  }): Promise<{
    alerts: InventoryAlert[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      // For now, generate alerts based on current inventory state
      // In a real implementation, you'd have a separate alerts table
      const { page = 1, limit = 50 } = params
      const skip = (page - 1) * limit

      const lowStockItems = await this.prisma.wineInventory.findMany({
        where: {
          OR: [
            { availableQty: { lte: this.prisma.wineInventory.fields.lowStockThreshold } },
            { availableQty: { lte: 0 } }
          ]
        },
        skip,
        take: limit,
        include: {
          wine: {
            select: {
              id: true,
              name: true,
              producer: true,
              sku: true
            }
          }
        }
      })

      const alerts: InventoryAlert[] = lowStockItems.map(item => ({
        id: `alert_${item.id}`,
        type: item.availableQty <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        severity: item.availableQty <= 0 ? 'CRITICAL' : 'HIGH',
        wineId: item.wineId,
        inventoryId: item.id,
        message: item.availableQty <= 0 
          ? `${item.wine?.name} is out of stock`
          : `${item.wine?.name} is below low stock threshold (${item.availableQty}/${item.lowStockThreshold})`,
        threshold: item.lowStockThreshold,
        currentValue: item.availableQty,
        isResolved: false,
        createdAt: new Date()
      }))

      return {
        alerts,
        total: alerts.length,
        page,
        totalPages: Math.ceil(alerts.length / limit)
      }
    } catch (error) {
      logger.error('Error fetching inventory alerts:', error)
      throw new AppError('Failed to fetch inventory alerts', 500)
    }
  }

  /**
   * Generate inventory forecast
   */
  async generateInventoryForecast(wineId: string, period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'): Promise<InventoryForecast> {
    try {
      // Get historical sales data
      const daysBack = period === 'WEEKLY' ? 84 : period === 'MONTHLY' ? 365 : 1095 // 12 weeks, 12 months, 12 quarters
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      const salesHistory = await this.prisma.orderItem.findMany({
        where: {
          wineId,
          order: {
            createdAt: { gte: startDate },
            status: { in: ['COMPLETED', 'SHIPPED', 'DELIVERED'] }
          }
        },
        include: {
          order: {
            select: {
              createdAt: true,
              status: true
            }
          }
        }
      })

      // Get current inventory
      const currentInventory = await this.prisma.wineInventory.findFirst({
        where: { wineId }
      })

      const currentStock = currentInventory?.availableQty || 0

      // Simple forecasting algorithm
      const totalSold = salesHistory.reduce((sum, item) => sum + item.quantity, 0)
      const periodsBack = period === 'WEEKLY' ? 12 : 12 // 12 periods
      const averageDemand = totalSold / periodsBack

      // Apply seasonal and trend factors (simplified)
      const seasonalFactor = this.calculateSeasonalFactor(period)
      const trendFactor = this.calculateTrendFactor(salesHistory)
      
      const predictedDemand = Math.round(averageDemand * seasonalFactor * trendFactor)
      const recommendedOrderQty = Math.max(0, predictedDemand - currentStock)
      const stockoutRisk = currentStock < predictedDemand ? (predictedDemand - currentStock) / predictedDemand : 0

      return {
        wineId,
        period,
        predictedDemand,
        currentStock,
        recommendedOrderQty,
        stockoutRisk,
        seasonalFactor,
        trendFactor,
        confidence: 0.75 // Simplified confidence score
      }
    } catch (error) {
      logger.error('Error generating inventory forecast:', error)
      throw new AppError('Failed to generate inventory forecast', 500)
    }
  }

  /**
   * Generate inventory report
   */
  async generateInventoryReport(): Promise<InventoryReport> {
    try {
      const [
        inventoryStats,
        lowStockCount,
        outOfStockCount,
        expiringCount,
        damagedCount,
        topMoving,
        slowMoving
      ] = await Promise.all([
        this.prisma.wineInventory.aggregate({
          _count: { id: true },
          _sum: { totalValue: true }
        }),
        this.prisma.wineInventory.count({
          where: {
            availableQty: { lte: this.prisma.wineInventory.fields.lowStockThreshold }
          }
        }),
        this.prisma.wineInventory.count({
          where: { availableQty: { lte: 0 } }
        }),
        this.prisma.wineInventory.count({
          where: {
            expiryDate: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          }
        }),
        this.prisma.wineInventory.aggregate({
          _sum: { damagedQty: true }
        }),
        this.getTopMovingProducts(),
        this.getSlowMovingProducts()
      ])

      return {
        totalProducts: inventoryStats._count.id || 0,
        totalValue: inventoryStats._sum.totalValue || 0,
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        expiringItems: expiringCount,
        damagedItems: damagedCount._sum.damagedQty || 0,
        turnoverRate: 0, // Would need more complex calculation
        averageDaysInStock: 0, // Would need more complex calculation
        topMovingProducts: topMoving,
        slowMovingProducts: slowMoving
      }
    } catch (error) {
      logger.error('Error generating inventory report:', error)
      throw new AppError('Failed to generate inventory report', 500)
    }
  }

  /**
   * Record inventory movement
   */
  private async recordInventoryMovement(data: {
    inventoryId: string
    type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN'
    quantity: number
    reason: string
    reference?: string
    fromLocation?: string
    toLocation?: string
    unitCost?: number
    notes?: string
    performedBy: string
  }): Promise<void> {
    try {
      // In a real implementation, you'd have an inventory_movements table
      logger.info('Inventory movement recorded', {
        inventoryId: data.inventoryId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        performedBy: data.performedBy
      })
    } catch (error) {
      logger.error('Error recording inventory movement:', error)
    }
  }

  /**
   * Check for inventory alerts
   */
  private async checkInventoryAlerts(inventoryId: string): Promise<void> {
    try {
      const inventory = await this.prisma.wineInventory.findUnique({
        where: { id: inventoryId },
        include: {
          wine: {
            select: { name: true }
          }
        }
      })

      if (!inventory) return

      // Check low stock
      if (inventory.availableQty <= inventory.lowStockThreshold) {
        logger.warn('Low stock alert', {
          inventoryId,
          wineName: inventory.wine?.name,
          availableQty: inventory.availableQty,
          threshold: inventory.lowStockThreshold
        })
      }

      // Check reorder point
      if (inventory.availableQty <= inventory.reorderPoint) {
        logger.warn('Reorder point reached', {
          inventoryId,
          wineName: inventory.wine?.name,
          availableQty: inventory.availableQty,
          reorderPoint: inventory.reorderPoint
        })
      }

      // Check expiry
      if (inventory.expiryDate) {
        const daysUntilExpiry = Math.ceil((inventory.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 30) {
          logger.warn('Expiry warning', {
            inventoryId,
            wineName: inventory.wine?.name,
            daysUntilExpiry
          })
        }
      }
    } catch (error) {
      logger.error('Error checking inventory alerts:', error)
    }
  }

  /**
   * Calculate seasonal factor for forecasting
   */
  private calculateSeasonalFactor(period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'): number {
    const now = new Date()
    const month = now.getMonth()
    
    // Simple seasonal factors (wine sales typically higher in winter months)
    const monthlyFactors = [1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.7, 0.8, 0.9, 1.0, 1.3, 1.4]
    return monthlyFactors[month] || 1.0
  }

  /**
   * Calculate trend factor for forecasting
   */
  private calculateTrendFactor(salesHistory: any[]): number {
    if (salesHistory.length < 2) return 1.0

    // Simple trend calculation based on recent vs older sales
    const midPoint = Math.floor(salesHistory.length / 2)
    const recentSales = salesHistory.slice(0, midPoint).reduce((sum, item) => sum + item.quantity, 0)
    const olderSales = salesHistory.slice(midPoint).reduce((sum, item) => sum + item.quantity, 0)

    if (olderSales === 0) return 1.0
    return Math.min(2.0, Math.max(0.5, recentSales / olderSales))
  }

  /**
   * Get top moving products
   */
  private async getTopMovingProducts(): Promise<Array<{
    wineId: string
    name: string
    quantitySold: number
    revenue: number
  }>> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const topMoving = await this.prisma.orderItem.groupBy({
        by: ['wineId'],
        where: {
          order: {
            createdAt: { gte: thirtyDaysAgo },
            status: { in: ['COMPLETED', 'SHIPPED', 'DELIVERED'] }
          }
        },
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      })

      const wineIds = topMoving.map(item => item.wineId)
      const wines = await this.prisma.wine.findMany({
        where: { id: { in: wineIds } },
        select: { id: true, name: true }
      })

      return topMoving.map(item => {
        const wine = wines.find(w => w.id === item.wineId)
        return {
          wineId: item.wineId,
          name: wine?.name || 'Unknown',
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.totalPrice || 0
        }
      })
    } catch (error) {
      logger.error('Error getting top moving products:', error)
      return []
    }
  }

  /**
   * Get slow moving products
   */
  private async getSlowMovingProducts(): Promise<Array<{
    wineId: string
    name: string
    daysInStock: number
    currentStock: number
  }>> {
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      // Get products with no sales in last 90 days
      const allInventory = await this.prisma.wineInventory.findMany({
        where: {
          availableQty: { gt: 0 }
        },
        include: {
          wine: {
            select: {
              id: true,
              name: true,
              createdAt: true
            }
          }
        }
      })

      const recentSales = await this.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: ninetyDaysAgo },
            status: { in: ['COMPLETED', 'SHIPPED', 'DELIVERED'] }
          }
        },
        select: { wineId: true }
      })

      const soldWineIds = new Set(recentSales.map(sale => sale.wineId))

      return allInventory
        .filter(item => !soldWineIds.has(item.wineId))
        .map(item => ({
          wineId: item.wineId,
          name: item.wine?.name || 'Unknown',
          daysInStock: Math.ceil((Date.now() - (item.wine?.createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)),
          currentStock: item.availableQty
        }))
        .sort((a, b) => b.daysInStock - a.daysInStock)
        .slice(0, 10)
    } catch (error) {
      logger.error('Error getting slow moving products:', error)
      return []
    }
  }

  /**
   * Transform inventory data for API response
   */
  private transformInventoryData = (inventory: any): InventoryItem => {
    return {
      id: inventory.id,
      wineId: inventory.wineId,
      quantity: inventory.quantity,
      reservedQty: inventory.reservedQty,
      availableQty: inventory.availableQty,
      damagedQty: inventory.damagedQty,
      location: inventory.location,
      warehouse: inventory.warehouse,
      zone: inventory.zone,
      temperature: inventory.temperature,
      humidity: inventory.humidity,
      lowStockThreshold: inventory.lowStockThreshold,
      reorderPoint: inventory.reorderPoint,
      maxStockLevel: inventory.maxStockLevel,
      lastRestocked: inventory.lastRestocked,
      lastSold: inventory.lastSold,
      lastInventoryCheck: inventory.lastInventoryCheck,
      expiryDate: inventory.expiryDate,
      batchNumber: inventory.batchNumber,
      lotNumber: inventory.lotNumber,
      supplierRef: inventory.supplierRef,
      unitCost: inventory.unitCost,
      totalValue: inventory.totalValue,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
      wine: inventory.wine
    }
  }
}