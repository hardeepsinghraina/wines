import { redisService } from './redis.service'
import { logger } from '@/utils/logger'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

export class CacheService {
  private static instance: CacheService
  private defaultTTL = 3600 // 1 hour
  private keyPrefix = 'luxury_wine:'

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  private buildKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || this.keyPrefix
    return `${finalPrefix}${key}`
  }

  // Generic cache operations
  public async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      const cached = await redisService.get(fullKey)
      
      if (cached) {
        return JSON.parse(cached) as T
      }
      
      return null
    } catch (error) {
      logger.error('Cache GET error', { key, error })
      return null
    }
  }

  public async set<T>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      const ttl = options?.ttl || this.defaultTTL
      const serialized = JSON.stringify(value)
      
      return await redisService.set(fullKey, serialized, { EX: ttl })
    } catch (error) {
      logger.error('Cache SET error', { key, error })
      return false
    }
  }

  public async del(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      return await redisService.del(fullKey)
    } catch (error) {
      logger.error('Cache DEL error', { key, error })
      return false
    }
  }

  public async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix)
      return await redisService.exists(fullKey)
    } catch (error) {
      logger.error('Cache EXISTS error', { key, error })
      return false
    }
  }

  // Cache with fallback function
  public async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options)
      if (cached !== null) {
        return cached
      }

      // If not in cache, execute fallback function
      const result = await fallbackFn()
      if (result !== null && result !== undefined) {
        await this.set(key, result, options)
      }

      return result
    } catch (error) {
      logger.error('Cache getOrSet error', { key, error })
      // If cache fails, still try to return the fallback result
      try {
        return await fallbackFn()
      } catch (fallbackError) {
        logger.error('Fallback function error', { key, error: fallbackError })
        return null
      }
    }
  }

  // Specialized cache methods for common use cases

  // User session cache
  public async cacheUserSession(
    sessionId: string,
    userData: any,
    ttl: number = 86400 // 24 hours
  ): Promise<boolean> {
    return await this.set(`session:${sessionId}`, userData, {
      ttl,
      prefix: 'auth:',
    })
  }

  public async getUserSession(sessionId: string): Promise<any | null> {
    return await this.get(`session:${sessionId}`, { prefix: 'auth:' })
  }

  public async deleteUserSession(sessionId: string): Promise<boolean> {
    return await this.del(`session:${sessionId}`, { prefix: 'auth:' })
  }

  // Product cache
  public async cacheProduct(
    productId: string,
    productData: any,
    ttl: number = 3600 // 1 hour
  ): Promise<boolean> {
    return await this.set(`product:${productId}`, productData, {
      ttl,
      prefix: 'catalog:',
    })
  }

  public async getProduct(productId: string): Promise<any | null> {
    return await this.get(`product:${productId}`, { prefix: 'catalog:' })
  }

  public async invalidateProduct(productId: string): Promise<boolean> {
    return await this.del(`product:${productId}`, { prefix: 'catalog:' })
  }

  // Product list cache
  public async cacheProductList(
    cacheKey: string,
    products: any[],
    ttl: number = 1800 // 30 minutes
  ): Promise<boolean> {
    return await this.set(`list:${cacheKey}`, products, {
      ttl,
      prefix: 'catalog:',
    })
  }

  public async getProductList(cacheKey: string): Promise<any[] | null> {
    return await this.get(`list:${cacheKey}`, { prefix: 'catalog:' })
  }

  // Crypto price cache
  public async cacheCryptoPrice(
    currency: string,
    price: number,
    ttl: number = 300 // 5 minutes
  ): Promise<boolean> {
    return await this.set(`price:${currency.toLowerCase()}`, price, {
      ttl,
      prefix: 'crypto:',
    })
  }

  public async getCryptoPrice(currency: string): Promise<number | null> {
    return await this.get(`price:${currency.toLowerCase()}`, { prefix: 'crypto:' })
  }

  // Rate limiting cache
  public async incrementRateLimit(
    identifier: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ count: number; remaining: number; resetTime: number }> {
    try {
      const key = this.buildKey(`ratelimit:${identifier}`, 'system:')
      const current = await redisService.get(key)
      const now = Date.now()
      const windowStart = Math.floor(now / windowMs) * windowMs
      const resetTime = windowStart + windowMs

      let count = 1
      if (current) {
        const data = JSON.parse(current)
        if (data.windowStart === windowStart) {
          count = data.count + 1
        }
      }

      await redisService.set(
        key,
        JSON.stringify({ count, windowStart }),
        { PX: windowMs }
      )

      return {
        count,
        remaining: Math.max(0, maxRequests - count),
        resetTime,
      }
    } catch (error) {
      logger.error('Rate limit increment error', { identifier, error })
      return { count: 0, remaining: maxRequests, resetTime: Date.now() + windowMs }
    }
  }

  // Cache invalidation patterns
  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use Redis SCAN for better performance
      const fullPattern = this.buildKey(pattern)
      logger.info('Cache pattern invalidation requested', { pattern: fullPattern })
      
      // For now, we'll just log the request
      // Actual implementation would require scanning and deleting matching keys
      return 0
    } catch (error) {
      logger.error('Cache pattern invalidation error', { pattern, error })
      return 0
    }
  }

  // Cache statistics
  public async getCacheStats(): Promise<{
    connected: boolean
    keyCount: number
    memoryUsage: string
  }> {
    try {
      const connected = await redisService.healthCheck()
      
      // Basic stats - in production you might want more detailed metrics
      return {
        connected,
        keyCount: 0, // Would require scanning all keys
        memoryUsage: 'N/A', // Would require Redis INFO command
      }
    } catch (error) {
      logger.error('Cache stats error', { error })
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 'Error',
      }
    }
  }
}

export const cacheService = CacheService.getInstance()