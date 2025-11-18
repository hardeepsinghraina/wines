import { logger } from '@/utils/logger'
import { Request, Response } from 'express'

// Performance metrics interface
interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
  unit?: string
}

// Error tracking interface
interface ErrorEvent {
  id: string
  message: string
  stack?: string
  level: 'error' | 'warning' | 'info'
  timestamp: Date
  context?: Record<string, any>
  user?: {
    id?: string
    email?: string
  }
  request?: {
    method: string
    url: string
    headers: Record<string, string>
    body?: any
  }
}

// Business metrics interface
interface BusinessMetric {
  event: string
  value?: number
  properties?: Record<string, any>
  userId?: string
  timestamp: Date
}

class MonitoringService {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorEvent[] = []
  private businessEvents: BusinessMetric[] = []
  private maxStoredItems = 1000

  // Performance monitoring
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      tags: tags || {},
      unit: unit || 'count',
    }

    this.metrics.push(metric)
    this.trimArray(this.metrics, this.maxStoredItems)

    // Log critical performance issues
    if (this.isCriticalMetric(name, value)) {
      logger.warn('Critical performance metric detected', metric)
    }

    // Send to external APM service (e.g., New Relic, DataDog)
    this.sendToAPM(metric)
  }

  // Error tracking
  recordError(error: Error, context?: Record<string, any>, req?: Request): string {
    const errorId = this.generateErrorId()
    
    const errorEvent: ErrorEvent = {
      id: errorId,
      message: error.message,
      stack: error.stack || '',
      level: 'error',
      timestamp: new Date(),
      context: context || {},
    }

    if (req) {
      errorEvent.request = {
        method: req.method,
        url: req.url,
        headers: this.sanitizeHeaders(req.headers),
        body: this.sanitizeBody(req.body),
      }

      // Extract user info if available
      if (req.user) {
        errorEvent.user = {
          id: req.user.id,
          email: req.user.email,
        }
      }
    }

    this.errors.push(errorEvent)
    this.trimArray(this.errors, this.maxStoredItems)

    logger.error('Error recorded', errorEvent)

    // Send to error tracking service (e.g., Sentry)
    this.sendToErrorTracking(errorEvent)

    return errorId
  }

  // Business metrics tracking
  trackBusinessEvent(event: string, properties?: Record<string, any>, userId?: string, value?: number): void {
    const businessMetric: BusinessMetric = {
      event,
      value: value || 0,
      properties: properties || {},
      userId: userId || '',
      timestamp: new Date(),
    }

    this.businessEvents.push(businessMetric)
    this.trimArray(this.businessEvents, this.maxStoredItems)

    logger.info('Business event tracked', businessMetric)

    // Send to analytics service (e.g., Mixpanel, Amplitude)
    this.sendToAnalytics(businessMetric)
  }

  // System health monitoring
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: Record<string, any>
    timestamp: Date
  } {
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    // Calculate recent error rate
    const recentErrors = this.errors.filter(
      error => Date.now() - error.timestamp.getTime() < 300000 // Last 5 minutes
    )
    const errorRate = recentErrors.length / 5 // Errors per minute

    // Calculate average response time
    const recentResponseTimes = this.metrics
      .filter(m => m.name === 'response_time' && Date.now() - m.timestamp.getTime() < 300000)
      .map(m => m.value)
    
    const avgResponseTime = recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length
      : 0

    const metrics = {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
      },
      uptime: Math.round(uptime),
      errorRate,
      avgResponseTime,
      totalErrors: this.errors.length,
      totalMetrics: this.metrics.length,
    }

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (errorRate > 10 || avgResponseTime > 2000 || memUsage.heapUsed > 500 * 1024 * 1024) {
      status = 'unhealthy'
    } else if (errorRate > 5 || avgResponseTime > 1000 || memUsage.heapUsed > 300 * 1024 * 1024) {
      status = 'degraded'
    }

    return {
      status,
      metrics,
      timestamp: new Date(),
    }
  }

  // Get performance statistics
  getPerformanceStats(timeRange: number = 3600000): Record<string, any> { // 1 hour default
    const cutoff = Date.now() - timeRange
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff)

    const stats: Record<string, any> = {}

    // Group metrics by name
    const metricGroups = recentMetrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = []
      }
      groups[metric.name]!.push(metric.value)
      return groups
    }, {} as Record<string, number[]>)

    // Calculate statistics for each metric
    Object.entries(metricGroups).forEach(([name, values]) => {
      stats[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p95: this.percentile(values, 0.95),
        p99: this.percentile(values, 0.99),
      }
    })

    return stats
  }

  // Get error statistics
  getErrorStats(timeRange: number = 3600000): Record<string, any> {
    const cutoff = Date.now() - timeRange
    const recentErrors = this.errors.filter(e => e.timestamp.getTime() > cutoff)

    const errorsByType = recentErrors.reduce((groups, error) => {
      const type = error.message.split(':')[0] || 'Unknown'
      groups[type] = (groups[type] || 0) + 1
      return groups
    }, {} as Record<string, number>)

    return {
      total: recentErrors.length,
      rate: recentErrors.length / (timeRange / 60000), // Per minute
      byType: errorsByType,
    }
  }

  // Private helper methods
  private isCriticalMetric(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      response_time: 2000, // 2 seconds
      memory_usage: 80, // 80%
      cpu_usage: 90, // 90%
      error_rate: 5, // 5%
    }

    return value > (thresholds[name] || Infinity)
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, string> {
    const sanitized = { ...headers }
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]'
      }
    })

    return sanitized
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body

    const sanitized = { ...body }
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard']
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    })

    return sanitized
  }

  private trimArray<T>(array: T[], maxLength: number): void {
    if (array.length > maxLength) {
      array.splice(0, array.length - maxLength)
    }
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * p) - 1
    return sorted[index] || 0
  }

  // External service integrations (mock implementations)
  private async sendToAPM(metric: PerformanceMetric): Promise<void> {
    // Integration with APM service (New Relic, DataDog, etc.)
    if (process.env.APM_ENABLED === 'true') {
      try {
        // Mock implementation - replace with actual APM SDK
        logger.debug('Sending metric to APM', metric)
      } catch (error) {
        logger.error('Failed to send metric to APM', { error, metric })
      }
    }
  }

  private async sendToErrorTracking(error: ErrorEvent): Promise<void> {
    // Integration with error tracking service (Sentry, Bugsnag, etc.)
    if (process.env.ERROR_TRACKING_ENABLED === 'true') {
      try {
        // Mock implementation - replace with actual error tracking SDK
        logger.debug('Sending error to tracking service', error)
      } catch (err) {
        logger.error('Failed to send error to tracking service', { err, error })
      }
    }
  }

  private async sendToAnalytics(event: BusinessMetric): Promise<void> {
    // Integration with analytics service (Mixpanel, Amplitude, etc.)
    if (process.env.ANALYTICS_ENABLED === 'true') {
      try {
        // Mock implementation - replace with actual analytics SDK
        logger.debug('Sending event to analytics', event)
      } catch (error) {
        logger.error('Failed to send event to analytics', { error, event })
      }
    }
  }
}

export const monitoringService = new MonitoringService()

// Express middleware for automatic monitoring
export function monitoringMiddleware() {
  return (req: Request, res: Response, next: Function) => {
    const startTime = Date.now()

    // Track request
    monitoringService.trackBusinessEvent('request', {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
    }, req.user?.id)

    // Monitor response
    res.on('finish', () => {
      const responseTime = Date.now() - startTime
      
      monitoringService.recordMetric('response_time', responseTime, {
        method: req.method,
        path: req.path,
        status: res.statusCode.toString(),
      }, 'ms')

      // Track business events based on endpoints
      if (req.path.includes('/api/orders') && req.method === 'POST') {
        monitoringService.trackBusinessEvent('order_created', {
          path: req.path,
          responseTime,
        }, req.user?.id)
      }

      if (req.path.includes('/api/payments') && req.method === 'POST') {
        monitoringService.trackBusinessEvent('payment_processed', {
          path: req.path,
          responseTime,
        }, req.user?.id)
      }
    })

    next()
  }
}