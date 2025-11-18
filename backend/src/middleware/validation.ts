import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { CustomError } from './error'

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }))

    const errorMessage = `Validation failed: ${formattedErrors.map(e => e.message).join(', ')}`
    
    throw new CustomError(errorMessage, 422)
  }

  next()
}

// Validation chain runner
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)))

    // Check for validation errors
    handleValidationErrors(req, res, next)
  }
}

// Common validation patterns
export const commonValidations = {
  email: {
    isEmail: {
      errorMessage: 'Please provide a valid email address',
    },
    normalizeEmail: true,
  },
  
  password: {
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: 'Password must be between 8 and 128 characters',
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  },

  name: {
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Name must be between 2 and 50 characters',
    },
    matches: {
      options: /^[a-zA-Z\s'-]+$/,
      errorMessage: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },

  price: {
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Price must be a positive number',
    },
  },

  quantity: {
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Quantity must be between 1 and 100',
    },
  },

  uuid: {
    isUUID: {
      errorMessage: 'Invalid ID format',
    },
  },
}