import { createClient, RedisClientType } from 'redis'
import { redisConfig } from '@/config/database'
import { logger } from '@/utils/logger'

class RedisService {
  private static instance: RedisService
  private client: RedisClientType
  private isConnected: boolean = false

  private constructor() {
    // In development, create a mock client if Redis is not available
    if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_HOST) {
      logger.warn('Redis not configured for development - using mock client')
      this.client = {} as RedisClientType
      return
    }

    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      ...(redisConfig.password && { password: redisConfig.password }),
      database: redisConfig.db,
    })

    this.setupEventHandlers()
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connecting...')
    })

    this.client.on('ready', () => {
      logger.info('Redis client connected and ready')
      this.isConnected = true
    })

    this.client.on('error', (error) => {
      logger.error('Redis client error', { error: error.message })
      this.isConnected = false
    })

    this.client.on('end', () => {
      logger.info('Redis client connection ended')
      this.isConnected = false
    })

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...')
    })
  }

  public async connect(): Promise<void> {
    // Skip connection for mock client
    if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_HOST) {
      logger.info('Using mock Redis client in development')
      this.isConnected = true
      return
    }

    try {
      if (!this.isConnected) {
        await this.client.connect()
        logger.info('Redis connected successfully')
      }
    } catch (error) {
      logger.error('Failed to connect to Redis', { error })
      if (process.env.NODE_ENV === 'production') {
        throw error
      } else {
        logger.warn('Redis connection failed in development mode - continuing without Redis')
      }
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect()
        logger.info('Redis disconnected successfully')
      }
    } catch (error) {
      logger.error('Failed to disconnect from Redis', { error })
      if (process.env.NODE_ENV === 'production') {
        throw error
      } else {
        logger.warn('Redis disconnect failed in development mode - ignoring')
      }
    }
  }

  public getClient(): RedisClientType {
    return this.client
  }

  private isMockClient(): boolean {
    return process.env.NODE_ENV !== 'production' && !process.env.REDIS_HOST
  }

  public async healthCheck(): Promise<boolean> {
    // Mock client is always "healthy" in development
    if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_HOST) {
      return true
    }

    try {
      const result = await this.client.ping()
      return result === 'PONG'
    } catch (error) {
      logger.error('Redis health check failed', { error })
      return false
    }
  }

  // Cache operations
  public async get(key: string): Promise<string | null> {
    // Mock client returns null for all gets in development
    if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_HOST) {
      return null
    }

    try {
      return await this.client.get(key)
    } catch (error) {
      logger.error('Redis GET error', { key, error })
      return null
    }
  }

  public async set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number; NX?: boolean; XX?: boolean }
  ): Promise<boolean> {
    // Mock client always returns success in development
    if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_HOST) {
      return true
    }

    try {
      const result = await this.client.set(key, value, options)
      return result === 'OK'
    } catch (error) {
      logger.error('Redis SET error', { key, error })
      return false
    }
  }

  public async del(key: string): Promise<boolean> {
    if (this.isMockClient()) {
      return true
    }

    try {
      const result = await this.client.del(key)
      return result > 0
    } catch (error) {
      logger.error('Redis DEL error', { key, error })
      return false
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result > 0
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error })
      return false
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds)
      return result === 1
    } catch (error) {
      logger.error('Redis EXPIRE error', { key, seconds, error })
      return false
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key)
    } catch (error) {
      logger.error('Redis TTL error', { key, error })
      return -1
    }
  }

  // Hash operations
  public async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field)
    } catch (error) {
      logger.error('Redis HGET error', { key, field, error })
      return null
    }
  }

  public async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      const result = await this.client.hSet(key, field, value)
      return result >= 0
    } catch (error) {
      logger.error('Redis HSET error', { key, field, error })
      return false
    }
  }

  public async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(key)
    } catch (error) {
      logger.error('Redis HGETALL error', { key, error })
      return null
    }
  }

  public async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hDel(key, field)
      return result > 0
    } catch (error) {
      logger.error('Redis HDEL error', { key, field, error })
      return false
    }
  }

  // List operations
  public async lpush(key: string, ...values: string[]): Promise<number> {
    if (this.isMockClient()) {
      return values.length
    }

    try {
      return await this.client.lPush(key, values)
    } catch (error) {
      logger.error('Redis LPUSH error', { key, error })
      return 0
    }
  }

  public async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key)
    } catch (error) {
      logger.error('Redis RPOP error', { key, error })
      return null
    }
  }

  public async llen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key)
    } catch (error) {
      logger.error('Redis LLEN error', { key, error })
      return 0
    }
  }

  // Set operations
  public async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members)
    } catch (error) {
      logger.error('Redis SADD error', { key, error })
      return 0
    }
  }

  public async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sRem(key, members)
    } catch (error) {
      logger.error('Redis SREM error', { key, error })
      return 0
    }
  }

  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key)
    } catch (error) {
      logger.error('Redis SMEMBERS error', { key, error })
      return []
    }
  }

  public async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sIsMember(key, member)
      return Boolean(result)
    } catch (error) {
      logger.error('Redis SISMEMBER error', { key, member, error })
      return false
    }
  }

  // Additional methods needed by the application
  public async setex(key: string, seconds: number, value: string): Promise<boolean> {
    try {
      const result = await this.client.setEx(key, seconds, value)
      return result === 'OK'
    } catch (error) {
      logger.error('Redis SETEX error', { key, seconds, error })
      return false
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key)
    } catch (error) {
      logger.error('Redis INCR error', { key, error })
      return 0
    }
  }

  public async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    try {
      const result = await this.client.lTrim(key, start, stop)
      return result === 'OK'
    } catch (error) {
      logger.error('Redis LTRIM error', { key, start, stop, error })
      return false
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern)
    } catch (error) {
      logger.error('Redis KEYS error', { pattern, error })
      return []
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (this.isMockClient()) {
      return []
    }

    try {
      return await this.client.lRange(key, start, stop)
    } catch (error) {
      logger.error('Redis LRANGE error', { key, start, stop, error })
      return []
    }
  }
}

export const redisService = RedisService.getInstance()