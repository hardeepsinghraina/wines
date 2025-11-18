import { Request, Response, NextFunction } from 'express'
import { inputValidator } from '@/utils/input-validation'
import { passwordSecurityService } from '@/services/password-security.service'
import { securityMonitor, SecurityEventType } from '@/utils/security-monitor'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'

/**
 * Enhanced input validation middleware with security monitoring
 */
export const validateInput = (validationRules: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = inputValidator.validate(req.body, validationRules)
      
      if (!result.isValid) {
        // Log validation failure for security monitoring
        await securityMonitor.logSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_REQUEST,
          severity: 'MEDIUM',
          ip: getClientIP(req),
          userAgent: req.get('User-Agent'),
          userId: (req as any).user?.id,
          endpoint: req.url,
          method: req.method,
          payload: { 
            validationErrors: result.errors,
            sanitizedInput: sanitizeForLogging(req.body)
          },
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        })

        return ResponseHelper.badRequest(res, 'Validation failed', result.errors)
      }

      // Replace request body with sanitized data
      req.body = result.sanitizedData
      next()
    } catch (error) {
      logger.error('Input validation middleware error', { error, url: req.url })
      return ResponseHelper.internalServerError(res, 'Validation service unavailable')
    }
  }
}

/**
 * Password strength validation middleware
 */
export const validatePasswordStrength = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { password, newPassword } = req.body
    const passwordToValidate = newPassword || password

    if (!passwordToValidate) {
      return next() // Skip if no password in request
    }

    const strengthResult = passwordSecurityService.validatePassword(passwordToValidate)
    
    if (!strengthResult.isValid) {
      // Log weak password attempt
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_REQUEST,
        severity: 'LOW',
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        endpoint: req.url,
        method: req.method,
        payload: { 
          reason: 'Weak password attempt',
          score: strengthResult.score,
          feedback: strengthResult.feedback
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })

      return ResponseHelper.badRequest(res, 'Password does not meet security requirements', {
        score: strengthResult.score,
        feedback: strengthResult.feedback,
        estimatedCrackTime: strengthResult.estimatedCrackTime
      })
    }

    // Check password reuse for authenticated users
    if ((req as any).user?.id && (req.url.includes('/change-password') || req.url.includes('/reset-password'))) {
      const isReused = await passwordSecurityService.checkPasswordReuse((req as any).user.id, passwordToValidate)
      
      if (isReused) {
        return ResponseHelper.badRequest(res, 'Password was used recently, please choose a different password')
      }
    }

    next()
  } catch (error) {
    logger.error('Password validation middleware error', { error, url: req.url })
    return ResponseHelper.internalServerError(res, 'Password validation service unavailable')
  }
}

/**
 * Financial transaction validation middleware
 */
export const validateFinancialTransaction = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const result = inputValidator.validateFinancialData(req.body)
    
    if (!result.isValid) {
      // Log suspicious financial transaction attempt
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_REQUEST,
        severity: 'HIGH',
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        endpoint: req.url,
        method: req.method,
        payload: { 
          reason: 'Invalid financial transaction data',
          validationErrors: result.errors,
          sanitizedInput: sanitizeForLogging(req.body)
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })

      return ResponseHelper.badRequest(res, 'Invalid transaction data', result.errors)
    }

    // Additional financial validation
    const { amount, currency } = req.body
    
    // Check for suspicious amounts
    if (amount > 100000) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_REQUEST,
        severity: 'HIGH',
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        endpoint: req.url,
        method: req.method,
        payload: { 
          reason: 'Large transaction amount',
          amount,
          currency
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })
    }

    req.body = result.sanitizedData
    next()
  } catch (error) {
    logger.error('Financial validation middleware error', { error, url: req.url })
    return ResponseHelper.internalServerError(res, 'Financial validation service unavailable')
  }
}

/**
 * Authentication data validation middleware
 */
export const validateAuthData = (isRegistration: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = inputValidator.validateAuthData(req.body, isRegistration)
      
      if (!result.isValid) {
        // Log authentication validation failure
        await securityMonitor.logSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_REQUEST,
          severity: 'MEDIUM',
          ip: getClientIP(req),
          userAgent: req.get('User-Agent'),
          endpoint: req.url,
          method: req.method,
          payload: { 
            reason: 'Authentication data validation failed',
            validationErrors: result.errors,
            email: req.body.email // Safe to log email for auth attempts
          },
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        })

        return ResponseHelper.badRequest(res, 'Invalid authentication data', result.errors)
      }

      req.body = result.sanitizedData
      next()
    } catch (error) {
      logger.error('Auth validation middleware error', { error, url: req.url })
      return ResponseHelper.internalServerError(res, 'Authentication validation service unavailable')
    }
  }
}

/**
 * Request size validation middleware
 */
export const validateRequestSize = (maxSizeBytes: number = 10 * 1024 * 1024) => { // 10MB default
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const contentLength = parseInt(req.get('Content-Length') || '0')
    
    if (contentLength > maxSizeBytes) {
      securityMonitor.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_REQUEST,
        severity: 'MEDIUM',
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        endpoint: req.url,
        method: req.method,
        payload: { 
          reason: 'Request size too large',
          contentLength,
          maxAllowed: maxSizeBytes
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      }).catch(error => {
        logger.error('Failed to log security event', { error })
      })

      return ResponseHelper.badRequest(res, 'Request size too large')
    }

    next()
  }
}

/**
 * Suspicious activity detection middleware
 */
export const detectSuspiciousActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = getClientIP(req)
    const userAgent = req.get('User-Agent') || ''
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      // Bot detection
      /bot|crawler|spider|scraper/i.test(userAgent),
      // Automated tools
      /curl|wget|python|java|go-http/i.test(userAgent),
      // Missing or suspicious user agent
      !userAgent || userAgent.length < 10,
      // Suspicious endpoints
      req.url.includes('admin') && !req.url.startsWith('/api/admin'),
      // Rapid requests (this would need more sophisticated tracking)
    ]

    const suspiciousScore = suspiciousPatterns.filter(Boolean).length

    if (suspiciousScore >= 2) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_REQUEST,
        severity: 'MEDIUM',
        ip,
        userAgent,
        userId: (req as any).user?.id,
        endpoint: req.url,
        method: req.method,
        payload: { 
          reason: 'Suspicious activity detected',
          suspiciousScore,
          patterns: suspiciousPatterns.map((pattern, index) => ({ index, detected: pattern }))
        },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })
    }

    next()
  } catch (error) {
    logger.error('Suspicious activity detection error', { error })
    next() // Continue even if detection fails
  }
}

// Helper functions
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

function sanitizeForLogging(data: any): any {
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