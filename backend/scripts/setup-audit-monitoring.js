/**
 * Audit Monitoring Setup Script
 * 
 * This script sets up enhanced monitoring and logging for the audit period.
 * It configures detailed logging for checkout flow, cart operations, and payment processing.
 */

const fs = require('fs').promises;
const path = require('path');

// Audit logging configuration
const auditLogConfig = {
  enabled: true,
  logLevel: 'debug',
  logToFile: true,
  logToConsole: true,
  logDirectory: path.join(__dirname, '../logs/audit'),
  categories: {
    cart: true,
    checkout: true,
    payment: true,
    order: true,
    error: true,
    performance: true,
    security: true
  },
  metrics: {
    trackResponseTimes: true,
    trackErrorRates: true,
    trackConversionFunnel: true,
    trackUserBehavior: true
  }
};

/**
 * Create audit log directory
 */
async function createLogDirectory() {
  console.log('📁 Creating audit log directory...');
  
  try {
    await fs.mkdir(auditLogConfig.logDirectory, { recursive: true });
    console.log(`   ✓ Created directory: ${auditLogConfig.logDirectory}`);
  } catch (error) {
    console.error('   ✗ Error creating log directory:', error.message);
    throw error;
  }
}

/**
 * Create audit logger middleware
 */
function generateAuditLoggerMiddleware() {
  return `/**
 * Audit Logger Middleware
 * 
 * Enhanced logging middleware for the checkout payment flow audit.
 * This middleware logs detailed information about requests, responses, and errors.
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const AUDIT_LOG_DIR = path.join(__dirname, '../../logs/audit');
const AUDIT_ENABLED = process.env.AUDIT_MODE === 'true';

interface AuditLogEntry {
  timestamp: string;
  category: string;
  method: string;
  path: string;
  statusCode?: number;
  responseTime?: number;
  userId?: string;
  sessionId?: string;
  cartId?: string;
  orderId?: string;
  error?: string;
  metadata?: any;
}

class AuditLogger {
  private static instance: AuditLogger;
  private logStream: fs.WriteStream | null = null;

  private constructor() {
    if (AUDIT_ENABLED) {
      this.initializeLogStream();
    }
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private initializeLogStream() {
    const logFile = path.join(AUDIT_LOG_DIR, \`audit-\${new Date().toISOString().split('T')[0]}.log\`);
    
    try {
      fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
      this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
    } catch (error) {
      console.error('Failed to initialize audit log stream:', error);
    }
  }

  log(entry: AuditLogEntry) {
    if (!AUDIT_ENABLED || !this.logStream) return;

    const logLine = JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString()
    }) + '\\n';

    this.logStream.write(logLine);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[AUDIT] \${entry.category}: \${entry.method} \${entry.path}\`);
    }
  }

  close() {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}

export const auditLogger = AuditLogger.getInstance();

/**
 * Audit logging middleware
 */
export function auditLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!AUDIT_ENABLED) {
    return next();
  }

  const startTime = Date.now();

  // Determine category based on path
  let category = 'general';
  if (req.path.includes('/cart')) category = 'cart';
  else if (req.path.includes('/checkout') || req.path.includes('/order')) category = 'checkout';
  else if (req.path.includes('/payment')) category = 'payment';
  else if (req.path.includes('/product')) category = 'product';

  // Log request
  auditLogger.log({
    timestamp: new Date().toISOString(),
    category,
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
    sessionId: req.session?.id,
    metadata: {
      query: req.query,
      body: sanitizeBody(req.body),
      headers: sanitizeHeaders(req.headers)
    }
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;

    auditLogger.log({
      timestamp: new Date().toISOString(),
      category,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userId: (req as any).user?.id,
      sessionId: req.session?.id,
      metadata: {
        success: res.statusCode < 400
      }
    });

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Sanitize request body for logging
 */
function sanitizeBody(body: any): any {
  if (!body) return {};

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'creditCard', 'cvv', 'ssn'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitize headers for logging
 */
function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  
  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Log cart operation
 */
export function logCartOperation(
  operation: string,
  cartId: string,
  userId?: string,
  metadata?: any
) {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    category: 'cart',
    method: 'OPERATION',
    path: \`/cart/\${operation}\`,
    userId,
    cartId,
    metadata
  });
}

/**
 * Log checkout step
 */
export function logCheckoutStep(
  step: string,
  orderId: string,
  userId?: string,
  metadata?: any
) {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    category: 'checkout',
    method: 'STEP',
    path: \`/checkout/\${step}\`,
    userId,
    orderId,
    metadata
  });
}

/**
 * Log payment event
 */
export function logPaymentEvent(
  event: string,
  orderId: string,
  paymentMethod: string,
  amount: number,
  currency: string,
  metadata?: any
) {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    category: 'payment',
    method: 'EVENT',
    path: \`/payment/\${event}\`,
    orderId,
    metadata: {
      paymentMethod,
      amount,
      currency,
      ...metadata
    }
  });
}

/**
 * Log error
 */
export function logAuditError(
  category: string,
  error: Error,
  context?: any
) {
  auditLogger.log({
    timestamp: new Date().toISOString(),
    category: 'error',
    method: 'ERROR',
    path: \`/\${category}\`,
    error: error.message,
    metadata: {
      stack: error.stack,
      context
    }
  });
}

// Cleanup on process exit
process.on('exit', () => {
  auditLogger.close();
});

process.on('SIGINT', () => {
  auditLogger.close();
  process.exit(0);
});
`;
}

/**
 * Create audit metrics collector
 */
function generateMetricsCollector() {
  return `/**
 * Audit Metrics Collector
 * 
 * Collects and aggregates metrics during the audit period.
 */

interface MetricEntry {
  timestamp: Date;
  category: string;
  metric: string;
  value: number;
  metadata?: any;
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: MetricEntry[] = [];
  private aggregates: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record a metric
   */
  record(category: string, metric: string, value: number, metadata?: any) {
    this.metrics.push({
      timestamp: new Date(),
      category,
      metric,
      value,
      metadata
    });

    this.updateAggregates(category, metric, value);
  }

  /**
   * Update aggregate statistics
   */
  private updateAggregates(category: string, metric: string, value: number) {
    const key = \`\${category}:\${metric}\`;
    
    if (!this.aggregates.has(key)) {
      this.aggregates.set(key, {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      });
    }

    const agg = this.aggregates.get(key);
    agg.count++;
    agg.sum += value;
    agg.min = Math.min(agg.min, value);
    agg.max = Math.max(agg.max, value);
    agg.avg = agg.sum / agg.count;
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const summary: any = {};

    this.aggregates.forEach((value, key) => {
      const [category, metric] = key.split(':');
      
      if (!summary[category]) {
        summary[category] = {};
      }

      summary[category][metric] = value;
    });

    return summary;
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics() {
    return {
      collectionPeriod: {
        start: this.metrics[0]?.timestamp,
        end: this.metrics[this.metrics.length - 1]?.timestamp
      },
      totalMetrics: this.metrics.length,
      summary: this.getSummary(),
      rawMetrics: this.metrics
    };
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics = [];
    this.aggregates.clear();
  }
}

export const metricsCollector = MetricsCollector.getInstance();

/**
 * Helper functions for common metrics
 */

export function recordPageLoad(page: string, loadTime: number) {
  metricsCollector.record('performance', 'pageLoad', loadTime, { page });
}

export function recordAPICall(endpoint: string, responseTime: number, statusCode: number) {
  metricsCollector.record('performance', 'apiCall', responseTime, { endpoint, statusCode });
}

export function recordCartOperation(operation: string, duration: number) {
  metricsCollector.record('cart', operation, duration);
}

export function recordCheckoutStep(step: string, duration: number) {
  metricsCollector.record('checkout', step, duration);
}

export function recordPaymentProcessing(method: string, duration: number, success: boolean) {
  metricsCollector.record('payment', 'processing', duration, { method, success });
}

export function recordError(category: string, errorType: string) {
  metricsCollector.record('error', errorType, 1, { category });
}

export function recordConversionEvent(event: string, value?: number) {
  metricsCollector.record('conversion', event, value || 1);
}
`;
}

/**
 * Save generated files
 */
async function saveGeneratedFiles() {
  console.log('📝 Generating monitoring files...');
  
  try {
    // Create middleware directory if it doesn't exist
    const middlewareDir = path.join(__dirname, '../src/middleware');
    await fs.mkdir(middlewareDir, { recursive: true });
    
    // Save audit logger middleware
    const loggerPath = path.join(middlewareDir, 'audit-logger.ts');
    await fs.writeFile(loggerPath, generateAuditLoggerMiddleware());
    console.log(`   ✓ Created audit logger middleware: ${loggerPath}`);
    
    // Create utils directory if it doesn't exist
    const utilsDir = path.join(__dirname, '../src/utils');
    await fs.mkdir(utilsDir, { recursive: true });
    
    // Save metrics collector
    const metricsPath = path.join(utilsDir, 'audit-metrics.ts');
    await fs.writeFile(metricsPath, generateMetricsCollector());
    console.log(`   ✓ Created metrics collector: ${metricsPath}`);
    
    // Save configuration
    const configPath = path.join(__dirname, '../audit-config.json');
    await fs.writeFile(configPath, JSON.stringify(auditLogConfig, null, 2));
    console.log(`   ✓ Created audit configuration: ${configPath}`);
    
  } catch (error) {
    console.error('   ✗ Error saving generated files:', error.message);
    throw error;
  }
}

/**
 * Create README for audit setup
 */
async function createAuditReadme() {
  const readme = `# Checkout Payment Flow Audit - Monitoring Setup

## Overview

This directory contains the monitoring and logging setup for the checkout payment flow audit.

## Components

### 1. Audit Logger Middleware
- **File**: \`src/middleware/audit-logger.ts\`
- **Purpose**: Logs all requests, responses, and operations during the audit period
- **Features**:
  - Request/response logging
  - Performance tracking
  - Error logging
  - Sensitive data sanitization

### 2. Metrics Collector
- **File**: \`src/utils/audit-metrics.ts\`
- **Purpose**: Collects and aggregates performance metrics
- **Metrics Tracked**:
  - Page load times
  - API response times
  - Cart operation durations
  - Checkout step durations
  - Payment processing times
  - Error rates
  - Conversion events

### 3. Configuration
- **File**: \`audit-config.json\`
- **Purpose**: Configuration for audit logging and monitoring

## Setup Instructions

### 1. Enable Audit Mode

Add to your \`.env\` file:
\`\`\`
AUDIT_MODE=true
\`\`\`

### 2. Add Middleware to Express App

In \`src/index.ts\`:
\`\`\`typescript
import { auditLoggerMiddleware } from './middleware/audit-logger';

// Add after other middleware
if (process.env.AUDIT_MODE === 'true') {
  app.use(auditLoggerMiddleware);
}
\`\`\`

### 3. Use Logging Functions

In your controllers and services:
\`\`\`typescript
import { logCartOperation, logCheckoutStep, logPaymentEvent } from './middleware/audit-logger';
import { recordCartOperation, recordCheckoutStep } from './utils/audit-metrics';

// Log cart operations
logCartOperation('add', cartId, userId, { productId, quantity });
recordCartOperation('add', duration);

// Log checkout steps
logCheckoutStep('shipping', orderId, userId, { address });
recordCheckoutStep('shipping', duration);

// Log payment events
logPaymentEvent('initiated', orderId, 'BTC', amount, 'EUR');
recordPaymentProcessing('BTC', duration, true);
\`\`\`

## Log Files

Logs are stored in: \`backend/logs/audit/\`

- **Format**: \`audit-YYYY-MM-DD.log\`
- **Content**: JSON lines, one entry per line
- **Rotation**: Daily

## Metrics Export

To export collected metrics:
\`\`\`typescript
import { metricsCollector } from './utils/audit-metrics';

const metrics = metricsCollector.exportMetrics();
console.log(JSON.stringify(metrics, null, 2));
\`\`\`

## Viewing Logs

### Real-time monitoring:
\`\`\`bash
tail -f backend/logs/audit/audit-$(date +%Y-%m-%d).log | jq
\`\`\`

### Filter by category:
\`\`\`bash
cat backend/logs/audit/audit-*.log | jq 'select(.category == "cart")'
\`\`\`

### Analyze response times:
\`\`\`bash
cat backend/logs/audit/audit-*.log | jq 'select(.responseTime) | .responseTime' | awk '{sum+=$1; count++} END {print "Average:", sum/count, "ms"}'
\`\`\`

## Security Notes

- Sensitive data (passwords, tokens, credit cards) is automatically redacted
- Logs should not be committed to version control
- Add \`logs/\` to \`.gitignore\`

## Cleanup

After the audit is complete:

1. Set \`AUDIT_MODE=false\` in \`.env\`
2. Archive log files
3. Export final metrics report
4. Remove or disable audit middleware

## Support

For questions or issues with the audit setup, contact the development team.
`;

  const readmePath = path.join(__dirname, '../AUDIT_MONITORING_README.md');
  await fs.writeFile(readmePath, readme);
  console.log(`   ✓ Created audit monitoring README: ${readmePath}`);
}

/**
 * Main execution
 */
async function setupMonitoring() {
  console.log('🚀 Setting up audit monitoring and logging...\n');

  try {
    // Create log directory
    await createLogDirectory();
    
    // Generate and save monitoring files
    await saveGeneratedFiles();
    
    // Create README
    await createAuditReadme();
    
    console.log('\n✅ Audit monitoring setup complete!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Add AUDIT_MODE=true to your .env file');
    console.log('   2. Add audit middleware to your Express app');
    console.log('   3. Start your backend server');
    console.log('   4. Begin audit testing\n');
    console.log('📖 See AUDIT_MONITORING_README.md for detailed instructions\n');

  } catch (error) {
    console.error('❌ Error setting up monitoring:', error);
    throw error;
  }
}

// Run the setup
setupMonitoring()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
