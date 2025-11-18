import { logger } from '../utils/logger';
import { cryptoPaymentService } from './crypto-payment.service';
import { orderService } from './order.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentReconciliationService {
  /**
   * Reconcile payments with orders
   */
  async reconcilePayments(): Promise<{
    processed: number;
    errors: number;
    summary: any;
  }> {
    let processed = 0;
    let errors = 0;
    const summary = {
      completedPayments: 0,
      expiredPayments: 0,
      pendingPayments: 0,
      failedPayments: 0
    };

    try {
      // Get all payments that need reconciliation
      const payments = await prisma.payment.findMany({
        where: {
          status: { in: ['pending', 'confirming'] },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: {
          order: true
        }
      });

      logger.info(`Starting payment reconciliation for ${payments.length} payments`);

      for (const payment of payments) {
        try {
          await this.reconcilePayment(payment);
          processed++;

          // Update summary
          switch (payment.status) {
            case 'completed':
              summary.completedPayments++;
              break;
            case 'expired':
              summary.expiredPayments++;
              break;
            case 'pending':
              summary.pendingPayments++;
              break;
            case 'failed':
              summary.failedPayments++;
              break;
          }

        } catch (error) {
          logger.error('Failed to reconcile payment', {
            paymentId: payment.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          errors++;
        }
      }

      logger.info('Payment reconciliation completed', {
        processed,
        errors,
        summary
      });

      return { processed, errors, summary };

    } catch (error) {
      logger.error('Payment reconciliation failed:', error);
      throw error;
    }
  }

  /**
   * Reconcile individual payment
   */
  private async reconcilePayment(payment: any): Promise<void> {
    try {
      // Check if payment has expired
      if (payment.expiresAt && new Date() > payment.expiresAt) {
        await cryptoPaymentService.updatePaymentStatus(payment.id, 'expired');
        
        // Update order status
        if (payment.order) {
          await orderService.updateOrderStatus(payment.orderId, 'CANCELLED');
        }

        logger.info('Payment marked as expired during reconciliation', {
          paymentId: payment.id,
          orderId: payment.orderId
        });
        return;
      }

      // Verify payment status
      const verification = await cryptoPaymentService.verifyPayment(payment.id);
      
      if (verification.status !== payment.status) {
        await cryptoPaymentService.updatePaymentStatus(
          payment.id, 
          verification.status as any, 
          verification.transactionHash
        );

        // Update order status based on payment status
        if (verification.status === 'completed' && payment.order) {
          await orderService.updateOrderStatus(payment.orderId, 'CONFIRMED');
        } else if (verification.status === 'failed' && payment.order) {
          await orderService.updateOrderStatus(payment.orderId, 'CANCELLED');
        }

        logger.info('Payment status updated during reconciliation', {
          paymentId: payment.id,
          oldStatus: payment.status,
          newStatus: verification.status,
          orderId: payment.orderId
        });
      }

    } catch (error) {
      logger.error('Failed to reconcile individual payment:', error);
      throw error;
    }
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(dateFrom: Date, dateTo: Date): Promise<any> {
    try {
      const [payments, orders] = await Promise.all([
        prisma.payment.findMany({
          where: {
            createdAt: {
              gte: dateFrom,
              lte: dateTo
            }
          },
          include: {
            order: true
          }
        }),
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: dateFrom,
              lte: dateTo
            }
          },
          include: {
            payment: true
          }
        })
      ]);

      // Calculate metrics
      const paymentsByStatus = payments.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalPaymentAmount = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const averagePaymentAmount = payments.length > 0 ? 
        totalPaymentAmount / payments.filter(p => p.status === 'completed').length : 0;

      // Find mismatched orders and payments
      const mismatchedOrders = orders.filter(order => {
        if (!order.payment) return true;
        return order.status === 'CONFIRMED' && order.payment.status !== 'completed';
      });

      const report = {
        period: {
          from: dateFrom,
          to: dateTo
        },
        summary: {
          totalPayments: payments.length,
          totalOrders: orders.length,
          totalAmount: totalPaymentAmount,
          averageAmount: averagePaymentAmount
        },
        paymentsByStatus,
        mismatchedOrders: mismatchedOrders.map(order => ({
          orderId: order.id,
          orderStatus: order.status,
          paymentStatus: order.payment?.status || 'missing',
          amount: order.totalAmount
        })),
        recommendations: this.generateRecommendations(payments, orders)
      };

      logger.info('Reconciliation report generated', {
        period: report.period,
        totalPayments: payments.length,
        mismatches: mismatchedOrders.length
      });

      return report;

    } catch (error) {
      logger.error('Failed to generate reconciliation report:', error);
      throw error;
    }
  }

  /**
   * Generate recommendations based on reconciliation data
   */
  private generateRecommendations(payments: any[], orders: any[]): string[] {
    const recommendations: string[] = [];

    // Check for high failure rate
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const failureRate = payments.length > 0 ? failedPayments / payments.length : 0;
    
    if (failureRate > 0.1) {
      recommendations.push(`High payment failure rate (${(failureRate * 100).toFixed(1)}%). Consider reviewing payment flow.`);
    }

    // Check for expired payments
    const expiredPayments = payments.filter(p => p.status === 'expired').length;
    if (expiredPayments > 0) {
      recommendations.push(`${expiredPayments} payments expired. Consider extending payment timeout or improving user experience.`);
    }

    // Check for pending payments older than 1 hour
    const oldPendingPayments = payments.filter(p => 
      p.status === 'pending' && 
      new Date().getTime() - new Date(p.createdAt).getTime() > 60 * 60 * 1000
    ).length;
    
    if (oldPendingPayments > 0) {
      recommendations.push(`${oldPendingPayments} payments pending for over 1 hour. Manual review recommended.`);
    }

    return recommendations;
  }

  /**
   * Fix mismatched order and payment statuses
   */
  async fixMismatchedStatuses(): Promise<{ fixed: number; errors: number }> {
    let fixed = 0;
    let errors = 0;

    try {
      // Find orders with completed payments but not confirmed status
      const ordersToFix = await prisma.order.findMany({
        where: {
          status: { not: 'CONFIRMED' },
          payment: {
            status: 'completed'
          }
        },
        include: {
          payment: true
        }
      });

      for (const order of ordersToFix) {
        try {
          await orderService.updateOrderStatus(order.id, 'CONFIRMED');
          fixed++;
          
          logger.info('Fixed mismatched order status', {
            orderId: order.id,
            paymentStatus: order.payment?.status,
            oldOrderStatus: order.status,
            newOrderStatus: 'CONFIRMED'
          });

        } catch (error) {
          logger.error('Failed to fix order status', {
            orderId: order.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          errors++;
        }
      }

      return { fixed, errors };

    } catch (error) {
      logger.error('Failed to fix mismatched statuses:', error);
      throw error;
    }
  }
}

export const paymentReconciliationService = new PaymentReconciliationService();