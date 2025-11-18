import { logger } from '../utils/logger';
import { cryptoPaymentService } from './crypto-payment.service';
import { paymentReconciliationService } from './payment-reconciliation.service';
import { paymentNotificationService } from './payment-notification.service';

export class PaymentSchedulerService {
  private intervals: NodeJS.Timeout[] = [];

  /**
   * Start all scheduled payment tasks
   */
  start(): void {
    logger.info('Starting payment scheduler service');

    // Cleanup expired payments every 5 minutes
    const cleanupInterval = setInterval(async () => {
      try {
        await cryptoPaymentService.cleanupExpiredPayments();
      } catch (error) {
        logger.error('Scheduled cleanup failed:', error);
      }
    }, 5 * 60 * 1000);

    // Reconcile payments every 15 minutes
    const reconcileInterval = setInterval(async () => {
      try {
        await paymentReconciliationService.reconcilePayments();
      } catch (error) {
        logger.error('Scheduled reconciliation failed:', error);
      }
    }, 15 * 60 * 1000);

    // Fix mismatched statuses every hour
    const fixStatusInterval = setInterval(async () => {
      try {
        const result = await paymentReconciliationService.fixMismatchedStatuses();
        if (result.fixed > 0) {
          logger.info('Fixed mismatched payment statuses', result);
        }
      } catch (error) {
        logger.error('Scheduled status fix failed:', error);
      }
    }, 60 * 60 * 1000);

    // Generate daily reconciliation report at midnight
    const reportInterval = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 5) {
        try {
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const report = await paymentReconciliationService.generateReconciliationReport(
            yesterday,
            now
          );
          logger.info('Daily reconciliation report generated', report.summary);
        } catch (error) {
          logger.error('Daily report generation failed:', error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    this.intervals = [cleanupInterval, reconcileInterval, fixStatusInterval, reportInterval];
    
    logger.info('Payment scheduler service started with 4 scheduled tasks');
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    logger.info('Stopping payment scheduler service');
    
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    
    this.intervals = [];
    logger.info('Payment scheduler service stopped');
  }

  /**
   * Run immediate cleanup and reconciliation
   */
  async runImmediateCleanup(): Promise<void> {
    logger.info('Running immediate payment cleanup and reconciliation');
    
    try {
      await cryptoPaymentService.cleanupExpiredPayments();
      const reconcileResult = await paymentReconciliationService.reconcilePayments();
      const fixResult = await paymentReconciliationService.fixMismatchedStatuses();
      
      logger.info('Immediate cleanup completed', {
        reconciled: reconcileResult.processed,
        fixed: fixResult.fixed,
        errors: reconcileResult.errors + fixResult.errors
      });
    } catch (error) {
      logger.error('Immediate cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    activeIntervals: number;
    startTime?: Date;
  } {
    const status = {
      isRunning: this.intervals.length > 0,
      activeIntervals: this.intervals.length
    };
    
    if (this.intervals.length > 0) {
      return { ...status, startTime: new Date() };
    }
    
    return status;
  }
}

export const paymentSchedulerService = new PaymentSchedulerService();