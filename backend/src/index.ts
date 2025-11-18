import 'module-alias/register'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import './types/express' // Import custom Express types
import { serverConfig, isDevelopment } from '@/config/server'
import { securityHeaders, corsOptions, sanitizeInput, requestLogger, auditLogger } from '@/middleware/security'
import { generalLimiter } from '@/middleware/rateLimiter'
import { errorHandler, notFoundHandler } from '@/middleware/error'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'
import { databaseService } from '@/services/database.service'
import { redisService } from '@/services/redis.service'
import { paymentSchedulerService } from '@/services/payment-scheduler.service'

import { performanceMiddleware, memoryMonitoringMiddleware } from '@/middleware/cache'
import { monitoringMiddleware } from '@/services/monitoring.service'

const app = express()

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(securityHeaders)
app.use(cors(corsOptions))

// Rate limiting
app.use(generalLimiter)

// Request parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Input sanitization and security monitoring
app.use(sanitizeInput)

// Session management with Redis (temporarily disabled)
// app.use(sessionConfig)

// Simple session ID middleware for guest users
app.use((req, res, next) => {
  if (!req.sessionId && !req.user) {
    // Generate a simple session ID for guest users
    req.sessionId = req.headers['x-session-id'] as string || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  next()
})

// Performance monitoring middleware
app.use(performanceMiddleware)
app.use(memoryMonitoringMiddleware)
app.use(monitoringMiddleware())

// Logging middleware
if (isDevelopment) {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}
app.use(requestLogger)

// Audit logging for financial transactions
app.use(auditLogger)

// Health check endpoints
const healthCheckHandler = async (req: express.Request, res: express.Response) => {
  const dbHealthy = await databaseService.healthCheck()
  const redisHealthy = await redisService.healthCheck()
  
  const overallStatus = dbHealthy && redisHealthy ? 'OK' : 'DEGRADED'
  
  ResponseHelper.success(res, {
    status: overallStatus,
    message: 'Luxury Wine Crypto E-commerce API is running',
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv,
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy ? 'healthy' : 'unhealthy',
    },
  })
}

// Health check endpoints - both /health and /api/health
app.get('/health', healthCheckHandler)
app.get('/api/health', healthCheckHandler)

// API base endpoint
app.get('/api', (req, res) => {
  ResponseHelper.success(res, {
    message: 'Luxury Wine Crypto E-commerce API',
    version: '1.0.0',
    documentation: '/api/docs',
  })
})

// API routes
import authRoutes from '@/routes/auth.routes'
import adminAuthRoutes from '@/routes/admin-auth.routes'
import adminProductRoutes from '@/routes/admin-product.routes'
// import adminProductAdvancedRoutes from '@/routes/admin-product-advanced.routes'
import adminOrderRoutes from '@/routes/admin-order.routes'
import adminCustomerRoutes from '@/routes/admin-customer.routes'
import { productRoutes } from '@/routes/product.routes'
import cartRoutes from '@/routes/cart.routes'
import orderRoutes from '@/routes/order.routes'
import { paymentRoutes } from '@/routes/payment.routes'
import { shippingRoutes } from '@/routes/shipping.routes'
import { shippingProviderRoutes } from '@/routes/shipping-provider.routes'
import nftRoutes from '@/routes/nft.routes'
import privateSalesRoutes from '@/routes/private-sales.routes'
import affiliateRoutes from '@/routes/affiliate.routes'
import gdprRoutes from '@/routes/gdpr.routes'
import monitoringRoutes from '@/routes/monitoring.routes'
import { contactRoutes } from '@/routes/contact.routes'
import checkoutAnalyticsRoutes from '@/routes/checkout-analytics.routes'
import promotionalPricingRoutes from '@/routes/promotional-pricing.routes'
import inventoryRoutes from '@/routes/inventory.routes'
// import adminPanelRoutes from '@/routes/admin-panel.routes'

app.use('/api/auth', authRoutes)
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin/products', adminProductRoutes)
// app.use('/api/admin/products-advanced', adminProductAdvancedRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/admin/customers', adminCustomerRoutes)
// app.use('/api/admin', adminPanelRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/shipping', shippingRoutes)
app.use('/api/shipping-provider', shippingProviderRoutes)
app.use('/api/nft', nftRoutes)
app.use('/api/private-sales', privateSalesRoutes)
app.use('/api/affiliate', affiliateRoutes)
app.use('/api/gdpr', gdprRoutes)
app.use('/api/monitoring', monitoringRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/checkout-analytics', checkoutAnalyticsRoutes)
app.use('/api/promotional-pricing', promotionalPricingRoutes)
app.use('/api/inventory', inventoryRoutes)

// 404 handler for unmatched routes
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  paymentSchedulerService.stop()
  await databaseService.disconnect()
  await redisService.disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  paymentSchedulerService.stop()
  await databaseService.disconnect()
  await redisService.disconnect()
  process.exit(0)
})

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason })
  process.exit(1)
})

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack })
  process.exit(1)
})

// Initialize connections and start server
async function startServer() {
  try {
    // Connect to database
    await databaseService.connect()
    
    // Connect to Redis
    await redisService.connect()
    
    // Start payment scheduler
    paymentSchedulerService.start()
    
    // Start server
    app.listen(serverConfig.port, () => {
      logger.info(`Server is running on port ${serverConfig.port}`, {
        environment: serverConfig.nodeEnv,
        port: serverConfig.port,
      })
    })
  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

startServer()