import { PrismaClient } from '@prisma/client'
import { PromotionalEmailService } from './promotional-email.service'
import { logger } from '../utils/logger'

export class PromotionalNotificationService {
  private prisma: PrismaClient
  private emailService: PromotionalEmailService

  constructor() {
    this.prisma = new PrismaClient()
    this.emailService = new PromotionalEmailService()
  }

  /**
   * Send price drop notifications
   */
  async sendPriceDropNotification(productId: string, oldPrice: number, newPrice: number): Promise<void> {
    try {
      const product = await this.getProductById(productId)
      if (!product) return

      const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      
      // Get users who have this product in wishlist
      const wishlistUsers = await this.getWishlistUsers(productId)
      
      for (const user of wishlistUsers) {
        await this.sendPushNotification(user.id, {
          title: `Price Drop Alert! 🔥`,
          body: `${product.name} is now ${discountPercent}% off - Save $${(oldPrice - newPrice).toFixed(2)}!`,
          data: {
            type: 'price_drop',
            productId,
            oldPrice: oldPrice.toString(),
            newPrice: newPrice.toString(),
            url: `/products/${productId}`
          }
        })

        // Also send email notification
        await (this.emailService as any).sendEmail({
          to: user.email,
          subject: `🔥 Price Drop: ${product.name} - ${discountPercent}% OFF!`,
          html: this.buildPriceDropEmailTemplate(product, oldPrice, newPrice, discountPercent),
          category: 'price_drop_notification'
        })
      }

      logger.info(`Sent price drop notifications for product ${productId} to ${wishlistUsers.length} users`)
    } catch (error) {
      logger.error('Error sending price drop notification:', error)
    }
  }

  /**
   * Send flash sale start notifications
   */
  async sendFlashSaleStartNotification(promotionId: string): Promise<void> {
    try {
      const promotion = await this.getPromotionById(promotionId)
      if (!promotion) return

      // Send to VIP users first (early access)
      const vipUsers = await this.getUsersByTier('vip')
      
      for (const user of vipUsers) {
        await this.sendPushNotification(user.id, {
          title: `👑 VIP Early Access: Flash Sale Started!`,
          body: `${promotion.name} - ${promotion.discountValue}% OFF premium wines!`,
          data: {
            type: 'flash_sale_vip',
            promotionId,
            url: '/products?promotion=' + promotionId
          }
        })
      }

      // Schedule general notification 30 minutes later
      setTimeout(async () => {
        const allUsers = await this.getActiveUsers()
        
        for (const user of allUsers) {
          if (user.tier !== 'vip') { // Don't double-notify VIP users
            await this.sendPushNotification(user.id, {
              title: `⚡ Flash Sale Alert!`,
              body: `${promotion.name} - Limited time ${promotion.discountValue}% OFF!`,
              data: {
                type: 'flash_sale_general',
                promotionId,
                url: '/products?promotion=' + promotionId
              }
            })
          }
        }
      }, 30 * 60 * 1000) // 30 minutes

      logger.info(`Initiated flash sale notifications for promotion: ${promotionId}`)
    } catch (error) {
      logger.error('Error sending flash sale notification:', error)
    }
  }

  /**
   * Send stock scarcity notifications
   */
  async sendStockScarcityNotification(productId: string, remainingStock: number): Promise<void> {
    try {
      const product = await this.getProductById(productId)
      if (!product) return

      // Only send if stock is critically low
      if (remainingStock > 5) return

      const interestedUsers = await this.getInterestedUsers(productId)
      
      for (const user of interestedUsers) {
        await this.sendPushNotification(user.id, {
          title: `⚠️ Low Stock Alert!`,
          body: `Only ${remainingStock} left: ${product.name}`,
          data: {
            type: 'low_stock',
            productId,
            remainingStock: remainingStock.toString(),
            url: `/products/${productId}`
          }
        })
      }

      logger.info(`Sent low stock notifications for product ${productId} to ${interestedUsers.length} users`)
    } catch (error) {
      logger.error('Error sending stock scarcity notification:', error)
    }
  }

  /**
   * Send cart abandonment notifications
   */
  async sendCartAbandonmentNotification(userId: string, cartValue: number): Promise<void> {
    try {
      const user = await this.getUserById(userId)
      if (!user) return

      // Send initial reminder after 1 hour
      setTimeout(async () => {
        await this.sendPushNotification(userId, {
          title: `🛒 Don't forget your cart!`,
          body: `$${cartValue.toFixed(2)} worth of premium wines waiting for you`,
          data: {
            type: 'cart_abandonment_1h',
            cartValue: cartValue.toString(),
            url: '/cart'
          }
        })
      }, 60 * 60 * 1000) // 1 hour

      // Send promotional reminder after 24 hours
      setTimeout(async () => {
        await this.sendPushNotification(userId, {
          title: `🎁 Special offer for you!`,
          body: `Complete your purchase and get 10% OFF with code SAVE10`,
          data: {
            type: 'cart_abandonment_24h',
            cartValue: cartValue.toString(),
            promoCode: 'SAVE10',
            url: '/cart'
          }
        })

        // Also send promotional email
        await this.emailService.sendCartAbandonmentPromotion(userId, [], 'SAVE10')
      }, 24 * 60 * 60 * 1000) // 24 hours

      logger.info(`Scheduled cart abandonment notifications for user: ${userId}`)
    } catch (error) {
      logger.error('Error scheduling cart abandonment notification:', error)
    }
  }

  /**
   * Send personalized promotion notifications
   */
  async sendPersonalizedPromotionNotification(
    userId: string,
    promotionId: string,
    personalizedMessage: string
  ): Promise<void> {
    try {
      const user = await this.getUserById(userId)
      const promotion = await this.getPromotionById(promotionId)
      
      if (!user || !promotion) return

      await this.sendPushNotification(userId, {
        title: `🎯 Personalized Offer for You!`,
        body: personalizedMessage,
        data: {
          type: 'personalized_promotion',
          promotionId,
          url: '/products?promotion=' + promotionId
        }
      })

      logger.info(`Sent personalized promotion notification to user: ${userId}`)
    } catch (error) {
      logger.error('Error sending personalized promotion notification:', error)
    }
  }

  /**
   * Send bulk promotion notifications
   */
  async sendBulkPromotionNotification(
    userSegment: 'all' | 'vip' | 'high_value' | 'inactive',
    title: string,
    message: string,
    promotionId?: string
  ): Promise<void> {
    try {
      const users = await this.getUsersBySegment(userSegment)
      
      for (const user of users) {
        await this.sendPushNotification(user.id, {
          title,
          body: message,
          data: {
            type: 'bulk_promotion',
            segment: userSegment,
            promotionId: promotionId || '',
            url: promotionId ? `/products?promotion=${promotionId}` : '/products'
          }
        })
      }

      logger.info(`Sent bulk promotion notifications to ${users.length} users in segment: ${userSegment}`)
    } catch (error) {
      logger.error('Error sending bulk promotion notification:', error)
    }
  }

  /**
   * Track notification engagement
   */
  async trackNotificationEngagement(
    notificationId: string,
    userId: string,
    action: 'delivered' | 'opened' | 'clicked' | 'dismissed'
  ): Promise<void> {
    try {
      // Store engagement data for analytics
      await this.storeNotificationEngagement({
        notificationId,
        userId,
        action,
        timestamp: new Date()
      })

      logger.info(`Tracked notification ${action} for user ${userId}`)
    } catch (error) {
      logger.error('Error tracking notification engagement:', error)
    }
  }

  // Private helper methods

  private async sendPushNotification(userId: string, notification: {
    title: string
    body: string
    data: Record<string, string>
  }): Promise<void> {
    try {
      // Mock push notification sending
      // In real implementation, use Firebase Cloud Messaging, Apple Push Notifications, etc.
      logger.info(`Push notification sent to user ${userId}: ${notification.title}`)
      
      // Store notification for tracking
      await this.storeNotification({
        id: this.generateId(),
        userId,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sentAt: new Date(),
        status: 'sent'
      })
    } catch (error) {
      logger.error(`Failed to send push notification to user ${userId}:`, error)
    }
  }

  private buildPriceDropEmailTemplate(
    product: any,
    oldPrice: number,
    newPrice: number,
    discountPercent: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Price Drop Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B0000, #DC143C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🔥 Price Drop Alert!</h1>
            <div style="background: #FFD700; color: #8B0000; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; display: inline-block;">
              ${discountPercent}% OFF
            </div>
          </div>
          
          <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2>${product.name}</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="text-decoration: line-through; color: #6c757d; font-size: 18px;">$${oldPrice.toFixed(2)}</span>
                  <span style="color: #8B0000; font-size: 24px; font-weight: bold; margin-left: 10px;">$${newPrice.toFixed(2)}</span>
                </div>
                <div style="color: #28a745; font-weight: bold; font-size: 16px;">
                  Save $${(oldPrice - newPrice).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{product_url}}" style="display: inline-block; background: #8B0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Buy Now at Sale Price
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px; text-align: center;">
              This price drop won't last long. Secure your bottle today!
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private async getProductById(id: string): Promise<{ id: string; name: string; price: number } | null> {
    // Mock implementation
    return { id, name: 'Premium Wine', price: 499.99 }
  }

  private async getPromotionById(id: string): Promise<any> {
    // Mock implementation
    return {
      id,
      name: 'Flash Sale',
      discountValue: 80,
      type: 'flash_sale'
    }
  }

  private async getWishlistUsers(productId: string): Promise<Array<{ id: string; email: string; name: string }>> {
    // Mock implementation
    return [{ id: '1', email: 'user@example.com', name: 'User' }]
  }

  private async getUsersByTier(tier: string): Promise<Array<{ id: string; email: string; name: string; tier: string }>> {
    // Mock implementation
    return [{ id: '1', email: 'vip@example.com', name: 'VIP User', tier }]
  }

  private async getActiveUsers(): Promise<Array<{ id: string; email: string; name: string; tier: string }>> {
    // Mock implementation
    return [
      { id: '1', email: 'user1@example.com', name: 'User 1', tier: 'gold' },
      { id: '2', email: 'user2@example.com', name: 'User 2', tier: 'silver' }
    ]
  }

  private async getInterestedUsers(productId: string): Promise<Array<{ id: string; email: string; name: string }>> {
    // Mock implementation
    return [{ id: '1', email: 'interested@example.com', name: 'Interested User' }]
  }

  private async getUserById(id: string): Promise<{ id: string; email: string; name: string } | null> {
    // Mock implementation
    return { id, email: 'user@example.com', name: 'User' }
  }

  private async getUsersBySegment(segment: string): Promise<Array<{ id: string; email: string; name: string }>> {
    // Mock implementation
    const allUsers = [
      { id: '1', email: 'user1@example.com', name: 'User 1' },
      { id: '2', email: 'user2@example.com', name: 'User 2' },
      { id: '3', email: 'vip@example.com', name: 'VIP User' }
    ]

    switch (segment) {
      case 'vip':
        return allUsers.filter(u => u.email.includes('vip'))
      case 'high_value':
        return allUsers.slice(0, 2)
      case 'inactive':
        return allUsers.slice(-1)
      default:
        return allUsers
    }
  }

  private async storeNotificationEngagement(data: {
    notificationId: string
    userId: string
    action: string
    timestamp: Date
  }): Promise<void> {
    // Mock implementation
    logger.info(`Stored notification engagement: ${data.notificationId} - ${data.action}`)
  }

  private async storeNotification(notification: {
    id: string
    userId: string
    title: string
    body: string
    data: Record<string, string>
    sentAt: Date
    status: string
  }): Promise<void> {
    // Mock implementation
    logger.info(`Stored notification: ${notification.id}`)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}