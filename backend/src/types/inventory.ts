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

export interface BulkUpdateInventoryRequest {
  updates: Array<{
    inventoryId: string
    data: UpdateInventoryRequest
  }>
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

export interface AlertsQueryParams {
  type?: string
  severity?: string
  resolved?: boolean
  page?: number
  limit?: number
}

export interface ForecastQueryParams {
  period?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
}

export interface AnalyticsQueryParams {
  period?: number
}