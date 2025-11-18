import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { CryptoPaymentRequest } from '../types/payment';

const prisma = new PrismaClient();

export class PaymentSecurityService {
  private readonly maxPaymentsPerHour = 10;
  private readonly maxPaymentAmount = 50000; // EUR
  private readonly minPaymentAmount = 10; // EUR
  private readonly suspiciousCountries = ['XX', 'YY']; // Add actual country codes as needed

  /**
   * Validate payment request for security issues
   */
  async validatePaymentSecurity(request: CryptoPaymentRequest, userIp?: string): Promise<{
    isValid: boolean;
    reason?: string;
    riskScore: number;
  }> {
    let riskScore = 0;
    const validationResults: string[] = [];

    try {
      // Check payment amount limits
      if (request.amount > this.maxPaymentAmount) {
        validationResults.push('Payment amount exceeds maximum limit');
        riskScore += 50;
      }

      if (request.amount < this.minPaymentAmount) {
        validationResults.push('Payment amount below minimum limit');
        riskScore += 30;
      }

      // Check for suspicious patterns
      const suspiciousPatterns = await this.checkSuspiciousPatterns(request, userIp);
      riskScore += suspiciousPatterns.riskScore;
      validationResults.push(...suspiciousPatterns.issues);

      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit(request.customerEmail || '', userIp || '');
      if (!rateLimitCheck.allowed) {
        validationResults.push('Rate limit exceeded');
        riskScore += 40;
      }

      // Check for duplicate payments
      const duplicateCheck = await this.checkDuplicatePayment(request);
      if (duplicateCheck.isDuplicate) {
        validationResults.push('Potential duplicate payment detected');
        riskScore += 30;
      }

      const isValid = riskScore < 70 && validationResults.length === 0;

      logger.info('Payment security validation completed', {
        orderId: request.orderId,
        riskScore,
        isValid,
        issues: validationResults
      });

      return {
        isValid,
        reason: validationResults.join('; '),
        riskScore
      };

    } catch (error) {
      logger.error('Payment security validation failed:', error);
      return {
        isValid: false,
        reason: 'Security validation failed',
        riskScore: 100
      };
    }
  }

  /**
   * Check for suspicious payment patterns
   */
  private async checkSuspiciousPatterns(request: CryptoPaymentRequest, userIp?: string): Promise<{
    riskScore: number;
    issues: string[];
  }> {
    let riskScore = 0;
    const issues: string[] = [];

    try {
      // Check for rapid successive payments
      const recentPayments = await prisma.payment.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          },
          ...(request.customerEmail && {
            OR: [
              { order: { user: { email: request.customerEmail } } }
              // Add IP-based checking if available
            ]
          })
        }
      });

      if (recentPayments > 5) {
        riskScore += 25;
        issues.push('Multiple payments in short time period');
      }

      // Check for unusual amounts (round numbers might be suspicious)
      if (request.amount % 100 === 0 && request.amount > 1000) {
        riskScore += 10;
        issues.push('Unusual round payment amount');
      }

      // Check for payments at unusual times (e.g., 2-6 AM local time)
      const hour = new Date().getHours();
      if (hour >= 2 && hour <= 6) {
        riskScore += 15;
        issues.push('Payment at unusual time');
      }

      return { riskScore, issues };

    } catch (error) {
      logger.error('Failed to check suspicious patterns:', error);
      return { riskScore: 20, issues: ['Pattern analysis failed'] };
    }
  }

  /**
   * Check rate limiting for payments
   */
  private async checkRateLimit(email: string, ip: string): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const paymentCount = await prisma.payment.count({
        where: {
          createdAt: { gte: oneHourAgo },
          ...(email && {
            OR: [
              { order: { user: { email } } }
              // Add IP-based rate limiting if IP tracking is implemented
            ]
          })
        }
      });

      const allowed = paymentCount < this.maxPaymentsPerHour;
      const remaining = Math.max(0, this.maxPaymentsPerHour - paymentCount);

      return { allowed, remaining };

    } catch (error) {
      logger.error('Rate limit check failed:', error);
      return { allowed: true, remaining: this.maxPaymentsPerHour };
    }
  }

  /**
   * Check for duplicate payment attempts
   */
  private async checkDuplicatePayment(request: CryptoPaymentRequest): Promise<{ isDuplicate: boolean }> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const duplicatePayment = await prisma.payment.findFirst({
        where: {
          orderId: request.orderId,
          amount: request.amount,
          cryptoCurrency: request.cryptoCurrency,
          createdAt: { gte: fiveMinutesAgo },
          status: { in: ['pending', 'confirming', 'completed'] }
        }
      });

      return { isDuplicate: !!duplicatePayment };

    } catch (error) {
      logger.error('Duplicate payment check failed:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(details: {
    type: string;
    orderId?: string;
    paymentId?: string;
    userEmail?: string;
    userIp?: string;
    description: string;
    riskScore: number;
  }): Promise<void> {
    try {
      // In a real implementation, this would store in a security events table
      logger.warn('Suspicious payment activity detected', details);

      // Could also integrate with external fraud detection services here
      
    } catch (error) {
      logger.error('Failed to log suspicious activity:', error);
    }
  }

  /**
   * Block payment if security check fails
   */
  async blockPayment(paymentId: string, reason: string): Promise<void> {
    try {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          // Add blocked reason to a notes field if available
        }
      });

      logger.warn('Payment blocked due to security concerns', {
        paymentId,
        reason
      });

    } catch (error) {
      logger.error('Failed to block payment:', error);
    }
  }

  /**
   * Whitelist trusted users/IPs
   */
  async isWhitelisted(email?: string, ip?: string): Promise<boolean> {
    try {
      // In a real implementation, check against whitelist table
      // For now, return false (no whitelisting)
      return false;
    } catch (error) {
      logger.error('Whitelist check failed:', error);
      return false;
    }
  }

  /**
   * Get security metrics for monitoring
   */
  async getSecurityMetrics(): Promise<{
    blockedPaymentsToday: number;
    suspiciousActivityToday: number;
    averageRiskScore: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [blockedPayments, totalPayments] = await Promise.all([
        prisma.payment.count({
          where: {
            status: 'failed',
            createdAt: { gte: today }
          }
        }),
        prisma.payment.count({
          where: {
            createdAt: { gte: today }
          }
        })
      ]);

      return {
        blockedPaymentsToday: blockedPayments,
        suspiciousActivityToday: 0, // Would come from security events table
        averageRiskScore: 0 // Would be calculated from stored risk scores
      };

    } catch (error) {
      logger.error('Failed to get security metrics:', error);
      return {
        blockedPaymentsToday: 0,
        suspiciousActivityToday: 0,
        averageRiskScore: 0
      };
    }
  }
}

export const paymentSecurityService = new PaymentSecurityService();