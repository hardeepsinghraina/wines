import Joi from 'joi'

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')
    .required()
    .messages({
      'any.only': 'Status must be one of: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED',
      'any.required': 'Status is required'
    }),
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes must be less than 500 characters'
    })
})

export const cancelOrderSchema = Joi.object({
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason must be less than 500 characters'
    })
})

export const refundOrderSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Refund amount must be positive',
      'any.required': 'Refund amount is required'
    }),
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason must be less than 500 characters'
    })
})

export const orderQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Search term must be less than 255 characters'
    }),
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')
    .optional()
    .messages({
      'any.only': 'Status must be one of: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED'
    }),
  dateFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date'
    }),
  dateTo: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date'
    }),
  sortBy: Joi.string()
    .valid('orderNumber', 'status', 'totalAmount', 'createdAt', 'updatedAt')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'sortBy must be one of: orderNumber, status, totalAmount, createdAt, updatedAt'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'sortOrder must be "asc" or "desc"'
    })
})

export const analyticsQuerySchema = Joi.object({
  dateFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date'
    }),
  dateTo: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date'
    })
})