import Joi from 'joi'

export const gdprValidation = {
  deletionRequest: Joi.object({
    reason: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Reason cannot exceed 500 characters'
      })
  }),

  consentUpdate: Joi.object({
    consentType: Joi.string()
      .valid('marketing', 'analytics', 'functional', 'necessary')
      .required()
      .messages({
        'any.required': 'Consent type is required',
        'any.only': 'Consent type must be one of: marketing, analytics, functional, necessary'
      }),
    
    granted: Joi.boolean()
      .required()
      .messages({
        'any.required': 'Consent status (granted) is required',
        'boolean.base': 'Consent status must be true or false'
      })
  }),

  dataExport: Joi.object({
    format: Joi.string()
      .valid('json', 'csv')
      .optional()
      .default('json')
      .messages({
        'any.only': 'Format must be either json or csv'
      })
  })
}