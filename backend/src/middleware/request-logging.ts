import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { redisService } from '@/services/redis.service'

export interface RequestLog {
  requestId: string
  method: string
  url: string
  path: string
  query: any
  headers: Record<string, string>
  body?: any
  ip: string
  userAgent: string
  userId?: string
  sessionId?: string
  apiVersion?: string
  timestamp: string
  duration?: number
  statusCode?: number
  responseSize?: number
  error?: string
}

export interface RequestMetrics {
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  requestsByMethod: Record<string, number>
  requestsByStatus: Record<string, number>
  requestsByEndpoint: Record<string, number>
  slowRequests: number
  timeRange: string
}

/**
 * Enhanced request logging middleware
 */
export const requestLogging = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()
  const requestId = generateRequestId()
  
  // Add request ID to request object
  req.requestId = requestId
  
  // Add request ID to response headers
  res.set('X-Request-ID', requestId)

  // Capture request details
  const requestLog: RequestLog = {
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: sanitizeHeaders(req.headers as Record<string, string>),
    body: sanitizeBody(req.body),
    ip: getClientIP(req),
    userAgent: req.get('User-Agent') || 'unknown',
    userId: (req as any).user?.id,
    sessionId: req.sessionID || (req as any).sessionId,
    apiVersion: req.apiVersion || 'v1',
    timestamp: new Date().toISOString()
  }

  // Log request start
  if (shouldLogRequest(req)) {
    logger.info('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      ip: requestLog.ip,
      userAgent: requestLog.userAgent,
      userId: requestLog.userId
    })
  }

  // Capture response details
  const originalSend = res.send
  const originalJson = res.json
  let responseBody: any
  let responseSize = 0

  // Override res.send to capture response
  res.send = function(body: any) {
    responseBody = body
    responseSize = Buffer.byteLength(body || '', 'utf8')
    return originalSend.call(this, body)
  }

  // Override res.json to capture response
  res.json = function(body: any) {
    responseBody = body
    responseSize = Buffer.byteLength(JSON.stringify(body || {}), 'utf8')
    return originalJson.call(this, body)
  }

  // Log response when finished
  res.on('finish', async () => {
    const duration = Date.now() - startTime
    
    const completeLog: RequestLog = {
      ...requestLog,
      duration,
      statusCode: res.statusCode,
      responseSize,
      ...(res.statusCode >= 400 && responseBody?.error && {
        error: responseBody.error.message || responseBody.error
      })
    }

    // Log based on status code and duration
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', completeLog)
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', completeLog)
    } else if (duration > 5000) { // Slow request (>5s)
      logger.warn('Slow request detected', completeLog)
    } else if (shouldLogRequest(req)) {
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: formatBytes(responseSize)
      })
    }

    // Store request metrics
    await storeRequestMetrics(completeLog)

    // Store detailed log for debugging (with TTL)
    if (shouldStoreDetailedLog(completeLog)) {
      await storeDetailedLog(completeLog)
    }
  })

  // Handle request errors
  res.on('error', (error) => {
    const duration = Date.now() - startTime
    
    logger.error('Request error', {
      ...requestLog,
      duration,
      error: error.message,
      stack: error.stack
    })
  })

  next()
}

/**
 * Get request metrics for monitoring
 */
export const getRequestMetrics = async (timeRange: string = '1h'): Promise<RequestMetrics> => {
  try {
    const metricsKey = `request_metrics:${timeRange}`
    const metricsData = await redisService.get(metricsKey)
    
    if (metricsData) {
      return JSON.parse(metricsData)
    }

    // Calculate metrics from stored logs
    const logs = await getRecentRequestLogs(timeRange)
    const metrics = calculateMetrics(logs, timeRange)
    
    // Cache metrics for 5 minutes
    await redisService.setex(metricsKey, 300, JSON.stringify(metrics))
    
    return metrics
  } catch (error) {
    logger.error('Failed to get request metrics', { error })
    return getDefaultMetrics(timeRange)
  }
}

/**
 * Get recent request logs
 */
export const getRecentRequestLogs = async (
  timeRange: string = '1h',
  limit: number = 100
): Promise<RequestLog[]> => {
  try {
    const pattern = 'request_log:*'
    const keys = await redisService.keys(pattern)
    const logs: RequestLog[] = []
    
    const cutoffTime = Date.now() - parseTimeRange(timeRange)
    
    for (const key of keys.slice(0, limit)) {
      const logData = await redisService.get(key)
      if (logData) {
        const log = JSON.parse(logData) as RequestLog
        const logTime = new Date(log.timestamp).getTime()
        
        if (logTime >= cutoffTime) {
          logs.push(log)
        }
      }
    }
    
    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    logger.error('Failed to get recent request logs', { error })
    return []
  }
}

/**
 * Search request logs
 */
export const searchRequestLogs = async (
  filters: {
    method?: string
    statusCode?: number
    userId?: string
    ip?: string
    path?: string
    timeRange?: string
  },
  limit: number = 50
): Promise<RequestLog[]> => {
  try {
    const logs = await getRecentRequestLogs(filters.timeRange || '24h', limit * 2)
    
    return logs.filter(log => {
      if (filters.method && log.method !== filters.method) return false
      if (filters.statusCode && log.statusCode !== filters.statusCode) return false
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.ip && log.ip !== filters.ip) return false
      if (filters.path && !log.path.includes(filters.path)) return false
      return true
    }).slice(0, limit)
  } catch (error) {
    logger.error('Failed to search request logs', { error, filters })
    return []
  }
}

// Helper functions

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

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

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token'
  ]
  
  const sanitized: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'privateKey',
    'cardNumber', 'cvv', 'ssn', 'socialSecurityNumber',
    'bankAccount', 'routingNumber'
  ]

  const sanitized = { ...body }

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

function shouldLogRequest(req: Request): boolean {
  // Skip logging for health checks and static assets
  const skipPaths = ['/health', '/favicon.ico', '/robots.txt']
  return !skipPaths.some(path => req.path.includes(path))
}

function shouldStoreDetailedLog(log: RequestLog): boolean {
  // Store detailed logs for errors, slow requests, or admin actions
  return (
    (log.statusCode && log.statusCode >= 400) ||
    (log.duration && log.duration > 2000) ||
    log.path.includes('/admin') ||
    log.path.includes('/api/admin')
  )
}

async function storeRequestMetrics(log: RequestLog): Promise<void> {
  try {
    // Update counters
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const hour = new Date().getHours()
    
    const keys = [
      `metrics:requests:${date}`,
      `metrics:requests:${date}:${hour}`,
      `metrics:methods:${log.method}:${date}`,
      `metrics:status:${log.statusCode}:${date}`,
      `metrics:endpoints:${log.path}:${date}`
    ]
    
    for (const key of keys) {
      await redisService.incr(key)
      await redisService.expire(key, 7 * 24 * 60 * 60) // 7 days TTL
    }
    
    // Store response times for average calculation
    if (log.duration) {
      const responseTimeKey = `metrics:response_times:${date}`
      await redisService.lpush(responseTimeKey, log.duration.toString())
      await redisService.ltrim(responseTimeKey, 0, 999) // Keep last 1000 entries
      await redisService.expire(responseTimeKey, 24 * 60 * 60) // 24 hours TTL
    }
  } catch (error) {
    logger.error('Failed to store request metrics', { error })
  }
}

async function storeDetailedLog(log: RequestLog): Promise<void> {
  try {
    const logKey = `request_log:${log.requestId}`
    await redisService.setex(logKey, 24 * 60 * 60, JSON.stringify(log)) // 24 hours TTL
  } catch (error) {
    logger.error('Failed to store detailed log', { error })
  }
}

function calculateMetrics(logs: RequestLog[], timeRange: string): RequestMetrics {
  const totalRequests = logs.length
  const errorRequests = logs.filter(log => log.statusCode && log.statusCode >= 400).length
  const slowRequests = logs.filter(log => log.duration && log.duration > 2000).length
  
  const responseTimes = logs
    .filter(log => log.duration)
    .map(log => log.duration!)
  
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0

  const requestsByMethod: Record<string, number> = {}
  const requestsByStatus: Record<string, number> = {}
  const requestsByEndpoint: Record<string, number> = {}

  logs.forEach(log => {
    requestsByMethod[log.method] = (requestsByMethod[log.method] || 0) + 1
    
    if (log.statusCode) {
      const statusGroup = `${Math.floor(log.statusCode / 100)}xx`
      requestsByStatus[statusGroup] = (requestsByStatus[statusGroup] || 0) + 1
    }
    
    requestsByEndpoint[log.path] = (requestsByEndpoint[log.path] || 0) + 1
  })

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
    requestsByMethod,
    requestsByStatus,
    requestsByEndpoint,
    slowRequests,
    timeRange
  }
}

function getDefaultMetrics(timeRange: string): RequestMetrics {
  return {
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    requestsByMethod: {},
    requestsByStatus: {},
    requestsByEndpoint: {},
    slowRequests: 0,
    timeRange
  }
}

function parseTimeRange(timeRange: string): number {
  const unit = timeRange.slice(-1)
  const value = parseInt(timeRange.slice(0, -1))
  
  switch (unit) {
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    case 'm': return value * 60 * 1000
    default: return 60 * 60 * 1000 // Default to 1 hour
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string
    }
  }
}