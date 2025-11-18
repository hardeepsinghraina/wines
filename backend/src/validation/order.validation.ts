import Joi from 'joi';

export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      wineId: Joi.string().required().messages({
        'string.empty': 'Wine ID is required',
        'any.required': 'Wine ID is required'
      }),
      quantity: Joi.number().integer().min(1).max(99).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 99',
        'any.required': 'Quantity is required'
      })
    })
  ).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items are required'
  }),
  shippingAddressId: Joi.string().required().messages({
    'string.empty': 'Shipping address ID is required',
    'any.required': 'Shipping address ID is required'
  }),
  billingAddressId: Joi.string().optional().allow(''),
  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'PENDING',
    'CONFIRMED', 
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
  ).required().messages({
    'any.only': 'Invalid order status',
    'any.required': 'Status is required'
  })
});

export const getOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 50'
  })
});