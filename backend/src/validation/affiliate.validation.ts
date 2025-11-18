import Joi from 'joi';

export const affiliateValidation = {
  trackReferral: Joi.object({
    affiliateCode: Joi.string().length(8).uppercase().required()
  }),

  awardPoints: Joi.object({
    userId: Joi.string().uuid().required(),
    points: Joi.number().integer().min(1).required(),
    description: Joi.string().min(1).max(500).required()
  }),

  redeemReward: Joi.object({
    rewardId: Joi.string().uuid().required()
  }),

  getUserTransactions: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional()
  })
};