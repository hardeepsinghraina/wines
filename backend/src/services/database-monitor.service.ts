import { logger } from '@/utils/logger'
import { databaseService } from '@/services/database.service'
import { redisService } from '@/services/redis.service'

export interface DatabaseHealth {
  isHealthy: boolean
  responseTime: number
  connectionPool: {
    active: number
    max: number
    utilization: number
  }
  queryMetrics: {
    totalQueries: number
    slowQueries: number
    failedQueries: number
    averageResponseTime: number
  }
  lastChecked: string
  errors: string[]
}

export interface DatabaseAlert {
  type: 'CONNECTION_POOL_HIGH' | 'SLOW_QUERIES' | 'CONNECTION_FAILED' | 'HIGH_ERROR_RATE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  timestamp: string
  metrics?: any
}

class DatabaseMonitorService {
  private static instance: DatabaseMonitorService
  private monitoringInterval: NodeJS.Timeout | null = null
  private alertThresholds = {
    connectionPoolUtilization: 80, // %
    slowQueryThreshold: 1000, // ms
    errorRateThreshold: 5, // %
    responseTimeThreshold: 500 // ms
  }
  private alerts: DatabaseAlert[] = []
  private maxAlerts = 100

  private constructor() {}

  public static getInstance(): DatabaseMonitorService {
    if (!DatabaseMonitorService.instance) {
      DatabaseMonitorService.instance = new DatabaseMonitorService()
    }
    return DatabaseMonitorService.instance
  }

  /**
   * Start database monitoring
   */
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      this.stopMonitoring()
    }

    logger.info('Starting database monitoring', { intervalMs })

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck()
      } catch (error) {
        logger.error('Database monitoring error', { error })
      }
    }, intervalMs)

    // Perform initial health check
    this.performHealthCheck().catch(error => {
      logger.error('Initial database health check failed', { error })
    })
  }

  /**
   * Stop database monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      logger.info('Database monitoring stopped')
    }
  }

  /**
   * Perform comprehensive health check
   */
  public async performHealthCheck(): Promise<DatabaseHealth> {
    const startTime = Date.now()
    const errors: string[] = []
    let isHealthy = true

    try {
      // Test basic connectivity
      const isConnected = await databaseService.healthCheck()
      if (!isConnected) {
        isHealthy = false
        errors.push('Database connection failed')
      }

      const responseTime = Date.now() - startTime

      // Get connection pool status
      const connectionPool = await databaseService.getConnectionPoolStatus()
      const poolUtilization = (connectionPool.activeConnections / connectionPool.maxConnections) * 100

      // Check connection pool utilization
      if (poolUtilization > this.alertThresholds.connectionPoolUtilization) {
        isHealthy = false
        errors.push(`High connection pool utilization: ${poolUtilization.toFixed(1)}%`)
        
        await this.createAlert({
          type: 'CONNECTION_POOL_HIGH',
          severity: poolUtilization > 95 ? 'CRITICAL' : 'HIGH',
          message: `Connection pool utilization is ${poolUtilization.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          metrics: { poolUtilization, activeConnections: connectionPool.activeConnections }
        })
      }

      // Get query metrics
      const queryMetrics = databaseService.getQueryMetrics()

      // Check for high error rate
      const errorRate = queryMetrics.totalQueries > 0 
        ? (queryMetrics.failedQueries / queryMetrics.totalQueries) * 100 
        : 0

      if (errorRate > this.alertThresholds.errorRateThreshold) {
        isHealthy = false
        errors.push(`High query error rate: ${errorRate.toFixed(1)}%`)
        
        await this.createAlert({
          type: 'HIGH_ERROR_RATE',
          severity: errorRate > 10 ? 'CRITICAL' : 'HIGH',
          message: `Query error rate is ${errorRate.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          metrics: { errorRate, failedQueries: queryMetrics.failedQueries, totalQueries: queryMetrics.totalQueries }
        })
      }

      // Check for slow queries
      const slowQueryRate = queryMetrics.totalQueries > 0 
        ? (queryMetrics.slowQueries / queryMetrics.totalQueries) * 100 
        : 0

      if (slowQueryRate > 10) { // More than 10% slow queries
        errors.push(`High slow query rate: ${slowQueryRate.toFixed(1)}%`)
        
        await this.createAlert({
          type: 'SLOW_QUERIES',
          severity: slowQueryRate > 25 ? 'HIGH' : 'MEDIUM',
          message: `Slow query rate is ${slowQueryRate.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          metrics: { slowQueryRate, slowQueries: queryMetrics.slowQueries }
        })
      }

      // Check response time
      if (responseTime > this.alertThresholds.responseTimeThreshold) {
        errors.push(`High response time: ${responseTime}ms`)
      }

      const health: DatabaseHealth = {
        isHealthy,
        responseTime,
        connectionPool: {
          active: connectionPool.activeConnections,
          max: connectionPool.maxConnections,
          utilization: poolUtilization
        },
        queryMetrics,
        lastChecked: new Date().toISOString(),
        errors
      }

      // Store health status in Redis for dashboard
      await this.storeHealthStatus(health)

      // Log health status
      if (!isHealthy) {
        logger.warn('Database health check failed', health)
      } else {
        logger.debug('Database health check passed', {
          responseTime: `${responseTime}ms`,
          poolUtilization: `${poolUtilization.toFixed(1)}%`,
          totalQueries: queryMetrics.totalQueries
        })
      }

      return health

    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      errors.push(`Health check failed: ${errorMessage}`)
      
      await this.createAlert({
        type: 'CONNECTION_FAILED',
        severity: 'CRITICAL',
        message: `Database health check failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        metrics: { responseTime, error: errorMessage }
      })

      const health: DatabaseHealth = {
        isHealthy: false,
        responseTime,
        connectionPool: { active: 0, max: 0, utilization: 0 },
        queryMetrics: { totalQueries: 0, slowQueries: 0, failedQueries: 0, averageResponseTime: 0 },
        lastChecked: new Date().toISOString(),
        errors
      }

      await this.storeHealthStatus(health)
      logger.error('Database health check error', { error, health })

      return health
    }
  }

  /**
   * Get current database health status
   */
  public async getHealthStatus(): Promise<DatabaseHealth | null> {
    try {
      const healthData = await redisService.get('database:health')
      return healthData ? JSON.parse(healthData) : null
    } catch (error) {
      logger.error('Failed to get database health status', { error })
      return null
    }
  }

  /**
   * Get recent alerts
   */
  public getRecentAlerts(limit: number = 20): DatabaseAlert[] {
    return this.alerts.slice(-limit)
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts = []
    logger.info('Database alerts cleared')
  }

  /**
   * Get database performance metrics
   */
  public async getPerformanceMetrics(): Promise<any> {
    try {
      const queryMetrics = databaseService.getQueryMetrics()
      const connectionPool = await databaseService.getConnectionPoolStatus()
      const healthStatus = await this.getHealthStatus()

      return {
        queryMetrics,
        connectionPool,
        healthStatus,
        alerts: this.getRecentAlerts(10),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Failed to get performance metrics', { error })
      return null
    }
  }

  /**
   * Run database maintenance tasks
   */
  public async runMaintenance(): Promise<void> {
    try {
      logger.info('Starting database maintenance')

      // Reset query metrics if they're getting too large
      const metrics = databaseService.getQueryMetrics()
      if (metrics.totalQueries > 100000) {
        databaseService.resetQueryMetrics()
        logger.info('Query metrics reset due to high count')
      }

      // Clean up old alerts
      if (this.alerts.length > this.maxAlerts) {
        this.alerts = this.alerts.slice(-this.maxAlerts)
        logger.info('Old alerts cleaned up')
      }

      // Clean up old health status entries from Redis
      const keys = await redisService.keys('database:health:*')
      if (keys.length > 100) {
        const oldKeys = keys.slice(0, keys.length - 100)
        for (const key of oldKeys) {
          await redisService.del(key)
        }
        logger.info('Old health status entries cleaned up', { cleaned: oldKeys.length })
      }

      logger.info('Database maintenance completed')
    } catch (error) {
      logger.error('Database maintenance failed', { error })
    }
  }

  /**
   * Store health status in Redis
   */
  private async storeHealthStatus(health: DatabaseHealth): Promise<void> {
    try {
      // Store current health status
      await redisService.setex('database:health', 300, JSON.stringify(health)) // 5 minutes TTL

      // Store historical health status
      const timestamp = Date.now()
      await redisService.setex(
        `database:health:${timestamp}`,
        3600, // 1 hour TTL
        JSON.stringify(health)
      )
    } catch (error) {
      logger.error('Failed to store health status', { error })
    }
  }

  /**
   * Create and store alert
   */
  private async createAlert(alert: DatabaseAlert): Promise<void> {
    try {
      // Add to in-memory alerts
      this.alerts.push(alert)
      
      // Keep only recent alerts in memory
      if (this.alerts.length > this.maxAlerts) {
        this.alerts = this.alerts.slice(-this.maxAlerts)
      }

      // Store alert in Redis
      const alertKey = `database:alert:${Date.now()}`
      await redisService.setex(alertKey, 86400, JSON.stringify(alert)) // 24 hours TTL

      // Log alert
      logger.warn('Database alert created', alert)

      // In production, you might want to send notifications here
      // await this.sendAlertNotification(alert)

    } catch (error) {
      logger.error('Failed to create database alert', { error, alert })
    }
  }

  /**
   * Send alert notification (placeholder for external integrations)
   */
  private async sendAlertNotification(alert: DatabaseAlert): Promise<void> {
    // This would integrate with external services like:
    // - Slack/Discord webhooks
    // - Email notifications
    // - PagerDuty/OpsGenie
    // - Custom monitoring systems
    
    logger.info('Alert notification would be sent', { alert })
  }

  /**
   * Update alert thresholds
   */
  public updateAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds }
    logger.info('Alert thresholds updated', { thresholds: this.alertThresholds })
  }

  /**
   * Get current alert thresholds
   */
  public getAlertThresholds(): typeof this.alertThresholds {
    return { ...this.alertThresholds }
  }
}

export const databaseMonitorService = DatabaseMonitorService.getInstance()