import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'
import { serverConfig } from '@/config/server'
import { redisService } from '@/services/redis.service'
import { logger } from '@/utils/logger'
import { securityMonitor, SecurityEventType } from '@/utils/security-monitor'

// Enhanced rate limiter with Redis store
const createRedisStore = () => ({
  incr: async (key: string) => {
    const current = await redisService.get(key)
    const count = current ? parseInt(current) + 1 : 1
    await redisService.setex(key, 900, count.toString()) // 15 minutes TTL
    return { totalHits: count, resetTime: new Date(Date.now() + 900000) }
  },
  decrement: async (key: string) => {
    const current = await redisService.get(key)
    if (current) {
      const count = Math.max(0, parseInt(current) - 1)
      if (count === 0) {
        await redisService.del(key)
      } else {
        await redisService.setex(key, 900, count.toString())
      }
    }
  },
  resetKey: async (key: string) => {
    await redisService.del(key)
  }
})

// General rate limiter with enhanced security monitoring
export const generalLimiter = rateLimit({
  windowMs: serverConfig.rateLimitWindowMs,
  max: serverConfig.nodeEnv === 'development' ? serverConfig.rateLimitMax * 5 : serverConfig.rateLimitMax * 2, // More lenient in both dev and prod
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks always
    const ip = getClientIP(req)
    return req.path === '/health' || 
           req.path === '/api/health' ||
           req.path === '/api' ||
           // Skip for local IPs in any environment
           ip === '127.0.0.1' || 
           ip === '::1' || 
           ip.startsWith('192.168.') ||
           ip.startsWith('10.') ||
           ip.startsWith('172.')
  },
  handler: async (req: Request, res: Response) => {
    const ip = getClientIP(req)
    
    // Log security events but don't make them blocking
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'LOW', // Reduced severity
      ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }).catch(error => {
      logger.error('Failed to log rate limit event:', error)
    })
    
    logger.warn('Rate limit exceeded', { ip, endpoint: req.url, method: req.method })
  }
})

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: serverConfig.nodeEnv === 'development' ? 50 : 20, // Much more lenient in both environments
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip auth rate limiting for local IPs in any environment
    const ip = getClientIP(req)
    return ip === '127.0.0.1' || 
           ip === '::1' || 
           ip.startsWith('192.168.') ||
           ip.startsWith('10.') ||
           ip.startsWith('172.')
  }
})

// Payment endpoint rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: serverConfig.nodeEnv === 'development' ? 50 : 10, // Much more lenient
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_PAYMENT_ATTEMPTS',
      message: 'Too many payment attempts, please wait before trying again.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for local IPs
    const ip = getClientIP(req)
    return ip === '127.0.0.1' || 
           ip === '::1' || 
           ip.startsWith('192.168.') ||
           ip.startsWith('10.') ||
           ip.startsWith('172.')
  }
})

// API endpoint rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: serverConfig.nodeEnv === 'development' ? 2000 : 1000, // Much more lenient
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'API rate limit exceeded, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for local IPs
    const ip = getClientIP(req)
    return ip === '127.0.0.1' || 
           ip === '::1' || 
           ip.startsWith('192.168.') ||
           ip.startsWith('10.') ||
           ip.startsWith('172.')
  }
})

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

// API Key authentication middleware for admin endpoints
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_REQUIRED',
          message: 'API key is required for this endpoint',
          timestamp: new Date().toISOString()
        }
      })
    }

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.INVALID_TOKEN,
        severity: 'MEDIUM',
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        endpoint: req.url,
        method: req.method,
        payload: { reason: 'Invalid API key format' },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key format',
          timestamp: new Date().toISOString()
        }
      })
    }

    // Check if API key exists and is active
    const keyData = await validateApiKey(apiKey)
    if (!keyData) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.UNAUTHORIZED_ACCESS,
        severity: 'HIGH',
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        endpoint: req.url,
        method: req.method,
        payload: { reason: 'Invalid API key' },
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      })

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or inactive API key',
          timestamp: new Date().toISOString()
        }
      })
    }

    // Attach API key info to request
    req.apiKey = keyData

    // Log API key usage
    await logApiKeyUsage(apiKey, req)

    next()
  } catch (error) {
    logger.error('API key authentication failed', { error })
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication service unavailable',
        timestamp: new Date().toISOString()
      }
    })
  }
}

// Validate API key format
function isValidApiKeyFormat(apiKey: string): boolean {
  // API keys should be 32-64 characters, alphanumeric with hyphens
  const apiKeyRegex = /^[a-zA-Z0-9-]{32,64}$/
  return apiKeyRegex.test(apiKey)
}

// Validate API key against stored keys
async function validateApiKey(apiKey: string): Promise<any | null> {
  try {
    const keyData = await redisService.get(`api_key:${apiKey}`)
    if (!keyData) return null

    const parsed = JSON.parse(keyData)
    
    // Check if key is active and not expired
    if (!parsed.isActive || (parsed.expiresAt && new Date(parsed.expiresAt) < new Date())) {
      return null
    }

    return parsed
  } catch (error) {
    logger.error('Failed to validate API key', { error })
    return null
  }
}

// Log API key usage for monitoring
async function logApiKeyUsage(apiKey: string, req: Request): Promise<void> {
  try {
    const usageKey = `api_key_usage:${apiKey}:${new Date().toISOString().split('T')[0]}`
    const current = await redisService.get(usageKey)
    const count = current ? parseInt(current) + 1 : 1
    
    await redisService.setex(usageKey, 24 * 60 * 60, count.toString()) // 24 hours TTL

    // Log detailed usage
    const usageLog = {
      apiKey: apiKey.substring(0, 8) + '...',
      endpoint: req.url,
      method: req.method,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }

    logger.info('API key usage', usageLog)
  } catch (error) {
    logger.error('Failed to log API key usage', { error })
  }
}

// Enhanced rate limiter for admin endpoints
export const adminRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: serverConfig.nodeEnv === 'development' ? 500 : 200, // Much more lenient
  message: {
    success: false,
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Admin API rate limit exceeded, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use API key or IP for rate limiting
    const apiKey = req.headers['x-api-key'] as string
    return apiKey ? `admin_api_${apiKey}` : `admin_ip_${getClientIP(req)}`
  },
  skip: (req) => {
    // Skip for local IPs
    const ip = getClientIP(req)
    return ip === '127.0.0.1' || 
           ip === '::1' || 
           ip.startsWith('192.168.') ||
           ip.startsWith('10.') ||
           ip.startsWith('172.')
  },
  handler: async (req: Request, res: Response) => {
    const ip = getClientIP(req)
    const apiKey = req.headers['x-api-key'] as string
    
    await securityMonitor.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'MEDIUM', // Reduced severity
      ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.url,
      method: req.method,
      payload: { apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'none' },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }).catch(error => {
      logger.error('Failed to log admin rate limit event:', error)
    })
    
    logger.warn('Admin rate limit exceeded', { ip, endpoint: req.url, apiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'none' })
  }
})