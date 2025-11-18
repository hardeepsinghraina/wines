import { logger } from '../utils/logger';
import { cryptoPaymentService } from './crypto-payment.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentRetryService {
  private readonly maxRetryAttempts: number = 3;
  private readonly retryDelayMs: number = 60000; // 1 minute
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule payment retry for failed payments
   */
  async schedulePaymentRetry(paymentId: string, attempt: number = 1): Promise<void> {
    if (attempt > this.maxRetryAttempts) {
      logger.warn('Maximum retry attempts reached for payment', { paymentId, attempt });
      await this.markPaymentAsFailed(paymentId);
      return;
    }

    const delay = this.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
    
    logger.info('Scheduling payment retry', { paymentId, attempt, delayMs: delay });

    const timer = setTimeout(async () => {
      try {
        await this.retryPaymentVerification(paymentId, attempt);
      } catch (error) {
        logger.error('Error during payment retry:', error);
        await this.schedulePaymentRetry(paymentId, attempt + 1);
      } finally {
        this.retryTimers.delete(paymentId);
      }
    }, delay);

    this.retryTimers.set(paymentId, timer);
  }

  /**
   * Retry payment verification
   */
  private async retryPaymentVerification(paymentId: string, attempt: number): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        logger.warn('Payment not found during retry', { paymentId });
        return;
      }

      if (payment.status !== 'pending') {
        logger.info('Payment status changed, cancelling retry', { 
          paymentId, 
          status: payment.status 
        });
        return;
      }

      // Check if payment has expired
      if (payment.expiresAt && new Date() > payment.expiresAt) {
        await cryptoPaymentService.updatePaymentStatus(paymentId, 'expired');
        return;
      }

      // Attempt to verify payment again
      const verification = await cryptoPaymentService.verifyPayment(paymentId);
      
      if (verification.status === 'completed') {
        logger.info('Payment verification successful on retry', { 
          paymentId, 
          attempt,
          transactionHash: verification.transactionHash 
        });
        return;
      }

      // If still pending, schedule another retry
      if (verification.status === 'pending') {
        await this.schedulePaymentRetry(paymentId, attempt + 1);
      }

    } catch (error) {
      logger.error('Payment retry verification failed', { paymentId, attempt, error });
      throw error;
    }
  }

  /**
   * Mark payment as permanently failed
   */
  private async markPaymentAsFailed(paymentId: string): Promise<void> {
    try {
      await cryptoPaymentService.updatePaymentStatus(paymentId, 'failed');
      
      // Update associated order status
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (payment?.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'CANCELLED' }
        });
      }

      logger.info('Payment marked as failed after max retries', { paymentId });
    } catch (error) {
      logger.error('Failed to mark payment as failed:', error);
    }
  }

  /**
   * Cancel retry for a payment
   */
  cancelPaymentRetry(paymentId: string): void {
    const timer = this.retryTimers.get(paymentId);
    if (timer) {
      clearTimeout(timer);
      this.retryTimers.delete(paymentId);
      logger.info('Payment retry cancelled', { paymentId });
    }
  }

  /**
   * Get retry status for a payment
   */
  getRetryStatus(paymentId: string): { isScheduled: boolean; attempt?: number } {
    return {
      isScheduled: this.retryTimers.has(paymentId)
    };
  }

  /**
   * Cleanup expired retry timers
   */
  cleanup(): void {
    for (const [paymentId, timer] of this.retryTimers.entries()) {
      clearTimeout(timer);
      this.retryTimers.delete(paymentId);
    }
    logger.info('Payment retry service cleaned up');
  }
}

export const paymentRetryService = new PaymentRetryService();