import { emailService } from './email.service';
import { orderTrackingService } from './order-tracking.service';
import { logger } from '../utils/logger';
import { Order, OrderStatus } from '../types/order';

export class OrderNotificationService {
  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      // Send email confirmation
      await emailService.sendOrderConfirmation(order);

      // Log notification
      logger.info('Order confirmation notification sent', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        email: order.user?.email
      });
    } catch (error) {
      logger.error('Failed to send order confirmation notification', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw - notification failure shouldn't break order creation
    }
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdate(order: Order, previousStatus: string): Promise<void> {
    try {
      // Send email notification
      await emailService.sendOrderStatusUpdate(order, previousStatus);

      // Additional notifications based on status
      switch (order.status) {
        case 'SHIPPED':
          await this.handleShippedNotification(order);
          break;
        case 'DELIVERED':
          await this.handleDeliveredNotification(order);
          break;
        case 'CANCELLED':
          await this.handleCancelledNotification(order);
          break;
      }

      logger.info('Order status update notification sent', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        previousStatus,
        email: order.user?.email
      });
    } catch (error) {
      logger.error('Failed to send order status update notification', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw - notification failure shouldn't break status update
    }
  }

  /**
   * Handle shipped order notifications
   */
  private async handleShippedNotification(order: Order): Promise<void> {
    try {
      // Create tracking record if it doesn't exist
      if (!order.shipping?.trackingNumber) {
        const estimatedDelivery = orderTrackingService.calculateEstimatedDelivery(
          'standard', // Default method
          order.shippingAddress?.country || 'US'
        );

        await orderTrackingService.createShippingRecord(order.id, {
          carrier: 'FedEx', // Default carrier
          method: 'Standard',
          isInsured: order.totalAmount > 500,
          insuranceAmount: order.totalAmount > 500 ? order.totalAmount : 0,
          estimatedDelivery
        });
      }

      logger.info('Shipped order notification processed', {
        orderId: order.id,
        orderNumber: order.orderNumber
      });
    } catch (error) {
      logger.error('Error processing shipped order notification', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle delivered order notifications
   */
  private async handleDeliveredNotification(order: Order): Promise<void> {
    try {
      // Update shipping status to delivered
      if (order.shipping?.trackingNumber) {
        await orderTrackingService.updateShippingStatus(
          order.shipping.trackingNumber,
          'DELIVERED' as any
        );
      }

      // Schedule follow-up email (review request, etc.)
      await this.scheduleFollowUpEmail(order);

      logger.info('Delivered order notification processed', {
        orderId: order.id,
        orderNumber: order.orderNumber
      });
    } catch (error) {
      logger.error('Error processing delivered order notification', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle cancelled order notifications
   */
  private async handleCancelledNotification(order: Order): Promise<void> {
    try {
      // Update shipping status if exists
      if (order.shipping?.trackingNumber) {
        await orderTrackingService.updateShippingStatus(
          order.shipping.trackingNumber,
          'EXCEPTION' as any
        );
      }

      logger.info('Cancelled order notification processed', {
        orderId: order.id,
        orderNumber: order.orderNumber
      });
    } catch (error) {
      logger.error('Error processing cancelled order notification', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Schedule follow-up email (placeholder for future implementation)
   */
  private async scheduleFollowUpEmail(order: Order): Promise<void> {
    // This could be implemented with a job queue system like Bull or Agenda
    // For now, just log the intent
    logger.info('Follow-up email scheduled', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
  }

  /**
   * Send bulk notifications for order status changes
   */
  async sendBulkStatusUpdates(orders: Array<{ order: Order; previousStatus: string }>): Promise<void> {
    const promises = orders.map(({ order, previousStatus }) =>
      this.sendOrderStatusUpdate(order, previousStatus)
    );

    try {
      await Promise.allSettled(promises);
      logger.info('Bulk status update notifications processed', {
        count: orders.length
      });
    } catch (error) {
      logger.error('Error processing bulk status updates', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const orderNotificationService = new OrderNotificationService();