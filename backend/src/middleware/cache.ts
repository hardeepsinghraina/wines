import { Request, Response, NextFunction } from 'express'
import { cacheService } from '@/services/cache.service'
import { logger } from '@/utils/logger'
import compression from 'compression'

export interface CacheMiddlewareOptions {
  ttl?: number
  keyGenerator?: (req: Request) => string
  condition?: (req: Request, res: Response) => boolean
  prefix?: string
}

// Cache middleware for GET requests
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    condition = defaultCondition,
    prefix = 'api',
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Check condition
    if (!condition(req, res)) {
      return next()
    }

    try {
      const cacheKey = keyGenerator(req)
      const cached = await cacheService.get(cacheKey, { prefix, ttl })

      if (cached) {
        logger.debug('Cache hit', { key: cacheKey })
        if (!res.headersSent) {
          res.setHeader('X-Cache', 'HIT')
        }
        return res.json(cached)
      }

      logger.debug('Cache miss', { key: cacheKey })
      if (!res.headersSent) {
        res.setHeader('X-Cache', 'MISS')
      }

      // Store original json method
      const originalJson = res.json.bind(res)

      // Override json method to cache the response
      res.json = function (data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, { prefix, ttl }).catch((error) => {
            logger.error('Failed to cache response', { key: cacheKey, error })
          })
        }

        return originalJson(data)
      }

      next()
    } catch (error) {
      logger.error('Cache middleware error', { error })
      next()
    }
  }
}

// Default key generator
function defaultKeyGenerator(req: Request): string {
  const { path, query } = req
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&')
  
  return `${path}${queryString ? `?${queryString}` : ''}`
}

// Default condition - cache all GET requests except authenticated ones
function defaultCondition(req: Request, res: Response): boolean {
  // Don't cache authenticated requests
  if (req.headers.authorization || req.session?.isAuthenticated) {
    return false
  }

  // Don't cache requests with sensitive query parameters
  const sensitiveParams = ['token', 'key', 'secret', 'password']
  const queryKeys = Object.keys(req.query).map(k => k.toLowerCase())
  
  return !sensitiveParams.some(param => queryKeys.includes(param))
}

// Cache invalidation middleware
export function cacheInvalidationMiddleware(patterns: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original methods
    const originalJson = res.json.bind(res)
    const originalSend = res.send.bind(res)

    const invalidateCache = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patterns) {
          try {
            await cacheService.invalidatePattern(pattern)
            logger.debug('Cache invalidated', { pattern })
          } catch (error) {
            logger.error('Cache invalidation failed', { pattern, error })
          }
        }
      }
    }

    // Override response methods
    res.json = function (data: any) {
      invalidateCache()
      return originalJson(data)
    }

    res.send = function (data: any) {
      invalidateCache()
      return originalSend(data)
    }

    next()
  }
}

// Specific cache middleware for different endpoints

// Product catalog cache
export const productCacheMiddleware = cacheMiddleware({
  ttl: 1800, // 30 minutes
  keyGenerator: (req) => {
    const { path, query } = req
    const { page, limit, sort, category, region, vintage, minPrice, maxPrice } = query
    
    return `products:${path}:${JSON.stringify({
      page,
      limit,
      sort,
      category,
      region,
      vintage,
      minPrice,
      maxPrice,
    })}`
  },
  prefix: 'catalog',
})

// Individual product cache
export const singleProductCacheMiddleware = cacheMiddleware({
  ttl: 3600, // 1 hour
  keyGenerator: (req) => `product:${req.params.id}`,
  prefix: 'catalog',
})

// Crypto price cache
export const cryptoPriceCacheMiddleware = cacheMiddleware({
  ttl: 300, // 5 minutes
  keyGenerator: (req) => `prices:${req.path}`,
  prefix: 'crypto',
})

// Search results cache
export const searchCacheMiddleware = cacheMiddleware({
  ttl: 900, // 15 minutes
  keyGenerator: (req) => {
    const { q, category, sort, page, limit } = req.query
    return `search:${JSON.stringify({ q, category, sort, page, limit })}`
  },
  prefix: 'search',
  condition: (req, res) => {
    // Only cache if search query is present and not too short
    const query = req.query.q as string
    return Boolean(query && query.length >= 3)
  },
})

// Performance optimization middleware
export const performanceMiddleware = [
  // Compression middleware
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
    level: 6,
    threshold: 1024,
  }),

  // Response time header
  (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    
    // Override the end method to set headers before response is sent
    const originalEnd = res.end.bind(res)
    res.end = function(...args: any[]) {
      const duration = Date.now() - start
      
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`)
      }
      
      // Log slow requests
      if (duration > 1000) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration,
          userAgent: req.get('User-Agent'),
        })
      }
      
      return originalEnd(...args)
    }
    
    next()
  },

  // ETag generation for cacheable responses
  (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      const originalJson = res.json.bind(res)
      
      res.json = function (data: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`
          if (!res.headersSent) {
            res.setHeader('ETag', etag)
          }
          
          // Check if client has cached version
          if (req.headers['if-none-match'] === etag) {
            return res.status(304).end()
          }
        }
        
        return originalJson(data)
      }
    }
    
    next()
  },
]

// Static asset caching headers
export function staticCacheHeaders(req: Request, res: Response, next: NextFunction) {
  const isStatic = /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i.test(req.path)
  
  if (isStatic) {
    // Cache static assets for 1 year
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString())
  } else {
    // Cache API responses for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
  }
  
  next()
}

// Memory usage monitoring
export function memoryMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const memUsage = process.memoryUsage()
  
  // Log memory usage if it's high
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    logger.warn('High memory usage detected', {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    })
  }
  
  next()
}

// Request size limiting
export function requestSizeLimiter(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10)
    
    if (contentLength > maxSize) {
      res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload too large',
        },
      })
      return
    }
    
    next()
  }
}