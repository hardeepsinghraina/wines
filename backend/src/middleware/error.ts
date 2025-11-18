import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { ApiResponseHelper } from '@/utils/api-response'
import { securityMonitor, SecurityEventType } from '@/utils/security-monitor'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Enhanced global error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const requestId = req.requestId || 'unknown'
  
  // Log the error with context
  logger.error('Unhandled error:', {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    requestId,
    body: sanitizeRequestBody(req.body),
    query: req.query,
    params: req.params
  })

  // Log security events for certain error types
  if (isSecurityRelatedError(error)) {
    securityMonitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_REQUEST,
      severity: 'MEDIUM',
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      endpoint: req.url,
      method: req.method,
      payload: { 
        errorType: error.name,
        errorMessage: error.message,
        requestId
      },
      timestamp: new Date().toISOString(),
      requestId
    }).catch(logError => {
      logger.error('Failed to log security event', { logError })
    })
  }

  // Handle specific error types with enhanced responses
  const errorInfo = ApiResponseHelper.fromError(error)
  
  // Handle Prisma-specific errors
  if (error.code?.startsWith('P')) {
    return handlePrismaError(error, res, requestId)
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error.isJoi) {
    return ApiResponseHelper.validationError(
      res,
      error.details || [{ message: error.message }],
      'Validation failed',
      requestId
    )
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ApiResponseHelper.unauthorized(res, 'Invalid token', requestId)
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponseHelper.unauthorized(res, 'Token expired', requestId)
  }

  // Handle rate limiting errors
  if (error.name === 'TooManyRequestsError') {
    return ApiResponseHelper.rateLimitExceeded(
      res,
      error.message,
      error.retryAfter,
      requestId
    )
  }

  // Handle database connection errors
  if (isDatabaseError(error)) {
    logger.error('Database error detected', { error: error.message, requestId })
    return ApiResponseHelper.serviceUnavailable(
      res,
      'Database service temporarily unavailable',
      30, // retry after 30 seconds
      requestId
    )
  }

  // Handle file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return ApiResponseHelper.badRequest(
      res,
      'File size too large',
      { maxSize: error.limit, receivedSize: error.received },
      requestId
    )
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiResponseHelper.badRequest(
      res,
      'Unexpected file field',
      { field: error.field },
      requestId
    )
  }

  // Use the standardized error response
  return ApiResponseHelper.customError(
    res,
    errorInfo.statusCode,
    errorInfo.code,
    errorInfo.message,
    errorInfo.details,
    requestId
  )
}

/**
 * Enhanced 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  const requestId = req.requestId || 'unknown'
  
  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId
  })

  // Log potential scanning attempts
  if (isSuspiciousPath(req.url)) {
    securityMonitor.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_REQUEST,
      severity: 'LOW',
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method,
      payload: { reason: 'Suspicious path access attempt' },
      timestamp: new Date().toISOString(),
      requestId
    }).catch(error => {
      logger.error('Failed to log security event', { error })
    })
  }

  return ApiResponseHelper.notFound(
    res,
    `Route ${req.method} ${req.url} not found`,
    requestId
  )
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: any, res: Response, requestId: string): Response {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return ApiResponseHelper.conflict(
        res,
        'Resource already exists',
        { 
          constraint: error.meta?.target,
          field: error.meta?.target?.[0]
        },
        requestId
      )
    
    case 'P2025': // Record not found
      return ApiResponseHelper.notFound(
        res,
        'Resource not found',
        requestId
      )
    
    case 'P2003': // Foreign key constraint violation
      return ApiResponseHelper.badRequest(
        res,
        'Invalid reference to related resource',
        { field: error.meta?.field_name },
        requestId
      )
    
    case 'P2014': // Required relation missing
      return ApiResponseHelper.badRequest(
        res,
        'Required related resource is missing',
        { relation: error.meta?.relation_name },
        requestId
      )
    
    case 'P2021': // Table does not exist
      return ApiResponseHelper.serviceUnavailable(
        res,
        'Database schema error - please contact support',
        undefined,
        requestId
      )
    
    case 'P2024': // Connection timeout
      return ApiResponseHelper.serviceUnavailable(
        res,
        'Database connection timeout',
        30,
        requestId
      )
    
    default:
      logger.error('Unhandled Prisma error', { 
        code: error.code, 
        message: error.message,
        requestId 
      })
      return ApiResponseHelper.internalServerError(
        res,
        'Database operation failed',
        error,
        requestId
      )
  }
}

/**
 * Check if error is database-related
 */
function isDatabaseError(error: any): boolean {
  const dbErrorIndicators = [
    'connection terminated',
    'connection refused',
    'connection timeout',
    'database is locked',
    'server closed the connection',
    'connection lost'
  ]
  
  const errorMessage = error.message?.toLowerCase() || ''
  return dbErrorIndicators.some(indicator => errorMessage.includes(indicator))
}

/**
 * Check if error is security-related
 */
function isSecurityRelatedError(error: any): boolean {
  const securityErrors = [
    'JsonWebTokenError',
    'TokenExpiredError',
    'UnauthorizedError',
    'ForbiddenError',
    'ValidationError'
  ]
  
  return securityErrors.includes(error.name) || 
         error.message?.includes('unauthorized') ||
         error.message?.includes('forbidden') ||
         error.message?.includes('invalid token')
}

/**
 * Check if path looks suspicious (potential scanning)
 */
function isSuspiciousPath(path: string): boolean {
  const suspiciousPaths = [
    '/admin',
    '/wp-admin',
    '/phpmyadmin',
    '/.env',
    '/config',
    '/backup',
    '/test',
    '/debug',
    '/.git',
    '/api/v1/admin',
    '/api/admin',
    '/management',
    '/console'
  ]
  
  return suspiciousPaths.some(suspicious => 
    path.toLowerCase().includes(suspicious.toLowerCase())
  )
}

/**
 * Get client IP address
 */
function getClientIP(req: Request): string {
  const ip = (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  )
  const ipString = String(ip || 'unknown')
  return ipString.split(',')[0]?.trim() || 'unknown'
}

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'privateKey',
    'cardNumber', 'cvv', 'ssn', 'socialSecurityNumber',
    'bankAccount', 'routingNumber'
  ]

  const sanitized = { ...body }

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}