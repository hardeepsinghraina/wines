export const serverConfig = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '2000'), // 2000 requests per window (very lenient)
  
  // Enhanced security settings
  sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  accountLockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '900000'), // 15 minutes
  passwordResetExpiry: parseInt(process.env.PASSWORD_RESET_EXPIRY || '3600000'), // 1 hour
  emailVerificationExpiry: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || '86400000'), // 24 hours
  
  // API security
  apiKeyRequired: process.env.API_KEY_REQUIRED === 'true',
  adminApiKeys: process.env.ADMIN_API_KEYS?.split(',') || [],
  
  // SSL/TLS settings
  sslEnabled: process.env.SSL_ENABLED === 'true',
  sslCertPath: process.env.SSL_CERT_PATH,
  sslKeyPath: process.env.SSL_KEY_PATH,
  
  // Security headers
  hstsDuration: parseInt(process.env.HSTS_DURATION || '31536000'), // 1 year
  contentSecurityPolicy: process.env.CSP_POLICY || "default-src 'self'",
  
  // Monitoring and logging
  logLevel: process.env.LOG_LEVEL || 'info',
  auditLogEnabled: process.env.AUDIT_LOG_ENABLED !== 'false',
  securityMonitoringEnabled: process.env.SECURITY_MONITORING_ENABLED !== 'false',
  
  // Database security
  dbConnectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  dbMaxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  dbSslEnabled: process.env.DB_SSL_ENABLED === 'true',
}

export const isDevelopment = serverConfig.nodeEnv === 'development'
export const isProduction = serverConfig.nodeEnv === 'production'
export const isTest = serverConfig.nodeEnv === 'test'