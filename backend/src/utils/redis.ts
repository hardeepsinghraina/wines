import { redisService } from '@/services/redis.service'
import { logger } from './logger'

// Redis utility functions for common operations

export class RedisUtils {
  // Shopping cart operations
  static async addToCart(userId: string, productId: string, quantity: number): Promise<boolean> {
    try {
      const cartKey = `cart:${userId}`
      const cartItem = JSON.stringify({ productId, quantity, addedAt: new Date().toISOString() })
      
      return await redisService.hset(cartKey, productId, cartItem)
    } catch (error) {
      logger.error('Failed to add item to cart', { userId, productId, error })
      return false
    }
  }

  static async removeFromCart(userId: string, productId: string): Promise<boolean> {
    try {
      const cartKey = `cart:${userId}`
      return await redisService.hdel(cartKey, productId)
    } catch (error) {
      logger.error('Failed to remove item from cart', { userId, productId, error })
      return false
    }
  }

  static async getCart(userId: string): Promise<any[]> {
    try {
      const cartKey = `cart:${userId}`
      const cartData = await redisService.hgetall(cartKey)
      
      if (!cartData) return []
      
      return Object.values(cartData).map(item => JSON.parse(item))
    } catch (error) {
      logger.error('Failed to get cart', { userId, error })
      return []
    }
  }

  static async clearCart(userId: string): Promise<boolean> {
    try {
      const cartKey = `cart:${userId}`
      return await redisService.del(cartKey)
    } catch (error) {
      logger.error('Failed to clear cart', { userId, error })
      return false
    }
  }

  // Recently viewed products
  static async addRecentlyViewed(userId: string, productId: string): Promise<boolean> {
    try {
      const recentKey = `recent:${userId}`
      const maxRecent = 10
      
      // Add to the front of the list
      await redisService.lpush(recentKey, productId)
      
      // Keep only the most recent items
      const currentLength = await redisService.llen(recentKey)
      if (currentLength > maxRecent) {
        // Remove excess items from the end
        for (let i = 0; i < currentLength - maxRecent; i++) {
          await redisService.rpop(recentKey)
        }
      }
      
      // Set expiration (30 days)
      await redisService.expire(recentKey, 30 * 24 * 60 * 60)
      
      return true
    } catch (error) {
      logger.error('Failed to add recently viewed', { userId, productId, error })
      return false
    }
  }

  static async getRecentlyViewed(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const recentKey = `recent:${userId}`
      // Get recent items (Redis lists are 0-indexed)
      const client = redisService.getClient()
      return await client.lRange(recentKey, 0, limit - 1)
    } catch (error) {
      logger.error('Failed to get recently viewed', { userId, error })
      return []
    }
  }

  // Wishlist operations
  static async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistKey = `wishlist:${userId}`
      const result = await redisService.sadd(wishlistKey, productId)
      
      // Set expiration (90 days)
      await redisService.expire(wishlistKey, 90 * 24 * 60 * 60)
      
      return result > 0
    } catch (error) {
      logger.error('Failed to add to wishlist', { userId, productId, error })
      return false
    }
  }

  static async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistKey = `wishlist:${userId}`
      const result = await redisService.srem(wishlistKey, productId)
      return result > 0
    } catch (error) {
      logger.error('Failed to remove from wishlist', { userId, productId, error })
      return false
    }
  }

  static async getWishlist(userId: string): Promise<string[]> {
    try {
      const wishlistKey = `wishlist:${userId}`
      return await redisService.smembers(wishlistKey)
    } catch (error) {
      logger.error('Failed to get wishlist', { userId, error })
      return []
    }
  }

  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlistKey = `wishlist:${userId}`
      return await redisService.sismember(wishlistKey, productId)
    } catch (error) {
      logger.error('Failed to check wishlist', { userId, productId, error })
      return false
    }
  }

  // Search suggestions cache
  static async cacheSearchSuggestions(query: string, suggestions: string[]): Promise<boolean> {
    try {
      const suggestionKey = `suggestions:${query.toLowerCase()}`
      return await redisService.set(suggestionKey, JSON.stringify(suggestions), { EX: 3600 }) // 1 hour
    } catch (error) {
      logger.error('Failed to cache search suggestions', { query, error })
      return false
    }
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const suggestionKey = `suggestions:${query.toLowerCase()}`
      const cached = await redisService.get(suggestionKey)
      return cached ? JSON.parse(cached) : []
    } catch (error) {
      logger.error('Failed to get search suggestions', { query, error })
      return []
    }
  }

  // Popular products tracking
  static async incrementProductView(productId: string): Promise<boolean> {
    try {
      const viewKey = `views:${productId}`
      const client = redisService.getClient()
      await client.incr(viewKey)
      
      // Set expiration (7 days)
      await redisService.expire(viewKey, 7 * 24 * 60 * 60)
      
      return true
    } catch (error) {
      logger.error('Failed to increment product view', { productId, error })
      return false
    }
  }

  static async getProductViews(productId: string): Promise<number> {
    try {
      const viewKey = `views:${productId}`
      const views = await redisService.get(viewKey)
      return views ? parseInt(views, 10) : 0
    } catch (error) {
      logger.error('Failed to get product views', { productId, error })
      return 0
    }
  }

  // Temporary data storage (for things like password reset tokens)
  static async storeTemporaryData(
    key: string,
    data: any,
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    try {
      const tempKey = `temp:${key}`
      return await redisService.set(tempKey, JSON.stringify(data), { EX: ttlSeconds })
    } catch (error) {
      logger.error('Failed to store temporary data', { key, error })
      return false
    }
  }

  static async getTemporaryData(key: string): Promise<any | null> {
    try {
      const tempKey = `temp:${key}`
      const data = await redisService.get(tempKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.error('Failed to get temporary data', { key, error })
      return null
    }
  }

  static async deleteTemporaryData(key: string): Promise<boolean> {
    try {
      const tempKey = `temp:${key}`
      return await redisService.del(tempKey)
    } catch (error) {
      logger.error('Failed to delete temporary data', { key, error })
      return false
    }
  }
}