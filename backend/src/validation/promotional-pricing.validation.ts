import Joi from 'joi'

export const createPromotionSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().required().min(1).max(1000),
  type: Joi.string().valid(
    'flash_sale',
    'seasonal',
    'clearance',
    'new_customer',
    'loyalty_reward',
    'bulk_discount',
    'vip_exclusive',
    'limited_edition'
  ).required(),
  discountType: Joi.string().valid('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping').required(),
  discountValue: Joi.number().positive().required(),
  maxDiscountAmount: Joi.number().positive().optional(),
  minOrderAmount: Joi.number().positive().optional(),
  applicableProducts: Joi.array().items(Joi.string()).default([]),
  applicableCategories: Joi.array().items(Joi.string()).default([]),
  customerTiers: Joi.array().items(
    Joi.string().valid('bronze', 'silver', 'gold', 'platinum', 'vip')
  ).required(),
  totalUsageLimit: Joi.number().integer().positive().optional(),
  perCustomerLimit: Joi.number().integer().positive().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  bannerMessage: Joi.string().max(500).optional(),
  emailSubject: Joi.string().max(255).optional(),
  urgencyMessage: Joi.string().max(255).optional()
})

export const createDiscountCodeSchema = Joi.object({
  code: Joi.string().required().min(3).max(50).uppercase(),
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().max(1000).optional(),
  discountType: Joi.string().valid('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping').required(),
  discountValue: Joi.number().positive().required(),
  maxDiscountAmount: Joi.number().positive().optional(),
  minOrderAmount: Joi.number().positive().optional(),
  applicableProducts: Joi.array().items(Joi.string()).default([]),
  customerTiers: Joi.array().items(
    Joi.string().valid('bronze', 'silver', 'gold', 'platinum', 'vip')
  ).required(),
  totalUsageLimit: Joi.number().integer().positive().optional(),
  perCustomerLimit: Joi.number().integer().positive().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required()
})

export const applyDiscountSchema = Joi.object({
  code: Joi.string().optional(),
  promotionId: Joi.string().optional(),
  cartItems: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().positive().required(),
      price: Joi.number().positive().required()
    })
  ).required(),
  customerTier: Joi.string().valid('bronze', 'silver', 'gold', 'platinum', 'vip').optional(),
  customerId: Joi.string().optional()
}).xor('code', 'promotionId') // Either code or promotionId, but not both

export const getPromotionalPricingSchema = Joi.object({
  customerTier: Joi.string().valid('bronze', 'silver', 'gold', 'platinum', 'vip').optional(),
  quantity: Joi.number().integer().positive().default(1)
})

export const getBulkPricingSchema = Joi.object({
  originalPrice: Joi.number().positive().required()
})

export const getVIPPricingSchema = Joi.object({
  customerTier: Joi.string().valid('bronze', 'silver', 'gold', 'platinum', 'vip').required(),
  originalPrice: Joi.number().positive().required()
})