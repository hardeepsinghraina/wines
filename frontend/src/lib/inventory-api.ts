import { api } from './api'

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

export interface InventoryQueryParams {
  page?: number
  limit?: number
  location?: string
  lowStock?: boolean
  outOfStock?: boolean
  expiringSoon?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UpdateInventoryRequest {
  quantity?: number
  reservedQty?: number
  damagedQty?: number
  location?: string
  warehouse?: string
  zone?: string
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
}

export interface BulkUpdateInventoryRequest {
  updates: Array<{
    inventoryId: string
    data: UpdateInventoryRequest
  }>
}

export interface ReserveInventoryRequest {
  wineId: string
  quantity: number
  location?: string
}

export interface ReleaseInventoryRequest {
  wineId: string
  quantity: number
  location?: string
}

export class InventoryAPI {
  /**
   * Get inventory for a specific wine
   */
  static async getInventoryByWineId(wineId: string): Promise<InventoryItem[]> {
    const response = await api.get(`/inventory/wine/${wineId}`)
    return response as any
  }

  /**
   * Get all inventory items with filtering and pagination
   */
  static async getInventory(params: InventoryQueryParams = {}): Promise<{
    items: InventoryItem[]
    total: number
    page: number
    totalPages: number
  }> {
    const response = await api.get('/inventory')
    return response as any
  }

  /**
   * Update inventory item
   */
  static async updateInventory(inventoryId: string, data: UpdateInventoryRequest): Promise<InventoryItem> {
    const response = await api.put(`/inventory/${inventoryId}`, data)
    return response as any
  }

  /**
   * Bulk update inventory items
   */
  static async bulkUpdateInventory(request: BulkUpdateInventoryRequest): Promise<any[]> {
    const response = await api.post('/inventory/bulk-update', request)
    return response as any
  }

  /**
   * Reserve inventory for an order
   */
  static async reserveInventory(request: ReserveInventoryRequest): Promise<void> {
    await api.post('/inventory/reserve', request)
  }

  /**
   * Release reserved inventory
   */
  static async releaseReservedInventory(request: ReleaseInventoryRequest): Promise<void> {
    await api.post('/inventory/release', request)
  }

  /**
   * Get inventory alerts
   */
  static async getInventoryAlerts(params: {
    type?: string
    severity?: string
    resolved?: boolean
    page?: number
    limit?: number
  } = {}): Promise<{
    alerts: InventoryAlert[]
    total: number
    page: number
    totalPages: number
  }> {
    const response = await api.get('/inventory/alerts')
    return response as any
  }

  /**
   * Generate inventory forecast
   */
  static async generateInventoryForecast(
    wineId: string, 
    period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' = 'MONTHLY'
  ): Promise<InventoryForecast> {
    const response = await api.get(`/inventory/forecast/${wineId}?period=${period}`)
    return response as any
  }

  /**
   * Generate inventory report
   */
  static async generateInventoryReport(): Promise<InventoryReport> {
    const response = await api.get('/inventory/report')
    return response as any
  }

  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics(period: number = 30): Promise<InventoryReport> {
    const response = await api.get(`/inventory/analytics?period=${period}`)
    return response as any
  }
}

export default InventoryAPI