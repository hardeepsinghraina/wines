import { logger } from '../utils/logger';
import { cryptoPaymentService } from './crypto-payment.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentNotificationService {
  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(paymentId: string): Promise<void> {
    try {
      const receipt = await cryptoPaymentService.generatePaymentReceipt(paymentId);
      
      if (!receipt.customerEmail) {
        logger.warn('No customer email found for payment confirmation', { paymentId });
        return;
      }

      // In a real implementation, this would integrate with an email service
      // For now, we'll log the email content
      const emailContent = this.generatePaymentConfirmationEmail(receipt);
      
      logger.info('Payment confirmation email generated', {
        paymentId,
        customerEmail: receipt.customerEmail,
        orderId: receipt.orderId
      });

      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      console.log('Payment Confirmation Email:', emailContent);

    } catch (error) {
      logger.error('Failed to send payment confirmation:', error);
    }
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(paymentId: string): Promise<void> {
    try {
      const payment = await cryptoPaymentService.getPaymentDetails(paymentId);
      
      if (!payment.order?.user?.email) {
        logger.warn('No customer email found for payment failure notification', { paymentId });
        return;
      }

      const emailContent = this.generatePaymentFailureEmail(payment);
      
      logger.info('Payment failure notification generated', {
        paymentId,
        customerEmail: payment.order.user.email,
        orderId: payment.orderId
      });

      // TODO: Integrate with actual email service
      console.log('Payment Failure Email:', emailContent);

    } catch (error) {
      logger.error('Failed to send payment failure notification:', error);
    }
  }

  /**
   * Send payment timeout warning
   */
  async sendPaymentTimeoutWarning(paymentId: string): Promise<void> {
    try {
      const payment = await cryptoPaymentService.getPaymentDetails(paymentId);
      
      if (!payment.order?.user?.email) {
        logger.warn('No customer email found for payment timeout warning', { paymentId });
        return;
      }

      const emailContent = this.generatePaymentTimeoutEmail(payment);
      
      logger.info('Payment timeout warning generated', {
        paymentId,
        customerEmail: payment.order.user.email,
        orderId: payment.orderId
      });

      // TODO: Integrate with actual email service
      console.log('Payment Timeout Warning Email:', emailContent);

    } catch (error) {
      logger.error('Failed to send payment timeout warning:', error);
    }
  }

  /**
   * Generate payment confirmation email content
   */
  private generatePaymentConfirmationEmail(receipt: any): string {
    return `
      Subject: Payment Confirmation - Order #${receipt.orderNumber}
      
      Dear Customer,
      
      Thank you for your payment! Your cryptocurrency payment has been successfully confirmed.
      
      Payment Details:
      - Receipt ID: ${receipt.receiptId}
      - Order Number: ${receipt.orderNumber}
      - Payment Method: ${receipt.paymentMethod} (${receipt.cryptoCurrency})
      - Amount Paid: ${receipt.cryptoAmount} ${receipt.cryptoCurrency}
      - Fiat Equivalent: €${receipt.fiatAmount}
      - Transaction Hash: ${receipt.transactionHash || 'Pending'}
      - Payment Date: ${receipt.paidAt}
      
      Order Items:
      ${receipt.items.map((item: any) => 
        `- ${item.name} (Qty: ${item.quantity}) - €${item.totalPrice}`
      ).join('\n')}
      
      Total Order Value: €${receipt.totalAmount}
      
      Your order is now being processed and you will receive a shipping confirmation soon.
      
      Best regards,
      The Wine Store Team
    `;
  }

  /**
   * Generate payment failure email content
   */
  private generatePaymentFailureEmail(payment: any): string {
    return `
      Subject: Payment Failed - Order #${payment.order.orderNumber}
      
      Dear Customer,
      
      We're sorry to inform you that your payment for order #${payment.order.orderNumber} has failed.
      
      Payment Details:
      - Payment ID: ${payment.id}
      - Order Number: ${payment.order.orderNumber}
      - Payment Method: Cryptocurrency (${payment.cryptoCurrency})
      - Amount: ${payment.cryptoAmount} ${payment.cryptoCurrency}
      
      What to do next:
      1. Check your wallet balance and ensure you have sufficient funds
      2. Verify the payment address was correct
      3. Try placing a new order with a fresh payment
      4. Contact our support team if you need assistance
      
      If you believe this is an error, please contact our customer support team.
      
      Best regards,
      The Wine Store Team
    `;
  }

  /**
   * Generate payment timeout email content
   */
  private generatePaymentTimeoutEmail(payment: any): string {
    const timeRemaining = payment.expiresAt ? 
      Math.max(0, Math.floor((new Date(payment.expiresAt).getTime() - Date.now()) / 60000)) : 0;

    return `
      Subject: Payment Timeout Warning - Order #${payment.order.orderNumber}
      
      Dear Customer,
      
      Your payment for order #${payment.order.orderNumber} will expire soon.
      
      Payment Details:
      - Payment ID: ${payment.id}
      - Order Number: ${payment.order.orderNumber}
      - Payment Method: Cryptocurrency (${payment.cryptoCurrency})
      - Amount: ${payment.cryptoAmount} ${payment.cryptoCurrency}
      - Time Remaining: ${timeRemaining} minutes
      
      Please complete your payment as soon as possible to avoid cancellation.
      
      Payment Address: ${payment.paymentAddress}
      Amount to Send: ${payment.cryptoAmount} ${payment.cryptoCurrency}
      
      If you have already sent the payment, please allow some time for blockchain confirmation.
      
      Best regards,
      The Wine Store Team
    `;
  }

  /**
   * Schedule timeout warning notification
   */
  async scheduleTimeoutWarning(paymentId: string): Promise<void> {
    try {
      const payment = await cryptoPaymentService.getPaymentDetails(paymentId);
      
      if (!payment.expiresAt) {
        return;
      }

      // Send warning 5 minutes before expiration
      const warningTime = new Date(payment.expiresAt).getTime() - (5 * 60 * 1000);
      const delay = warningTime - Date.now();

      if (delay > 0) {
        setTimeout(async () => {
          await this.sendPaymentTimeoutWarning(paymentId);
        }, delay);

        logger.info('Payment timeout warning scheduled', {
          paymentId,
          warningTime: new Date(warningTime),
          delayMs: delay
        });
      }
    } catch (error) {
      logger.error('Failed to schedule timeout warning:', error);
    }
  }
}

export const paymentNotificationService = new PaymentNotificationService();