import Joi from 'joi';

export const privateSalesValidation = {
  purchaseFromPrivateSale: Joi.object({
    quantity: Joi.number().integer().min(1).required()
  }),

  grantAccess: Joi.object({
    userId: Joi.string().uuid().required(),
    privateSaleId: Joi.string().uuid().required(),
    reason: Joi.string().min(1).max(500).required()
  }),

  privateSaleId: Joi.object({
    id: Joi.string().uuid().required()
  })
};