import { Response } from 'express'
import { logger } from '@/utils/logger'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId?: string
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
      hasNext: boolean
      hasPrev: boolean
    }
    filters?: any
    sort?: {
      field: string
      order: 'asc' | 'desc'
    }
    timestamp: string
    version: string
  }
}

export interface PaginationParams {
  page: number
  limit: number
  total: number
}

export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

export class ApiResponseHelper {
  private static readonly API_VERSION = '1.0.0'
  private static readonly DEFAULT_PAGE_SIZE = 20
  private static readonly MAX_PAGE_SIZE = 100

  /**
   * Send successful response
   */
  static success<T>(
    res: Response, 
    data: T, 
    message?: string,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION,
        ...meta
      }
    }

    return res.status(200).json(response)
  }

  /**
   * Send successful response with pagination
   */
  static successWithPagination<T>(
    res: Response,
    data: T[],
    pagination: PaginationParams,
    message?: string,
    filters?: any,
    sort?: SortParams
  ): Response {
    const { page, limit, total } = pagination
    const pages = Math.ceil(total / limit)

    const response: ApiResponse<T[]> = {
      success: true,
      data,
      ...(message && { message }),
      meta: {
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        },
        ...(filters && { filters }),
        ...(sort && { sort }),
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    return res.status(200).json(response)
  }

  /**
   * Send created response
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'Resource created successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    return res.status(201).json(response)
  }

  /**
   * Send no content response
   */
  static noContent(res: Response, message?: string): Response {
    const response: ApiResponse = {
      success: true,
      message: message || 'Operation completed successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    return res.status(204).json(response)
  }

  /**
   * Send bad request error
   */
  static badRequest(
    res: Response, 
    message: string, 
    details?: any,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.warn('Bad request', { message, details, requestId })
    return res.status(400).json(response)
  }

  /**
   * Send unauthorized error
   */
  static unauthorized(res: Response, message?: string, requestId?: string): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: message || 'Authentication required',
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.warn('Unauthorized access attempt', { message, requestId })
    return res.status(401).json(response)
  }

  /**
   * Send forbidden error
   */
  static forbidden(res: Response, message?: string, requestId?: string): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: message || 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.warn('Forbidden access attempt', { message, requestId })
    return res.status(403).json(response)
  }

  /**
   * Send not found error
   */
  static notFound(res: Response, message?: string, requestId?: string): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: message || 'Resource not found',
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.info('Resource not found', { message, requestId })
    return res.status(404).json(response)
  }

  /**
   * Send conflict error
   */
  static conflict(res: Response, message: string, details?: any, requestId?: string): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.warn('Conflict error', { message, details, requestId })
    return res.status(409).json(response)
  }

  /**
   * Send validation error
   */
  static validationError(
    res: Response, 
    errors: any[], 
    message?: string,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: message || 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.warn('Validation error', { message, errors, requestId })
    return res.status(422).json(response)
  }

  /**
   * Send rate limit error
   */
  static rateLimitExceeded(
    res: Response, 
    message?: string,
    retryAfter?: number,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Rate limit exceeded',
        ...(retryAfter && { details: { retryAfter } }),
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    if (retryAfter) {
      res.set('Retry-After', retryAfter.toString())
    }

    logger.warn('Rate limit exceeded', { message, retryAfter, requestId })
    return res.status(429).json(response)
  }

  /**
   * Send internal server error
   */
  static internalServerError(
    res: Response, 
    message?: string,
    error?: Error,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: message || 'Internal server error',
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.error('Internal server error', { 
      message, 
      error: error?.message,
      stack: error?.stack,
      requestId 
    })
    return res.status(500).json(response)
  }

  /**
   * Send service unavailable error
   */
  static serviceUnavailable(
    res: Response, 
    message?: string,
    retryAfter?: number,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: message || 'Service temporarily unavailable',
        ...(retryAfter && { details: { retryAfter } }),
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    if (retryAfter) {
      res.set('Retry-After', retryAfter.toString())
    }

    logger.error('Service unavailable', { message, retryAfter, requestId })
    return res.status(503).json(response)
  }

  /**
   * Send custom error
   */
  static customError(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: any,
    requestId?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: this.API_VERSION
      }
    }

    logger.error('Custom error', { statusCode, code, message, details, requestId })
    return res.status(statusCode).json(response)
  }

  /**
   * Validate and normalize pagination parameters
   */
  static validatePagination(page?: string | number, limit?: string | number): {
    page: number
    limit: number
  } {
    const normalizedPage = Math.max(1, parseInt(String(page || 1)))
    const normalizedLimit = Math.min(
      this.MAX_PAGE_SIZE,
      Math.max(1, parseInt(String(limit || this.DEFAULT_PAGE_SIZE)))
    )

    return {
      page: normalizedPage,
      limit: normalizedLimit
    }
  }

  /**
   * Validate and normalize sort parameters
   */
  static validateSort(
    sortBy?: string,
    sortOrder?: string,
    allowedFields: string[] = []
  ): SortParams | null {
    if (!sortBy) return null

    const field = allowedFields.length > 0 && !allowedFields.includes(sortBy) 
      ? allowedFields[0] || sortBy
      : sortBy

    const order = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc'

    return { field, order }
  }

  /**
   * Create standardized error from exception
   */
  static fromError(error: any): {
    statusCode: number
    code: string
    message: string
    details?: any
  } {
    // Handle known error types
    if (error.name === 'ValidationError') {
      return {
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details || error.message
      }
    }

    if (error.name === 'UnauthorizedError' || error.message?.includes('unauthorized')) {
      return {
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: error.message || 'Authentication required'
      }
    }

    if (error.name === 'ForbiddenError' || error.message?.includes('forbidden')) {
      return {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: error.message || 'Insufficient permissions'
      }
    }

    if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: error.message || 'Resource not found'
      }
    }

    if (error.name === 'ConflictError' || error.message?.includes('conflict')) {
      return {
        statusCode: 409,
        code: 'CONFLICT',
        message: error.message || 'Resource conflict'
      }
    }

    // Default to internal server error
    return {
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message || 'Unknown error'
    }
  }
}