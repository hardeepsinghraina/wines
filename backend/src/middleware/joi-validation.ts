import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ResponseHelper } from '../utils/response'

export interface ValidationSchema {
  body?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
}

export const validateRequest = (schema: Joi.ObjectSchema | ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: string[] = []

    // Handle single schema (for body validation)
    if (Joi.isSchema(schema)) {
      const { error } = schema.validate(req.body)
      if (error) {
        validationErrors.push(error.details.map(d => d.message).join(', '))
      }
    } else {
      // Handle validation schema object
      const validationSchema = schema as ValidationSchema

      // Validate body
      if (validationSchema.body) {
        const { error } = validationSchema.body.validate(req.body)
        if (error) {
          validationErrors.push(`Body: ${error.details.map(d => d.message).join(', ')}`)
        }
      }

      // Validate query
      if (validationSchema.query) {
        const { error } = validationSchema.query.validate(req.query)
        if (error) {
          validationErrors.push(`Query: ${error.details.map(d => d.message).join(', ')}`)
        }
      }

      // Validate params
      if (validationSchema.params) {
        const { error } = validationSchema.params.validate(req.params)
        if (error) {
          validationErrors.push(`Params: ${error.details.map(d => d.message).join(', ')}`)
        }
      }
    }

    if (validationErrors.length > 0) {
      ResponseHelper.validationError(res, validationErrors.join('; '))
      return
    }

    next()
  }
}

// Convenience function for query validation
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validateRequest({ query: schema })
}

// Convenience function for params validation
export const validateParams = (schema: Joi.ObjectSchema) => {
  return validateRequest({ params: schema })
}

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}