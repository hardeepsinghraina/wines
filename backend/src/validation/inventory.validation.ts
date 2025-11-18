import Joi from 'joi'

export const updateInventorySchema = Joi.object({
  quantity: Joi.number().integer().min(0).optional(),
  reservedQty: Joi.number().integer().min(0).optional(),
  damagedQty: Joi.number().integer().min(0).optional(),
  location: Joi.string().min(1).max(100).optional(),
  warehouse: Joi.string().min(1).max(100).optional(),
  zone: Joi.string().min(1).max(50).optional(),
  temperature: Joi.number().min(-20).max(50).optional(),
  humidity: Joi.number().min(0).max(100).optional(),
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  reorderPoint: Joi.number().integer().min(0).optional(),
  maxStockLevel: Joi.number().integer().min(0).optional(),
  batchNumber: Joi.string().min(1).max(50).optional(),
  lotNumber: Joi.string().min(1).max(50).optional(),
  supplierRef: Joi.string().min(1).max(100).optional(),
  unitCost: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional()
})

export const reserveInventorySchema = Joi.object({
  wineId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  location: Joi.string().min(1).max(100).optional().default('main_warehouse')
})

export const releaseInventorySchema = Joi.object({
  wineId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  location: Joi.string().min(1).max(100).optional().default('main_warehouse')
})

export const bulkUpdateInventorySchema = Joi.object({
  updates: Joi.array().items(
    Joi.object({
      inventoryId: Joi.string().required(),
      data: updateInventorySchema.required()
    })
  ).min(1).max(100).required()
})

export const inventoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50),
  location: Joi.string().min(1).max(100).optional(),
  lowStock: Joi.boolean().optional(),
  outOfStock: Joi.boolean().optional(),
  expiringSoon: Joi.boolean().optional(),
  sortBy: Joi.string().valid('updatedAt', 'quantity', 'availableQty', 'location', 'wine.name').optional().default('updatedAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
})

export const alertsQuerySchema = Joi.object({
  type: Joi.string().valid('LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_POINT', 'EXPIRY_WARNING', 'DAMAGED_STOCK').optional(),
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  resolved: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50)
})

export const forecastQuerySchema = Joi.object({
  period: Joi.string().valid('WEEKLY', 'MONTHLY', 'QUARTERLY').optional().default('MONTHLY')
})

export const analyticsQuerySchema = Joi.object({
  period: Joi.number().integer().min(1).max(365).optional().default(30)
})