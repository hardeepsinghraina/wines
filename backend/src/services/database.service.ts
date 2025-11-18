import { PrismaClient, Prisma } from '@prisma/client'
import { logger } from '@/utils/logger'
import { databaseConfig } from '@/config/database'

interface ConnectionPool {
  activeConnections: number
  maxConnections: number
  waitingQueue: number
}

interface QueryMetrics {
  totalQueries: number
  slowQueries: number
  failedQueries: number
  averageResponseTime: number
}

class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient
  private isConnected: boolean = false
  private connectionRetries: number = 0
  private maxRetries: number = 5
  private retryDelay: number = 1000
  private queryMetrics: QueryMetrics = {
    totalQueries: 0,
    slowQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0
  }
  private responseTimes: number[] = []

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: this.buildDatabaseUrl()
        }
      }
    })

    this.setupEventHandlers()
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public getClient(): PrismaClient {
    return this.prisma
  }

  /**
   * Build database URL with connection pooling and SSL settings
   */
  private buildDatabaseUrl(): string {
    const baseUrl = process.env.DATABASE_URL
    
    if (baseUrl) {
      // Add connection pooling parameters if not already present
      const url = new URL(baseUrl)
      
      if (!url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', databaseConfig.maxConnections.toString())
      }
      
      if (!url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', Math.ceil(databaseConfig.connectionTimeoutMillis / 1000).toString())
      }
      
      if (databaseConfig.ssl && !url.searchParams.has('sslmode')) {
        url.searchParams.set('sslmode', 'require')
      }
      
      return url.toString()
    }
    
    // Fallback to building URL from individual components
    const protocol = process.env.NODE_ENV === 'production' ? 'postgresql' : 'postgresql'
    const sslParam = databaseConfig.ssl ? '?sslmode=require' : ''
    
    return `${protocol}://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}${sslParam}&connection_limit=${databaseConfig.maxConnections}&pool_timeout=${Math.ceil(databaseConfig.connectionTimeoutMillis / 1000)}`
  }

  /**
   * Setup Prisma event handlers for monitoring and logging
   */
  private setupEventHandlers(): void {
    try {
      // Check if $on method exists (not available in all Prisma configurations)
      if (typeof (this.prisma as any).$on === 'function') {
        // Query event handler for performance monitoring
        (this.prisma as any).$on('query', (e: any) => {
          const duration = e.duration
          this.queryMetrics.totalQueries++
          
          // Track response times
          this.responseTimes.push(duration)
          if (this.responseTimes.length > 1000) {
            this.responseTimes = this.responseTimes.slice(-1000) // Keep last 1000 queries
          }
          
          // Calculate average response time
          this.queryMetrics.averageResponseTime = 
            this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
          
          // Log slow queries (> 1 second)
          if (duration > 1000) {
            this.queryMetrics.slowQueries++
            logger.warn('Slow database query detected', {
              query: e.query,
              params: e.params,
              duration: `${duration}ms`,
              target: e.target
            })
          }
          
          // Log query in development mode
          if (process.env.NODE_ENV === 'development' && duration > 100) {
            logger.debug('Database query', {
              query: e.query.substring(0, 200) + (e.query.length > 200 ? '...' : ''),
              duration: `${duration}ms`
            })
          }
        })

        // Error event handler
        (this.prisma as any).$on('error', (e: any) => {
          this.queryMetrics.failedQueries++
          logger.error('Database error', {
            message: e.message,
            target: e.target,
            timestamp: e.timestamp
          })
        })

        // Info event handler
        (this.prisma as any).$on('info', (e: any) => {
          logger.info('Database info', {
            message: e.message,
            target: e.target,
            timestamp: e.timestamp
          })
        })
        
        logger.info('Database event handlers setup successfully')
      } else {
        logger.warn('Prisma event handlers not available - running without query monitoring')
      }
    } catch (error) {
      logger.warn('Failed to setup database event handlers:', error)
      // Continue without event handlers - this is not critical for functionality
    }

    // Warn event handler
    (this.prisma as any).$on('warn', (e: any) => {
      logger.warn('Database warning', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp
      })
    })
  }

  /**
   * Connect to database with retry logic
   */
  public async connect(): Promise<void> {
    while (this.connectionRetries < this.maxRetries) {
      try {
        await this.prisma.$connect()
        this.isConnected = true
        this.connectionRetries = 0
        
        logger.info('Database connected successfully', {
          attempt: this.connectionRetries + 1,
          maxConnections: databaseConfig.maxConnections,
          ssl: databaseConfig.ssl
        })
        
        // Test the connection
        await this.healthCheck()
        return
        
      } catch (error) {
        this.connectionRetries++
        this.isConnected = false
        
        logger.error('Failed to connect to database', {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: this.connectionRetries,
          maxRetries: this.maxRetries
        })
        
        if (this.connectionRetries >= this.maxRetries) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error(`Database connection failed after ${this.maxRetries} attempts`)
          } else {
            logger.warn('Database connection failed in development mode - continuing without database')
            return
          }
        }
        
        // Wait before retrying
        await this.sleep(this.retryDelay * this.connectionRetries)
      }
    }
  }

  /**
   * Disconnect from database with cleanup
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      this.isConnected = false
      logger.info('Database disconnected successfully')
    } catch (error) {
      logger.error('Failed to disconnect from database', { error })
      if (process.env.NODE_ENV === 'production') {
        throw error
      }
    }
  }

  /**
   * Enhanced health check with detailed diagnostics
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now()
      
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1 as health_check`
      
      const responseTime = Date.now() - startTime
      
      // Test transaction capability
      await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 as transaction_test`
      })
      
      logger.debug('Database health check passed', {
        responseTime: `${responseTime}ms`,
        isConnected: this.isConnected
      })
      
      return true
    } catch (error) {
      this.isConnected = false
      logger.error('Database health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        isConnected: this.isConnected
      })
      
      // Attempt to reconnect if health check fails
      if (process.env.NODE_ENV === 'production') {
        try {
          await this.reconnect()
          return true
        } catch (reconnectError) {
          logger.error('Failed to reconnect during health check', { reconnectError })
        }
      }
      
      return false
    }
  }

  /**
   * Run database migrations with error handling
   */
  public async runMigrations(): Promise<void> {
    try {
      logger.info('Running database migrations...')
      
      // Check if migrations table exists
      const migrationStatus = await this.checkMigrationStatus()
      logger.info('Migration status checked', { migrationStatus })
      
      // In production, migrations should be run via Prisma CLI
      // This is mainly for development and testing
      if (process.env.NODE_ENV !== 'production') {
        // Custom migration logic can be added here
        await this.ensureIndexes()
      }
      
      logger.info('Database migrations completed')
    } catch (error) {
      logger.error('Failed to run database migrations', { error })
      throw error
    }
  }

  /**
   * Enhanced transaction with retry logic and timeout
   */
  public async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  ): Promise<T> {
    const defaultOptions = {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
    
    const finalOptions = { ...defaultOptions, ...options }
    
    try {
      return await this.prisma.$transaction(callback, finalOptions)
    } catch (error) {
      logger.error('Transaction failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        options: finalOptions
      })
      
      // Check if it's a connection issue and attempt reconnect
      if (this.isConnectionError(error)) {
        await this.handleConnectionError()
      }
      
      throw error
    }
  }

  /**
   * Execute raw query with error handling and metrics
   */
  public async executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await this.prisma.$executeRaw(query, ...values)
      
      const duration = Date.now() - startTime
      if (duration > 1000) {
        logger.warn('Slow raw query execution', {
          duration: `${duration}ms`,
          query: query.toString().substring(0, 200)
        })
      }
      
      return result as T
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Raw query execution failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        query: query.toString().substring(0, 200)
      })
      
      if (this.isConnectionError(error)) {
        await this.handleConnectionError()
      }
      
      throw error
    }
  }

  /**
   * Execute raw query and return results
   */
  public async queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await this.prisma.$queryRaw(query, ...values)
      
      const duration = Date.now() - startTime
      if (duration > 1000) {
        logger.warn('Slow raw query', {
          duration: `${duration}ms`,
          query: query.toString().substring(0, 200)
        })
      }
      
      return result as T
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Raw query failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        query: query.toString().substring(0, 200)
      })
      
      if (this.isConnectionError(error)) {
        await this.handleConnectionError()
      }
      
      throw error
    }
  }

  /**
   * Get database connection pool status
   */
  public async getConnectionPoolStatus(): Promise<ConnectionPool> {
    try {
      // This is a simplified version - in production you might query pg_stat_activity
      const result = await this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'
      ` as Array<{ count: number }>
      
      return {
        activeConnections: result[0]?.count || 0,
        maxConnections: databaseConfig.maxConnections,
        waitingQueue: 0 // Would need more complex query to get this
      }
    } catch (error) {
      logger.error('Failed to get connection pool status', { error })
      return {
        activeConnections: 0,
        maxConnections: databaseConfig.maxConnections,
        waitingQueue: 0
      }
    }
  }

  /**
   * Get query performance metrics
   */
  public getQueryMetrics(): QueryMetrics {
    return { ...this.queryMetrics }
  }

  /**
   * Reset query metrics
   */
  public resetQueryMetrics(): void {
    this.queryMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0
    }
    this.responseTimes = []
  }

  /**
   * Check if error is connection-related
   */
  private isConnectionError(error: any): boolean {
    if (!error) return false
    
    const connectionErrorMessages = [
      'connection terminated',
      'connection refused',
      'connection timeout',
      'connection reset',
      'connection closed',
      'server closed the connection',
      'connection lost',
      'connection dropped'
    ]
    
    const errorMessage = error.message?.toLowerCase() || ''
    return connectionErrorMessages.some(msg => errorMessage.includes(msg))
  }

  /**
   * Handle connection errors with reconnection logic
   */
  private async handleConnectionError(): Promise<void> {
    logger.warn('Connection error detected, attempting to reconnect...')
    this.isConnected = false
    
    try {
      await this.reconnect()
    } catch (error) {
      logger.error('Failed to reconnect after connection error', { error })
    }
  }

  /**
   * Reconnect to database
   */
  private async reconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
    } catch (error) {
      // Ignore disconnect errors
    }
    
    this.connectionRetries = 0
    await this.connect()
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Check migration status
   */
  private async checkMigrationStatus(): Promise<any> {
    try {
      // Check if _prisma_migrations table exists
      const result = await this.prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_prisma_migrations'
        ) as exists
      `
      return result
    } catch (error) {
      logger.debug('Migration status check failed (expected in SQLite)', { error })
      return { exists: false }
    }
  }

  /**
   * Ensure database indexes for performance
   */
  private async ensureIndexes(): Promise<void> {
    try {
      // Add indexes for commonly queried fields
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive)',
        'CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(sessionToken)',
        'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(userId)',
        'CREATE INDEX IF NOT EXISTS idx_wines_category ON wines(category)',
        'CREATE INDEX IF NOT EXISTS idx_wines_active ON wines(isActive)',
        'CREATE INDEX IF NOT EXISTS idx_wines_featured ON wines(isFeatured)',
        'CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(userId)',
        'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
        'CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(orderId)',
        'CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(userId)',
      ]
      
      for (const indexQuery of indexes) {
        try {
          await this.prisma.$executeRawUnsafe(indexQuery)
        } catch (error) {
          // Ignore errors for existing indexes or unsupported operations
          logger.debug('Index creation skipped', { query: indexQuery, error })
        }
      }
      
      logger.info('Database indexes ensured')
    } catch (error) {
      logger.warn('Failed to ensure database indexes', { error })
    }
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<any> {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        LIMIT 10
      `
      
      return stats
    } catch (error) {
      logger.debug('Database stats not available (expected in SQLite)', { error })
      return []
    }
  }
}

export const databaseService = DatabaseService.getInstance()
export const prisma = databaseService.getClient()