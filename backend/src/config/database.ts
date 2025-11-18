export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'luxury_wine_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL_ENABLED === 'true' || process.env.NODE_ENV === 'production',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  
  // Enhanced connection pool settings
  minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '2'),
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
  createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '30000'),
  destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000'),
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
  createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL || '200'),
  
  // Query settings
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
  statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
  
  // Monitoring settings
  enableQueryLogging: process.env.DB_ENABLE_QUERY_LOGGING === 'true',
  slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000'),
  
  // Backup and recovery
  backupRetentionDays: parseInt(process.env.DB_BACKUP_RETENTION_DAYS || '7'),
  enableAutoBackup: process.env.DB_ENABLE_AUTO_BACKUP === 'true',
}

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
}