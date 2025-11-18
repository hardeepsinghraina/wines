import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { Order, OrderStatus, ShippingStatus } from '../types/order';

const prisma = new PrismaClient();

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: ShippingStatus;
  estimatedDelivery?: Date | undefined;
  actualDelivery?: Date | undefined;
  trackingEvents: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location?: string;
  description: string;
}

export class OrderTrackingService {
  /**
   * Generate tracking number
   */
  generateTrackingNumber(carrier: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const carrierPrefix = carrier.substring(0, 3).toUpperCase();
    return `${carrierPrefix}${timestamp.slice(-8)}${random}`;
  }

  /**
   * Create shipping record for order
   */
  async createShippingRecord(orderId: string, shippingData: {
    carrier: string;
    method: string;
    isInsured: boolean;
    insuranceAmount?: number;
    estimatedDelivery?: Date;
  }): Promise<any> {
    try {
      const trackingNumber = this.generateTrackingNumber(shippingData.carrier);

      const shipping = await prisma.shipping.create({
        data: {
          orderId,
          carrier: shippingData.carrier,
          trackingNumber,
          method: shippingData.method,
          status: 'PENDING',
          estimatedDelivery: shippingData.estimatedDelivery,
          isInsured: shippingData.isInsured,
          insuranceAmount: shippingData.insuranceAmount
        } as any
      });

      logger.info('Shipping record created', {
        orderId,
        trackingNumber,
        carrier: shippingData.carrier
      });

      return shipping;
    } catch (error) {
      logger.error('Error creating shipping record', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update shipping status
   */
  async updateShippingStatus(trackingNumber: string, status: string, location?: string): Promise<void> {
    try {
      // Find shipping record by tracking number
      const shipping = await prisma.shipping.findFirst({
        where: { trackingNumber }
      });

      if (!shipping) {
        throw new Error('Shipping record not found');
      }

      await prisma.shipping.update({
        where: { id: shipping.id },
        data: { 
          status,
          ...(status === 'DELIVERED' && { actualDelivery: new Date() })
        }
      });

      // Create tracking event
      await this.createTrackingEvent(trackingNumber, status, location);

      logger.info('Shipping status updated', {
        trackingNumber,
        status,
        location
      });
    } catch (error) {
      logger.error('Error updating shipping status', {
        trackingNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Create tracking event
   */
  private async createTrackingEvent(trackingNumber: string, status: string, location?: string): Promise<void> {
    const descriptions = {
      PENDING: 'Shipping label created',
      PROCESSING: 'Package is being prepared for shipment',
      SHIPPED: 'Package has been shipped',
      IN_TRANSIT: 'Package is in transit',
      DELIVERED: 'Package has been delivered',
      EXCEPTION: 'Delivery exception occurred'
    };

    try {
      await (prisma as any).trackingEvent.create({
        data: {
          trackingNumber,
          status,
          location: location || null,
          description: descriptions[status as keyof typeof descriptions] || status,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error creating tracking event', {
        trackingNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get tracking information
   */
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      const shipping = await prisma.shipping.findFirst({
        where: { trackingNumber },
        include: {
          trackingEvents: {
            orderBy: { timestamp: 'desc' }
          }
        } as any
      });

      if (!shipping || !shipping.trackingNumber) {
        return null;
      }

      return {
        trackingNumber: shipping.trackingNumber!,
        carrier: (shipping as any).carrier,
        status: shipping.status as ShippingStatus,
        estimatedDelivery: shipping.estimatedDelivery || undefined,
        actualDelivery: shipping.actualDelivery || undefined,
        trackingEvents: (shipping as any).trackingEvents.map((event: any) => ({
          timestamp: event.timestamp,
          status: event.status,
          location: event.location || undefined,
          description: event.description
        }))
      };
    } catch (error) {
      logger.error('Error getting tracking info', {
        trackingNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Calculate estimated delivery date
   */
  calculateEstimatedDelivery(shippingMethod: string, country: string): Date {
    const businessDays = this.getEstimatedBusinessDays(shippingMethod, country);
    const estimatedDate = new Date();
    
    // Add business days (skip weekends)
    let daysAdded = 0;
    while (daysAdded < businessDays) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (estimatedDate.getDay() !== 0 && estimatedDate.getDay() !== 6) {
        daysAdded++;
      }
    }

    return estimatedDate;
  }

  /**
   * Get estimated business days for shipping method and country
   */
  private getEstimatedBusinessDays(shippingMethod: string, country: string): number {
    const domesticDays = {
      'standard': 5,
      'express': 2,
      'overnight': 1,
      'vip': 1
    };

    const internationalDays = {
      'standard': 10,
      'express': 5,
      'vip': 3
    };

    const isDomestic = country === 'US' || country === 'USA';
    const days = isDomestic ? domesticDays : internationalDays;
    
    return days[shippingMethod.toLowerCase() as keyof typeof days] || (isDomestic ? 5 : 10);
  }

  /**
   * Get orders ready for shipping
   */
  async getOrdersReadyForShipping(): Promise<any[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          status: 'CONFIRMED',
          shipping: null // No shipping record yet
        },
        include: {
          items: {
            include: {
              wine: {
                include: {
                  images: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          shippingAddress: true,
          billingAddress: true
        } as any
      });

      return orders;
    } catch (error) {
      logger.error('Error getting orders ready for shipping', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

export const orderTrackingService = new OrderTrackingService();