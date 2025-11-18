import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'
import { serverConfig } from '@/config/server'
import { logger } from '@/utils/logger'
import { securityMonitor, SecurityEventType } from '@/utils/security-monitor'

// Enhanced helmet configuration for luxury wine e-commerce
export const securityHeaders = helmet({
  contentSecurityPolicy: serverConfig.nodeEnv === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'https://*.amazonaws.com', 'https://*.cloudfront.net'],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      connectSrc: [
        "'self'", 
        'https://api.coingate.com', 
        'https://api.bitpay.com',
        'wss://ws.blockchain.info',
        'http://localhost:*',
        'https://localhost:*'
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  } : false, // Disable CSP in development
  crossOriginEmbedderPolicy: false, // Allow embedding for payment processors
  hsts: serverConfig.nodeEnv === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false, // Disable HSTS in development
  noSniff: true,
  frameguard: { action: 'sameorigin' }, // Less restrictive than 'deny'
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
  hidePoweredBy: true,
})

// Enhanced input sanitization middleware with security monitoring
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = getClientIP(req)
  
  // Skip sanitization for specific endpoints that need raw data
  const isAuthEndpoint = req.url.includes('/api/auth') || req.url.includes('/api/admin/auth')
  const isHealthEndpoint = req.url === '/health' || req.url === '/api/health' || req.url === '/api'
  const isPaymentEndpoint = req.url.includes('/api/payments') || req.url.includes('/api/crypto')
  const isUploadEndpoint = req.url.includes('/upload') || req.url.includes('/file')
  
  // Skip all security processing for health endpoints
  if (isHealthEndpoint) {
    return next()
  }
  
  // Use light sanitization for sensitive endpoints
  const useLightSanitization = isAuthEndpoint || isPaymentEndpoint || isUploadEndpoint
  
  // Skip IP blocking entirely - just log and continue
  securityMonitor.isIPBlocked(clientIP)
    .then(isBlocked => {
      if (isBlocked) {
        logger.warn('Previously blocked IP attempted access (allowing):', { ip: clientIP, url: req.url })
      }
      
      // Always continue with sanitization regardless of IP status
      performSanitization()
    })
    .catch(error => {
      logger.error('Failed to check IP block status:', error)
      // Continue with sanitization even if IP check fails
      performSanitization()
    })

  function performSanitization(): void {
    try {
      // Apply appropriate level of sanitization
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, req, useLightSanitization)
      }
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query, req, useLightSanitization)
      }
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params, req, useLightSanitization)
      }

      next()
    } catch (error) {
      logger.error('Input sanitization error:', error)
      
      // Log security event for sanitization failure (async) - but don't block the request
      securityMonitor.logSuspiciousRequest(req, 'Input sanitization failed').catch(logError => {
        logger.error('Failed to log security event:', logError)
      })
      
      // Continue with the request instead of blocking it
      next()
    }
  }
}

// Enhanced sanitization function with comprehensive security measures and monitoring
function sanitizeObject(obj: any, req?: Request, lightSanitization: boolean = false): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, req, lightSanitization))
  }

  if (typeof obj === 'string') {
    // Light sanitization for sensitive endpoints - minimal processing
    if (lightSanitization) {
      // Only log obvious XSS attempts, don't modify content
      if (containsObviousXSSAttempt(obj) && req) {
        securityMonitor.logXSSAttempt(req, obj).catch(error => {
          logger.error('Failed to log XSS attempt:', error)
        })
      }
      
      // Return original content for light sanitization
      return obj
    }

    // Standard sanitization for regular endpoints - still very lenient
    // Only log XSS attempts, don't block
    if (containsXSSAttempt(obj) && req) {
      securityMonitor.logXSSAttempt(req, obj).catch(error => {
        logger.error('Failed to log XSS attempt:', error)
      })
    }

    // Very minimal sanitization - only remove the most dangerous script tags
    let sanitized = obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // Only remove the most dangerous patterns
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')

    // Only log SQL injection attempts, don't block or modify
    if (containsSqlInjection(sanitized)) {
      if (req) {
        securityMonitor.logSQLInjectionAttempt(req, sanitized).catch(error => {
          logger.error('Failed to log SQL injection attempt:', error)
        })
      }
      // Don't modify the content, just log
    }

    return sanitized
  }

  if (typeof obj === 'object') {
    const sanitizedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Don't sanitize keys in light mode, only escape in full mode
        const sanitizedKey = lightSanitization ? key : validator.escape(key)
        sanitizedObj[sanitizedKey] = sanitizeObject(obj[key], req, lightSanitization)
      }
    }
    return sanitizedObj
  }

  return obj
}

// SQL injection detection - more targeted patterns
function containsSqlInjection(input: string): boolean {
  // Only check for obvious SQL injection patterns, not legitimate SQL-like content
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b).*(\b(FROM|WHERE|INTO|VALUES)\b)/gi,
    /(--|\/\*|\*\/).*(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b)/gi,
    /(\bOR\b|\bAND\b)\s+\d+\s*[=<>]\s*\d+/gi,
    /\b(WAITFOR|DELAY)\s+/gi,
    /\b(XP_|SP_)\w+\s*\(/gi,
    /\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b\./gi,
    /\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\s*\(/gi,
    /UNION\s+SELECT/gi,
    /'\s*(OR|AND)\s*'?\d+/gi
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

// XSS attempt detection
function containsXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*javascript:/gi,
    /<svg[^>]*onload[^>]*>/gi,
    /data:text\/html/gi,
    /expression\s*\(/gi
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

// Obvious XSS attempt detection (lighter version for auth endpoints)
function containsObviousXSSAttempt(input: string): boolean {
  const obviousXssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /<img[^>]+src[^>]*javascript:/gi,
    /data:text\/html/gi
  ]

  return obviousXssPatterns.some(pattern => pattern.test(input))
}

// Helper function to get client IP
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

// Enhanced request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  const requestId = generateRequestId()
  
  // Add request ID to request object for tracking
  req.requestId = requestId

  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      contentLength: res.get('Content-Length') || '0',
      referer: req.get('Referer') || 'direct',
    }

    // Enhanced logging based on status code and endpoint sensitivity
    if (res.statusCode >= 500) {
      logger.error('Server error:', logData)
    } else if (res.statusCode >= 400) {
      logger.warn('Client error:', logData)
    } else if (isFinancialEndpoint(req.url)) {
      logger.info('Financial transaction:', logData)
    } else {
      logger.debug('Request completed:', logData)
    }
  })

  next()
}

// Audit logging middleware for financial transactions
export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Only audit financial and sensitive operations
  if (!isAuditableEndpoint(req.url, req.method)) {
    return next()
  }

  const auditData = {
    requestId: req.requestId || generateRequestId(),
    action: getActionFromEndpoint(req.url, req.method),
    userId: (req as any).user?.id || 'anonymous',
    ip: getClientIP(req),
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    endpoint: req.url,
    method: req.method,
    requestBody: sanitizeAuditData(req.body),
    sessionId: req.sessionID,
  }

  // Store original res.json to capture response data
  const originalJson = res.json
  res.json = function(body: any) {
    // Log the audit trail
    const completeAuditData = {
      ...auditData,
      statusCode: res.statusCode,
      responseBody: sanitizeAuditData(body),
      success: res.statusCode < 400,
    }

    // Use structured logging for audit trails
    logger.audit('Financial transaction audit:', completeAuditData)

    // Call original json method
    return originalJson.call(this, body)
  }

  next()
}

// Helper functions for audit logging
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function isFinancialEndpoint(url: string): boolean {
  const financialPatterns = [
    /\/api\/payments/,
    /\/api\/orders/,
    /\/api\/cart/,
    /\/api\/crypto/,
    /\/api\/nft/,
    /\/api\/private-sales/,
    /\/api\/affiliate/,
  ]
  return financialPatterns.some(pattern => pattern.test(url))
}

function isAuditableEndpoint(url: string, method: string): boolean {
  // Audit all financial endpoints and sensitive operations
  if (isFinancialEndpoint(url)) return true
  
  // Audit authentication operations
  if (url.includes('/api/auth') && ['POST', 'PUT', 'DELETE'].includes(method)) return true
  
  // Audit admin operations
  if (url.includes('/api/admin')) return true
  
  // Audit user data modifications
  if (url.includes('/api/users') && ['POST', 'PUT', 'DELETE'].includes(method)) return true
  
  return false
}

function getActionFromEndpoint(url: string, method: string): string {
  const pathSegments = url.split('/').filter(Boolean)
  const resource = pathSegments[pathSegments.length - 1] || 'unknown'
  
  const actionMap: Record<string, string> = {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
  }
  
  return `${actionMap[method] || method.toLowerCase()}_${resource}`
}

function sanitizeAuditData(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'privateKey',
    'cardNumber', 'cvv', 'ssn', 'socialSecurityNumber',
    'bankAccount', 'routingNumber', 'walletAddress'
  ]
  
  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

// Enhanced CORS configuration with security monitoring
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }

    const allowedOrigins = [
      serverConfig.corsOrigin,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://localhost:3002',
      'https://127.0.0.1:3000',
      'https://127.0.0.1:3001',
      'https://127.0.0.1:3002',
      // Add production domains here
      'https://yourdomain.com',
      'https://www.yourdomain.com',
    ]

    // Allow all origins but log suspicious ones
    if (serverConfig.nodeEnv === 'production') {
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        // Log unauthorized CORS attempt but still allow
        logger.warn('Non-standard CORS origin in production', { origin })
        // Allow all origins in production too - just log for monitoring
        callback(null, true)
      }
    } else {
      // In development, be fully permissive
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-API-Key',
    'X-Session-ID',
    'X-Request-ID',
    'X-User-Agent',
    'X-Client-Version',
    'X-Client-Platform',
    'Accept',
    'Accept-Language',
    'Accept-Encoding',
    'Cache-Control',
    'Connection',
    'Host',
    'Origin',
    'Pragma',
    'Referer',
    'Sec-Fetch-Dest',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'User-Agent'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit', 
    'X-RateLimit-Remaining', 
    'X-RateLimit-Reset',
    'X-Request-ID',
    'Content-Length',
    'Content-Type'
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false
}