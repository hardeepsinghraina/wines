import Joi from 'joi';

export const shippingValidation = {
  calculateShipping: {
    body: Joi.object({
      items: Joi.array().items(
        Joi.object({
          wineId: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
          weight: Joi.number().positive().optional(),
          value: Joi.number().positive().required()
        })
      ).min(1).required(),
      destinationCountry: Joi.string().length(2).uppercase().required(),
      destinationState: Joi.string().optional(),
      destinationPostalCode: Joi.string().optional(),
      shippingMethod: Joi.string().valid(
        'STANDARD',
        'EXPRESS', 
        'VIP',
        'OVERNIGHT',
        'INTERNATIONAL_STANDARD',
        'INTERNATIONAL_EXPRESS'
      ).optional(),
      isVipDelivery: Joi.boolean().optional(),
      insuranceRequested: Joi.boolean().optional()
    })
  },

  getShippingMethods: {
    query: Joi.object({
      country: Joi.string().length(2).uppercase().required(),
      weight: Joi.number().positive().optional(),
      value: Joi.number().positive().optional()
    })
  },

  getVipOptions: {
    query: Joi.object({
      value: Joi.number().positive().required()
    })
  },

  calculateInsurance: {
    body: Joi.object({
      value: Joi.number().positive().required(),
      shippingType: Joi.string().valid(
        'STANDARD',
        'EXPRESS',
        'VIP',
        'OVERNIGHT',
        'INTERNATIONAL_STANDARD',
        'INTERNATIONAL_EXPRESS'
      ).optional()
    })
  },

  validateAddress: {
    query: Joi.object({
      country: Joi.string().length(2).uppercase().required(),
      state: Joi.string().optional()
    })
  }
};