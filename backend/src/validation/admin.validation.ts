import Joi from 'joi'

export const adminLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
  mfaCode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'MFA code must be 6 digits'
    })
})

export const mfaVerifySchema = Joi.object({
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'MFA code must be 6 digits',
      'any.required': 'MFA code is required'
    }),
  sessionId: Joi.string()
    .required()
    .messages({
      'any.required': 'Session ID is required'
    })
})

export const mfaSetupSchema = Joi.object({
  secret: Joi.string()
    .required()
    .messages({
      'any.required': 'MFA secret is required'
    }),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'MFA code must be 6 digits',
      'any.required': 'MFA code is required'
    })
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
})