import Joi from 'joi';

export const nftValidation = {
  purchaseNFT: Joi.object({
    wineId: Joi.string().uuid().required(),
    collectionId: Joi.string().uuid().required(),
    buyerAddress: Joi.string().min(26).max(100).required(),
    paymentMethod: Joi.string().valid('crypto', 'fiat').required(),
    currency: Joi.string().min(3).max(10).required(),
    amount: Joi.number().positive().required()
  }),

  mintNFT: Joi.object({
    wineId: Joi.string().uuid().required(),
    collectionId: Joi.string().uuid().required(),
    recipientAddress: Joi.string().min(26).max(100).required(),
    metadata: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().uri().required(),
      attributes: Joi.array().items(
        Joi.object({
          traitType: Joi.string().required(),
          value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
          displayType: Joi.string().valid('boost_number', 'boost_percentage', 'number', 'date').optional()
        })
      ).required(),
      externalUrl: Joi.string().uri().optional()
    }).required(),
    digitalCertificate: Joi.object({
      wineDetails: Joi.object({
        bottleNumber: Joi.string().optional(),
        totalBottles: Joi.number().positive().optional()
      }).optional(),
      authenticity: Joi.object({
        verifiedBy: Joi.string().optional()
      }).optional(),
      storage: Joi.object({
        facility: Joi.string().optional(),
        conditions: Joi.string().optional(),
        insuranceValue: Joi.number().positive().optional()
      }).optional()
    }).optional()
  }),

  verifyOwnership: Joi.object({
    tokenId: Joi.string().required(),
    ownerAddress: Joi.string().min(26).max(100).required()
  }),

  getWineNFTs: Joi.object({
    collectionId: Joi.string().uuid().optional()
  }),

  transactionId: Joi.object({
    transactionId: Joi.string().uuid().required()
  })
};