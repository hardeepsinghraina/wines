import Joi from 'joi';

const supportedCryptoCurrencies = ['BTC', 'ETH', 'USDT_TRC20'];
const supportedFiatCurrencies = ['EUR', 'USD'];

export const paymentValidation = {
  calculateCryptoAmount: {
    body: Joi.object({
      amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
      cryptoCurrency: Joi.string().valid(...supportedCryptoCurrencies).required().messages({
        'any.only': `Crypto currency must be one of: ${supportedCryptoCurrencies.join(', ')}`,
        'any.required': 'Crypto currency is required'
      })
    })
  },

  initiateCryptoPayment: {
    body: Joi.object({
      orderId: Joi.string().uuid().required().messages({
        'string.guid': 'Order ID must be a valid UUID',
        'any.required': 'Order ID is required'
      }),
      amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
      currency: Joi.string().valid(...supportedFiatCurrencies).required().messages({
        'any.only': `Currency must be one of: ${supportedFiatCurrencies.join(', ')}`,
        'any.required': 'Currency is required'
      }),
      cryptoCurrency: Joi.string().valid(...supportedCryptoCurrencies).required().messages({
        'any.only': `Crypto currency must be one of: ${supportedCryptoCurrencies.join(', ')}`,
        'any.required': 'Crypto currency is required'
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
      customerEmail: Joi.string().email().optional().messages({
        'string.email': 'Customer email must be a valid email address'
      })
    })
  },



  updatePaymentStatus: {
    body: Joi.object({
      status: Joi.string().valid('pending', 'confirming', 'completed', 'failed', 'expired', 'cancelled', 'refunded').required().messages({
        'any.only': 'Status must be one of: pending, confirming, completed, failed, expired, cancelled, refunded',
        'any.required': 'Status is required'
      }),
      transactionHash: Joi.string().optional().messages({
        'string.base': 'Transaction hash must be a string'
      })
    })
  },

  getWalletAddress: {
    params: Joi.object({
      currency: Joi.string().valid(...supportedCryptoCurrencies).required().messages({
        'any.only': `Currency must be one of: ${supportedCryptoCurrencies.join(', ')}`,
        'any.required': 'Currency is required'
      })
    })
  }
};