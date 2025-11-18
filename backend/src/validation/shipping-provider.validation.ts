import Joi from 'joi';

const addressSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.string().optional(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().length(2).uppercase().required(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional()
});

const packageItemSchema = Joi.object({
  description: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  value: Joi.number().positive().required(),
  weight: Joi.number().positive().required(),
  hsCode: Joi.string().optional(),
  countryOfOrigin: Joi.string().length(2).uppercase().optional()
});

const packageSchema = Joi.object({
  weight: Joi.number().positive().required(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required()
  }).required(),
  value: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().required(),
  description: Joi.string().required(),
  contents: Joi.array().items(packageItemSchema).min(1).required()
});

const shipmentRequestSchema = Joi.object({
  orderId: Joi.string().required(),
  fromAddress: addressSchema.required(),
  toAddress: addressSchema.required(),
  packages: Joi.array().items(packageSchema).min(1).required(),
  service: Joi.string().required(),
  insurance: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().required()
  }).optional(),
  signature: Joi.boolean().optional(),
  saturdayDelivery: Joi.boolean().optional()
});

export const shippingProviderValidation = {
  createShippingLabel: {
    body: Joi.object({
      shipmentRequest: shipmentRequestSchema.required(),
      carrier: Joi.string().valid('fedex', 'ups', 'dhl').optional()
    })
  },

  getTrackingInfo: {
    params: Joi.object({
      carrier: Joi.string().valid('fedex', 'ups', 'dhl').required(),
      trackingNumber: Joi.string().required()
    })
  },

  updateTrackingStatus: {
    params: Joi.object({
      carrier: Joi.string().valid('fedex', 'ups', 'dhl').required(),
      trackingNumber: Joi.string().required()
    })
  },

  handleCarrierWebhook: {
    params: Joi.object({
      carrier: Joi.string().valid('fedex', 'ups', 'dhl').required()
    }),
    body: Joi.object().unknown(true) // Allow any webhook payload structure
  },

  batchUpdateTracking: {
    body: Joi.object({
      trackingNumbers: Joi.array().items(
        Joi.object({
          trackingNumber: Joi.string().required(),
          carrier: Joi.string().valid('fedex', 'ups', 'dhl').required()
        })
      ).min(1).max(100).required()
    })
  },

  getAvailableServices: {
    params: Joi.object({
      carrier: Joi.string().valid('fedex', 'ups', 'dhl').required()
    }),
    query: Joi.object({
      international: Joi.string().valid('true', 'false').optional()
    })
  },

  getCarrierRates: {
    body: Joi.object({
      fromAddress: addressSchema.required(),
      toAddress: addressSchema.required(),
      packages: Joi.array().items(packageSchema).min(1).required(),
      services: Joi.array().items(Joi.string()).optional()
    })
  }
};