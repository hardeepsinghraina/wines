import Joi from 'joi';

export const addToCartSchema = Joi.object({
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
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 99',
    'any.required': 'Quantity is required'
  })
});

export const createOrderFromCartSchema = Joi.object({
  shippingAddressId: Joi.string().required().messages({
    'string.empty': 'Shipping address ID is required',
    'any.required': 'Shipping address ID is required'
  }),
  billingAddressId: Joi.string().optional().allow(''),
  notes: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters'
  })
});