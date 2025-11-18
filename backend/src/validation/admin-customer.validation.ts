import Joi from 'joi'

export const updateCustomerStatusSchema = Joi.object({
  isActive: Joi.boolean()
    .required()
    .messages({
      'any.required': 'isActive status is required'
    }),
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason must be less than 500 characters'
    })
})

export const customerQuerySchema = Joi.object({
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
  isActive: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'isActive must be "true" or "false"'
    }),
  emailVerified: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'emailVerified must be "true" or "false"'
    }),
  sortBy: Joi.string()
    .valid('email', 'firstName', 'lastName', 'createdAt', 'updatedAt')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'sortBy must be one of: email, firstName, lastName, createdAt, updatedAt'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'sortOrder must be "asc" or "desc"'
    })
})

export const searchCustomersSchema = Joi.object({
  q: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Search query must be at least 2 characters',
      'string.max': 'Search query must be less than 255 characters',
      'any.required': 'Search query is required'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
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