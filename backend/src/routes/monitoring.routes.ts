import { Router } from 'express'
import { monitoringService } from '@/services/monitoring.service'
import { analyticsService } from '@/services/analytics.service'
import { logger } from '@/utils/logger'
import { authenticateAdmin } from '@/middleware/admin-auth'

const router = Router()

// Health check endpoint (public)
router.get('/health', (req, res) => {
  try {
    const health = monitoringService.getSystemHealth()
    
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: true,
      data: health,
    })
  } catch (error) {
    logger.error('Health check failed', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
      },
    })
  }
})

// Readiness check (public)
router.get('/ready', (req, res) => {
  try {
    // Check database connection, Redis, etc.
    const checks = {
      database: true, // Replace with actual database check
      redis: true,    // Replace with actual Redis check
      external: true, // Replace with external service checks
    }

    const isReady = Object.values(checks).every(Boolean)

    res.status(isReady ? 200 : 503).json({
      success: true,
      data: {
        ready: isReady,
        checks,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Readiness check failed', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'READINESS_CHECK_FAILED',
        message: 'Readiness check failed',
      },
    })
  }
})

// Performance metrics (admin only)
router.get('/metrics', authenticateAdmin, (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000 // 1 hour default
    const stats = monitoringService.getPerformanceStats(timeRange)

    res.json({
      success: true,
      data: {
        timeRange,
        stats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Failed to get performance metrics', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_FAILED',
        message: 'Failed to retrieve performance metrics',
      },
    })
  }
})

// Error statistics (admin only)
router.get('/errors', authenticateAdmin, (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 3600000 // 1 hour default
    const errorStats = monitoringService.getErrorStats(timeRange)

    res.json({
      success: true,
      data: {
        timeRange,
        errorStats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Failed to get error statistics', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'ERROR_STATS_FAILED',
        message: 'Failed to retrieve error statistics',
      },
    })
  }
})

// Analytics dashboard (admin only)
router.get('/analytics/dashboard', authenticateAdmin, (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 86400000 // 24 hours default
    const dashboardData = analyticsService.getDashboardData(timeRange)

    res.json({
      success: true,
      data: {
        timeRange,
        dashboard: dashboardData,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Failed to get analytics dashboard', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_DASHBOARD_FAILED',
        message: 'Failed to retrieve analytics dashboard',
      },
    })
  }
})

// Conversion rates (admin only)
router.get('/analytics/conversions', authenticateAdmin, (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 86400000 // 24 hours default
    const conversions = analyticsService.getConversionRates(timeRange)

    res.json({
      success: true,
      data: {
        timeRange,
        conversions,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Failed to get conversion rates', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSIONS_FAILED',
        message: 'Failed to retrieve conversion rates',
      },
    })
  }
})

// Cohort analysis (admin only)
router.get('/analytics/cohorts', authenticateAdmin, (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 2592000000 // 30 days default
    const cohorts = analyticsService.getCohortAnalysis(timeRange)

    res.json({
      success: true,
      data: {
        timeRange,
        cohorts,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Failed to get cohort analysis', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'COHORTS_FAILED',
        message: 'Failed to retrieve cohort analysis',
      },
    })
  }
})

// Track analytics event (public with rate limiting)
router.post('/analytics/track', (req, res): void => {
  try {
    const { event, properties, userId } = req.body

    if (!event) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EVENT',
          message: 'Event name is required',
        },
      })
      return
    }

    analyticsService.trackEvent(event, userId, properties)

    res.json({
      success: true,
      data: {
        message: 'Event tracked successfully',
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error('Failed to track analytics event', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'TRACK_EVENT_FAILED',
        message: 'Failed to track event',
      },
    })
  }
})

// System information (admin only)
router.get('/system', authenticateAdmin, (req, res) => {
  try {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    const systemInfo = {
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    res.json({
      success: true,
      data: systemInfo,
    })
  } catch (error) {
    logger.error('Failed to get system information', { error })
    res.status(500).json({
      success: false,
      error: {
        code: 'SYSTEM_INFO_FAILED',
        message: 'Failed to retrieve system information',
      },
    })
  }
})

export default router