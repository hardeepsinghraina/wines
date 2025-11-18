import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { Order } from '../types/order';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      const template = this.generateOrderConfirmationTemplate(order);
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@luxurywines.com',
        to: order.user?.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      logger.info('Order confirmation email sent', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        email: order.user?.email
      });
    } catch (error) {
      logger.error('Failed to send order confirmation email', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(order: Order, previousStatus: string): Promise<void> {
    try {
      const template = this.generateOrderStatusUpdateTemplate(order, previousStatus);
      
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@luxurywines.com',
        to: order.user?.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      logger.info('Order status update email sent', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        previousStatus,
        email: order.user?.email
      });
    } catch (error) {
      logger.error('Failed to send order status update email', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Generate order confirmation email template
   */
  private generateOrderConfirmationTemplate(order: Order): EmailTemplate {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.wine?.name || 'Wine'}</strong><br>
          <small style="color: #666;">
            ${item.wine?.producer} • ${item.wine?.vintage} • ${item.wine?.region}
          </small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.totalPrice.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const shippingAddress = order.shippingAddress;
    const addressHtml = shippingAddress ? `
      <p>
        <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br>
        ${shippingAddress.street}<br>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>
    ` : '';

    const trackingHtml = order.shipping?.trackingNumber ? `
      <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Tracking Number:</strong> ${order.shipping.trackingNumber}<br>
        <strong>Carrier:</strong> ${order.shipping.carrier}<br>
        ${order.shipping.estimatedDelivery ? `<strong>Estimated Delivery:</strong> ${new Date(order.shipping.estimatedDelivery).toLocaleDateString()}` : ''}
      </p>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B0000; margin: 0;">Luxury Wines</h1>
          <p style="color: #666; margin: 5px 0;">Premium Wine Collection</p>
        </div>

        <h2 style="color: #8B0000;">Order Confirmation</h2>
        
        <p>Dear ${order.user?.firstName || 'Valued Customer'},</p>
        
        <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #8B0000;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <h3 style="color: #8B0000;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin: 20px 0;">
          <p><strong>Subtotal: $${order.subtotal.toFixed(2)}</strong></p>
          <p><strong>Shipping: $${order.shippingCost.toFixed(2)}</strong></p>
          <p><strong>Tax: $${order.taxAmount.toFixed(2)}</strong></p>
          <p style="font-size: 18px; color: #8B0000;"><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
        </div>

        <h3 style="color: #8B0000;">Shipping Address</h3>
        ${addressHtml}

        ${trackingHtml}

        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
          <h3 style="margin-top: 0; color: #8B0000;">What's Next?</h3>
          <ul>
            <li>You'll receive an email notification when your order ships</li>
            <li>Track your order status in your account dashboard</li>
            <li>Contact us if you have any questions about your order</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666;">
            Questions? Contact us at <a href="mailto:support@luxurywines.com">support@luxurywines.com</a><br>
            or call us at +1 (555) 123-4567
          </p>
          <p style="color: #666; font-size: 12px;">
            © 2024 Luxury Wines. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Confirmation - Luxury Wines

Dear ${order.user?.firstName || 'Valued Customer'},

Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.

Order Details:
- Order Number: ${order.orderNumber}
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Status: ${order.status}
- Total: $${order.totalAmount.toFixed(2)}

Items Ordered:
${order.items.map(item => `- ${item.wine?.name || 'Wine'} (${item.quantity}x) - $${item.totalPrice.toFixed(2)}`).join('\n')}

Shipping Address:
${shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.street}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}\n${shippingAddress.country}` : 'Not provided'}

${order.shipping?.trackingNumber ? `Tracking Number: ${order.shipping.trackingNumber}` : ''}

Questions? Contact us at support@luxurywines.com or call +1 (555) 123-4567

© 2024 Luxury Wines. All rights reserved.
    `;

    return {
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
      text
    };
  }

  /**
   * Generate order status update email template
   */
  private generateOrderStatusUpdateTemplate(order: Order, previousStatus: string): EmailTemplate {
    const statusMessages = {
      CONFIRMED: 'Your order has been confirmed and is being prepared.',
      PROCESSING: 'Your order is currently being processed and will ship soon.',
      SHIPPED: 'Great news! Your order has been shipped and is on its way.',
      DELIVERED: 'Your order has been delivered. We hope you enjoy your wines!',
      CANCELLED: 'Your order has been cancelled as requested.',
      REFUNDED: 'Your order has been refunded. Please allow 3-5 business days for the refund to appear.'
    };

    const statusMessage = statusMessages[order.status as keyof typeof statusMessages] || 'Your order status has been updated.';

    const trackingHtml = order.shipping?.trackingNumber && order.status === 'SHIPPED' ? `
      <div style="background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d5a2d;">Tracking Information</h3>
        <p><strong>Tracking Number:</strong> ${order.shipping.trackingNumber}</p>
        <p><strong>Carrier:</strong> ${order.shipping.carrier}</p>
        ${order.shipping.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.shipping.estimatedDelivery).toLocaleDateString()}</p>` : ''}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B0000; margin: 0;">Luxury Wines</h1>
          <p style="color: #666; margin: 5px 0;">Premium Wine Collection</p>
        </div>

        <h2 style="color: #8B0000;">Order Status Update</h2>
        
        <p>Dear ${order.user?.firstName || 'Valued Customer'},</p>
        
        <p>${statusMessage}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #8B0000;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
        </div>

        ${trackingHtml}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666;">
            Questions? Contact us at <a href="mailto:support@luxurywines.com">support@luxurywines.com</a><br>
            or call us at +1 (555) 123-4567
          </p>
          <p style="color: #666; font-size: 12px;">
            © 2024 Luxury Wines. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Status Update - Luxury Wines

Dear ${order.user?.firstName || 'Valued Customer'},

${statusMessage}

Order Details:
- Order Number: ${order.orderNumber}
- Status: ${order.status}
- Total: $${order.totalAmount.toFixed(2)}

${order.shipping?.trackingNumber ? `Tracking Number: ${order.shipping.trackingNumber}` : ''}

Questions? Contact us at support@luxurywines.com or call +1 (555) 123-4567

© 2024 Luxury Wines. All rights reserved.
    `;

    return {
      subject: `Order Update - ${order.orderNumber} (${order.status})`,
      html,
      text
    };
  }
}

export const emailService = new EmailService();