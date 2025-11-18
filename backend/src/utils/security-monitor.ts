import { Request } from 'express'
import { logger } from '@/utils/logger'
import { redisService } from '@/services/redis.service'

export enum SecurityEventType {
  FAILED_LOGIN = 'FAILED_LOGIN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  IP_BLOCKED = 'IP_BLOCKED',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT'
}

export interface SecurityEvent {
  type: SecurityEventType
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ip: string
  userAgent?: string | undefined
  userId?: string | undefined
  email?: string | undefined
  endpoint?: string | undefined
  method?: string | undefined
  payload?: any
  timestamp: string
  requestId?: string | undefined
}

class SecurityMonitor {
  private readonly BLOCKED_IP_TTL = 24 * 60 * 60 // 24 hours
  private readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 10
  private readonly BRUTE_FORCE_THRESHOLD = 20
  private readonly MONITORING_WINDOW = 60 * 60 // 1 hour

  /**
   * Safe Redis operation wrapper
   */
  private async safeRedisOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        logger.error('Redis operation failed', { error })
      }
      return fallback
    }
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Store in Redis for real-time monitoring (with error handling)
      try {
        const eventKey = `security_event:${event.type}:${Date.now()}`
        await redisService.setex(eventKey, this.MONITORING_WINDOW, JSON.stringify(event))
      } catch (redisError) {
        // Silently fail Redis operations in development
        if (process.env.NODE_ENV === 'production') {
          logger.error('Redis SETEX error', { error: redisError })
        }
      }

      // Log to application logs
      logger.audit('Security Event', event)

      // Check for patterns that require immediate action
      await this.analyzeSecurityEvent(event)

      // In production, you might want to send to external security monitoring service
      // await this.sendToSecurityService(event)

    } catch (error) {
      logger.error('Failed to log security event', { error, event })
    }
  }

  /**
   * Log failed login attempt
   */
  async logFailedLogin(email: string, ip: string, userAgent?: string, requestId?: string): Promise<void> {
    const event: SecurityEvent = {
      type: SecurityEventType.FAILED_LOGIN,
      severity: 'MEDIUM',
      ip,
      userAgent,
      email,
      timestamp: new Date().toISOString(),
      requestId
    }

    await this.logSecurityEvent(event)
  }

  /**
   * Log suspicious request
   */
  async logSuspiciousRequest(req: Request, reason: string): Promise<void> {
    const event: SecurityEvent = {
      type: SecurityEventType.SUSPICIOUS_REQUEST,
      severity: 'HIGH',
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      endpoint: req.url,
      method: req.method,
      payload: { reason, body: this.sanitizePayload(req.body) },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }

    await this.logSecurityEvent(event)
  }

  /**
   * Log XSS attempt
   */
  async logXSSAttempt(req: Request, maliciousInput: string): Promise<void> {
    const event: SecurityEvent = {
      type: SecurityEventType.XSS_ATTEMPT,
      severity: 'HIGH',
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      endpoint: req.url,
      method: req.method,
      payload: { maliciousInput: maliciousInput.substring(0, 500) }, // Limit payload size
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }

    await this.logSecurityEvent(event)
  }

  /**
   * Log SQL injection attempt
   */
  async logSQLInjectionAttempt(req: Request, maliciousInput: string): Promise<void> {
    const event: SecurityEvent = {
      type: SecurityEventType.SQL_INJECTION_ATTEMPT,
      severity: 'CRITICAL',
      ip: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      endpoint: req.url,
      method: req.method,
      payload: { maliciousInput: maliciousInput.substring(0, 500) },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    }

    await this.logSecurityEvent(event)
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    return this.safeRedisOperation(async () => {
      const blockKey = `blocked_ip:${ip}`
      const blocked = await redisService.get(blockKey)
      return blocked !== null
    }, false)
  }

  /**
   * Block an IP address
   */
  async blockIP(ip: string, reason: string, duration?: number): Promise<void> {
    try {
      const blockKey = `blocked_ip:${ip}`
      const blockData = {
        reason,
        blockedAt: new Date().toISOString(),
        duration: duration || this.BLOCKED_IP_TTL
      }

      await redisService.setex(blockKey, duration || this.BLOCKED_IP_TTL, JSON.stringify(blockData))

      const event: SecurityEvent = {
        type: SecurityEventType.IP_BLOCKED,
        severity: 'HIGH',
        ip,
        payload: { reason, duration },
        timestamp: new Date().toISOString()
      }

      await this.logSecurityEvent(event)

      logger.warn('IP address blocked', { ip, reason, duration })
    } catch (error) {
      logger.error('Failed to block IP address', { ip, reason, error })
    }
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ip: string): Promise<void> {
    try {
      const blockKey = `blocked_ip:${ip}`
      await redisService.del(blockKey)
      logger.info('IP address unblocked', { ip })
    } catch (error) {
      logger.error('Failed to unblock IP address', { ip, error })
    }
  }

  /**
   * Get security events for monitoring dashboard
   */
  async getSecurityEvents(
    type?: SecurityEventType,
    limit: number = 100,
    timeRange: number = 24 * 60 * 60 // 24 hours
  ): Promise<SecurityEvent[]> {
    try {
      const pattern = type ? `security_event:${type}:*` : 'security_event:*'
      const keys = await redisService.keys(pattern)
      
      const events: SecurityEvent[] = []
      const cutoffTime = Date.now() - (timeRange * 1000)

      for (const key of keys.slice(0, limit)) {
        const eventData = await redisService.get(key)
        if (eventData) {
          const event = JSON.parse(eventData) as SecurityEvent
          const eventTime = new Date(event.timestamp).getTime()
          
          if (eventTime >= cutoffTime) {
            events.push(event)
          }
        }
      }

      return events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch (error) {
      logger.error('Failed to get security events', { error })
      return []
    }
  }

  /**
   * Analyze security event for patterns and automatic responses
   */
  private async analyzeSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Check for brute force attacks
      if (event.type === SecurityEventType.FAILED_LOGIN) {
        await this.checkBruteForcePattern(event.ip)
      }

      // Check for suspicious activity patterns
      if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
        await this.checkSuspiciousActivityPattern(event.ip)
      }

      // Auto-block IPs with critical security events
      if (event.type === SecurityEventType.SQL_INJECTION_ATTEMPT) {
        await this.blockIP(event.ip, 'Automatic block: SQL injection attempt', this.BLOCKED_IP_TTL)
      }

    } catch (error) {
      logger.error('Failed to analyze security event', { error, event })
    }
  }

  /**
   * Check for brute force attack patterns
   */
  private async checkBruteForcePattern(ip: string): Promise<void> {
    try {
      const pattern = `security_event:${SecurityEventType.FAILED_LOGIN}:*`
      const keys = await redisService.keys(pattern)
      
      let ipEventCount = 0
      const cutoffTime = Date.now() - (this.MONITORING_WINDOW * 1000)

      for (const key of keys) {
        const eventData = await redisService.get(key)
        if (eventData) {
          const event = JSON.parse(eventData) as SecurityEvent
          const eventTime = new Date(event.timestamp).getTime()
          
          if (event.ip === ip && eventTime >= cutoffTime) {
            ipEventCount++
          }
        }
      }

      if (ipEventCount >= this.BRUTE_FORCE_THRESHOLD) {
        await this.blockIP(ip, `Automatic block: Brute force attack (${ipEventCount} failed attempts)`)
        
        const bruteForceEvent: SecurityEvent = {
          type: SecurityEventType.BRUTE_FORCE_ATTEMPT,
          severity: 'CRITICAL',
          ip,
          payload: { attemptCount: ipEventCount },
          timestamp: new Date().toISOString()
        }
        
        await this.logSecurityEvent(bruteForceEvent)
      }
    } catch (error) {
      logger.error('Failed to check brute force pattern', { ip, error })
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkSuspiciousActivityPattern(ip: string): Promise<void> {
    try {
      const pattern = 'security_event:*'
      const keys = await redisService.keys(pattern)
      
      let suspiciousEventCount = 0
      const cutoffTime = Date.now() - (this.MONITORING_WINDOW * 1000)

      for (const key of keys) {
        const eventData = await redisService.get(key)
        if (eventData) {
          const event = JSON.parse(eventData) as SecurityEvent
          const eventTime = new Date(event.timestamp).getTime()
          
          if (event.ip === ip && eventTime >= cutoffTime && 
              (event.severity === 'HIGH' || event.severity === 'CRITICAL')) {
            suspiciousEventCount++
          }
        }
      }

      if (suspiciousEventCount >= this.SUSPICIOUS_ACTIVITY_THRESHOLD) {
        await this.blockIP(ip, `Automatic block: Suspicious activity pattern (${suspiciousEventCount} events)`)
      }
    } catch (error) {
      logger.error('Failed to check suspicious activity pattern', { ip, error })
    }
  }

  /**
   * Get client IP from request
   */
  private getClientIP(req: Request): string {
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

  /**
   * Sanitize payload for logging (remove sensitive data)
   */
  private sanitizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'privateKey',
      'cardNumber', 'cvv', 'ssn', 'socialSecurityNumber',
      'bankAccount', 'routingNumber', 'walletAddress'
    ]

    const sanitized = { ...payload }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Get security statistics for dashboard
   */
  async getSecurityStats(timeRange: number = 24 * 60 * 60): Promise<any> {
    try {
      const events = await this.getSecurityEvents(undefined, 1000, timeRange)
      
      const stats = {
        totalEvents: events.length,
        eventsByType: {} as Record<string, number>,
        eventsBySeverity: {} as Record<string, number>,
        topIPs: {} as Record<string, number>,
        blockedIPs: 0,
        timeRange: timeRange
      }

      // Count blocked IPs
      const blockedIPKeys = await redisService.keys('blocked_ip:*')
      stats.blockedIPs = blockedIPKeys.length

      // Analyze events
      for (const event of events) {
        // Count by type
        stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1
        
        // Count by severity
        stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1
        
        // Count by IP
        if (event.ip && event.ip !== 'unknown') {
          stats.topIPs[event.ip] = (stats.topIPs[event.ip] || 0) + 1
        }
      }

      return stats
    } catch (error) {
      logger.error('Failed to get security stats', { error })
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        topIPs: {},
        blockedIPs: 0,
        timeRange
      }
    }
  }
}

export const securityMonitor = new SecurityMonitor()