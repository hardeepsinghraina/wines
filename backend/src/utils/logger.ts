import { serverConfig } from '@/config/server'

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  AUDIT = 'AUDIT',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: any
  error?: Error
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (serverConfig.nodeEnv === 'test') return false
    
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(LogLevel.INFO) // Default log level
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    
    let logMessage = `[${timestamp}] ${level}: ${message}`
    
    if (context) {
      logMessage += `\nContext: ${JSON.stringify(context, null, 2)}`
    }
    
    if (error) {
      logMessage += `\nError: ${error.message}`
      if (serverConfig.nodeEnv === 'development') {
        logMessage += `\nStack: ${error.stack}`
      }
    }
    
    return logMessage
  }

  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(error && { error }),
    }

    const formattedLog = this.formatLog(entry)

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog)
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.INFO:
        console.info(formattedLog)
        break
      case LogLevel.DEBUG:
        console.debug(formattedLog)
        break
    }
  }

  error(message: string, context?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  audit(message: string, context?: any): void {
    // Audit logs are always written regardless of log level
    const entry: LogEntry = {
      level: LogLevel.AUDIT,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    }

    const formattedLog = this.formatLog(entry)
    
    // In production, you might want to send audit logs to a separate system
    // For now, we'll use console.info with a special prefix
    console.info(`🔒 AUDIT: ${formattedLog}`)
    
    // Store audit logs in a separate location for compliance
    this.storeAuditLog(entry)
  }

  security(message: string, context?: any): void {
    // Security logs are always written regardless of log level
    const entry: LogEntry = {
      level: LogLevel.SECURITY,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    }

    const formattedLog = this.formatLog(entry)
    console.error(`🛡️ SECURITY: ${formattedLog}`)
    
    // Store security logs for monitoring
    this.storeSecurityLog(entry)
  }

  performance(message: string, context?: any): void {
    const entry: LogEntry = {
      level: LogLevel.PERFORMANCE,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    }

    const formattedLog = this.formatLog(entry)
    
    if (serverConfig.nodeEnv === 'development') {
      console.info(`⚡ PERFORMANCE: ${formattedLog}`)
    }
    
    // Store performance logs for analysis
    this.storePerformanceLog(entry)
  }

  private async storeAuditLog(entry: LogEntry): Promise<void> {
    try {
      // In production, send to external audit logging service
      // For now, we'll store in a local audit log file or database
      if (serverConfig.nodeEnv === 'production') {
        // TODO: Implement external audit logging
        // Examples: AWS CloudTrail, Splunk, ELK Stack, etc.
      }
    } catch (error) {
      console.error('Failed to store audit log:', error)
    }
  }

  private async storeSecurityLog(entry: LogEntry): Promise<void> {
    try {
      // In production, send to security monitoring service
      // For now, we'll store locally
      if (serverConfig.nodeEnv === 'production') {
        // TODO: Implement security monitoring integration
        // Examples: Datadog, New Relic, custom SIEM
      }
    } catch (error) {
      console.error('Failed to store security log:', error)
    }
  }

  private async storePerformanceLog(entry: LogEntry): Promise<void> {
    try {
      // In production, send to performance monitoring service
      if (serverConfig.nodeEnv === 'production') {
        // TODO: Implement performance monitoring integration
        // Examples: New Relic, Datadog APM, custom metrics
      }
    } catch (error) {
      console.error('Failed to store performance log:', error)
    }
  }
}

export const logger = new Logger()