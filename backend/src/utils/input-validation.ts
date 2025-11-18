import validator from 'validator'
import { logger } from '@/utils/logger'

export interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'email' | 'url' | 'uuid' | 'date' | 'boolean' | 'array' | 'object'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  allowedValues?: any[]
  customValidator?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  sanitizedData?: any
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Comprehensive input validation utility for security and data integrity
 */
export class InputValidator {
  private static instance: InputValidator

  private constructor() {}

  public static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator()
    }
    return InputValidator.instance
  }

  /**
   * Validate data against a set of rules
   */
  public validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: ValidationError[] = []
    const sanitizedData: any = {}

    try {
      for (const rule of rules) {
        const value = data[rule.field]
        const fieldErrors = this.validateField(value, rule)
        
        if (fieldErrors.length > 0) {
          errors.push(...fieldErrors)
        } else {
          // Sanitize and store valid data
          sanitizedData[rule.field] = this.sanitizeValue(value, rule.type)
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined
      }

    } catch (error) {
      logger.error('Validation error:', { error, data, rules })
      return {
        isValid: false,
        errors: [{
          field: 'general',
          message: 'Validation failed due to internal error',
          code: 'VALIDATION_ERROR'
        }]
      }
    }
  }

  /**
   * Validate a single field against its rule
   */
  private validateField(value: any, rule: ValidationRule): ValidationError[] {
    const errors: ValidationError[] = []
    const { field, type, required } = rule

    // Check if field is required
    if (required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD'
      })
      return errors
    }

    // Skip validation if field is not required and empty
    if (!required && (value === undefined || value === null || value === '')) {
      return errors
    }

    // Type validation
    const typeError = this.validateType(value, type, field)
    if (typeError) {
      errors.push(typeError)
      return errors // Don't continue if type is wrong
    }

    // Length validation for strings
    if (type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters long`,
          code: 'MIN_LENGTH'
        })
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must not exceed ${rule.maxLength} characters`,
          code: 'MAX_LENGTH'
        })
      }
    }

    // Numeric range validation
    if (type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`,
          code: 'MIN_VALUE'
        })
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field,
          message: `${field} must not exceed ${rule.max}`,
          code: 'MAX_VALUE'
        })
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push({
          field,
          message: `${field} format is invalid`,
          code: 'INVALID_FORMAT'
        })
      }
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${rule.allowedValues.join(', ')}`,
        code: 'INVALID_VALUE'
      })
    }

    // Custom validation
    if (rule.customValidator) {
      const customResult = rule.customValidator(value)
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === 'string' ? customResult : `${field} is invalid`,
          code: 'CUSTOM_VALIDATION'
        })
      }
    }

    return errors
  }

  /**
   * Validate data type
   */
  private validateType(value: any, type: string, field: string): ValidationError | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            field,
            message: `${field} must be a string`,
            code: 'INVALID_TYPE'
          }
        }
        break

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            field,
            message: `${field} must be a valid number`,
            code: 'INVALID_TYPE'
          }
        }
        break

      case 'email':
        if (typeof value !== 'string' || !validator.isEmail(value)) {
          return {
            field,
            message: `${field} must be a valid email address`,
            code: 'INVALID_EMAIL'
          }
        }
        break

      case 'url':
        if (typeof value !== 'string' || !validator.isURL(value)) {
          return {
            field,
            message: `${field} must be a valid URL`,
            code: 'INVALID_URL'
          }
        }
        break

      case 'uuid':
        if (typeof value !== 'string' || !validator.isUUID(value)) {
          return {
            field,
            message: `${field} must be a valid UUID`,
            code: 'INVALID_UUID'
          }
        }
        break

      case 'date':
        if (!(value instanceof Date) && !validator.isISO8601(String(value))) {
          return {
            field,
            message: `${field} must be a valid date`,
            code: 'INVALID_DATE'
          }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            field,
            message: `${field} must be a boolean`,
            code: 'INVALID_TYPE'
          }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          return {
            field,
            message: `${field} must be an array`,
            code: 'INVALID_TYPE'
          }
        }
        break

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return {
            field,
            message: `${field} must be an object`,
            code: 'INVALID_TYPE'
          }
        }
        break
    }

    return null
  }

  /**
   * Sanitize value based on type
   */
  private sanitizeValue(value: any, type: string): any {
    switch (type) {
      case 'string':
        return validator.escape(String(value)).trim()
      
      case 'email':
        return validator.normalizeEmail(String(value)) || String(value).toLowerCase().trim()
      
      case 'url':
        return String(value).trim()
      
      case 'number':
        return Number(value)
      
      case 'boolean':
        return Boolean(value)
      
      case 'date':
        return value instanceof Date ? value : new Date(value)
      
      default:
        return value
    }
  }

  /**
   * Validate financial transaction data with enhanced security
   */
  public validateFinancialData(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'amount',
        type: 'number',
        required: true,
        min: 0.01,
        max: 1000000,
        customValidator: (value) => {
          // Ensure amount has at most 2 decimal places for fiat currencies
          const decimalPlaces = (value.toString().split('.')[1] || '').length
          return decimalPlaces <= 8 || 'Amount cannot have more than 8 decimal places'
        }
      },
      {
        field: 'currency',
        type: 'string',
        required: true,
        allowedValues: ['USD', 'EUR', 'BTC', 'ETH', 'SOL', 'DOGE', 'LTC', 'USDC', 'USDT'],
        customValidator: (value) => {
          return /^[A-Z]{3,4}$/.test(value) || 'Currency must be a valid 3-4 letter code'
        }
      },
      {
        field: 'transactionId',
        type: 'string',
        required: false,
        minLength: 10,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9_-]+$/
      }
    ]

    return this.validate(data, rules)
  }

  /**
   * Validate user authentication data
   */
  public validateAuthData(data: any, isRegistration: boolean = false): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'email',
        type: 'email',
        required: true,
        maxLength: 255
      },
      {
        field: 'password',
        type: 'string',
        required: true,
        minLength: 8,
        maxLength: 128,
        customValidator: (value) => {
          // Strong password requirements
          const hasUpperCase = /[A-Z]/.test(value)
          const hasLowerCase = /[a-z]/.test(value)
          const hasNumbers = /\d/.test(value)
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
          
          if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return 'Password must contain uppercase, lowercase, number, and special character'
          }
          return true
        }
      }
    ]

    if (isRegistration) {
      rules.push(
        {
          field: 'firstName',
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50,
          pattern: /^[a-zA-Z\s'-]+$/
        },
        {
          field: 'lastName',
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 50,
          pattern: /^[a-zA-Z\s'-]+$/
        }
      )
    }

    return this.validate(data, rules)
  }

  /**
   * Validate product data
   */
  public validateProductData(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'name',
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 200
      },
      {
        field: 'price',
        type: 'number',
        required: true,
        min: 0.01,
        max: 100000
      },
      {
        field: 'category',
        type: 'string',
        required: true,
        allowedValues: ['bordeaux', 'burgundy', 'champagne', 'rhone', 'world-wines', 'specialty']
      },
      {
        field: 'vintage',
        type: 'number',
        required: false,
        min: 1800,
        max: new Date().getFullYear()
      },
      {
        field: 'alcoholContent',
        type: 'number',
        required: false,
        min: 0,
        max: 50
      }
    ]

    return this.validate(data, rules)
  }
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance()