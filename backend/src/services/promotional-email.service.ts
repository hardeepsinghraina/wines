import { PrismaClient } from '@prisma/client'
// Import types locally to avoid path issues
interface PromotionalEmail {
  id: string;
  subject: string;
  content?: string;
  template?: string;
  status: EmailStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  recipients?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  promotionId?: string;
  recipientSegment?: string;
  recipientCount?: number;
}

interface CustomerSegmentInterface {
  id: string;
  name: string;
  criteria: Record<string, any>;
}

enum EmailStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

type CustomerSegment = 'vip_members' | 'all_customers' | 'new_customers' | 'high_value_customers' | string

interface Promotion {
  id: string;
  name: string;
  description: string;
  type?: string;
  discountType?: string;
  discountValue?: number;
  urgencyMessage?: string;
  endDate?: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
  customerTiers?: string[];
  currentUsageCount?: number;
  startDate?: Date;
  isActive?: boolean;
  bannerMessage?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
import { AppError } from '../middleware/joi-validation'
import { logger } from '../utils/logger'

export class PromotionalEmailService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Send promotional email campaign
   */
  async sendPromotionalEmail(
    promotionId: string,
    subject: string,
    template: string,
    recipientSegment: CustomerSegment
  ): Promise<PromotionalEmail> {
    try {
      // Get promotion details
      const promotion = await this.getPromotionById(promotionId)
      if (!promotion) {
        throw new AppError('Promotion not found', 404)
      }

      // Get recipient list based on segment
      const recipients = await this.getRecipientsBySegment(recipientSegment)
      
      const promotionalEmail: PromotionalEmail = {
        id: this.generateId(),
        promotionId,
        subject,
        template: this.buildEmailTemplate(template, promotion),
        recipientSegment,
        scheduledAt: new Date(),
        recipientCount: recipients.length,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        status: EmailStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Send emails to recipients
      await this.sendEmailsToRecipients(recipients, promotionalEmail, promotion)
      
      // Update status to sent
      promotionalEmail.status = EmailStatus.SENT
      promotionalEmail.sentAt = new Date()

      // Store email campaign record
      await this.storePromotionalEmail(promotionalEmail)

      logger.info(`Sent promotional email campaign: ${promotionalEmail.id} to ${recipients.length} recipients`)
      return promotionalEmail
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error sending promotional email:', error)
      throw new AppError('Failed to send promotional email', 500)
    }
  }

  /**
   * Schedule promotional email campaign
   */
  async schedulePromotionalEmail(
    promotionId: string,
    subject: string,
    template: string,
    recipientSegment: CustomerSegment,
    scheduledDate: Date
  ): Promise<PromotionalEmail> {
    try {
      const promotion = await this.getPromotionById(promotionId)
      if (!promotion) {
        throw new AppError('Promotion not found', 404)
      }

      const recipients = await this.getRecipientsBySegment(recipientSegment)
      
      const promotionalEmail: PromotionalEmail = {
        id: this.generateId(),
        promotionId,
        subject,
        template: this.buildEmailTemplate(template, promotion),
        recipientSegment,
        scheduledAt: scheduledDate,
        recipientCount: recipients.length,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        status: EmailStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await this.storePromotionalEmail(promotionalEmail)

      logger.info(`Scheduled promotional email campaign: ${promotionalEmail.id} for ${scheduledDate}`)
      return promotionalEmail
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error scheduling promotional email:', error)
      throw new AppError('Failed to schedule promotional email', 500)
    }
  }

  /**
   * Send flash sale notifications
   */
  async sendFlashSaleNotification(promotionId: string): Promise<void> {
    try {
      const promotion = await this.getPromotionById(promotionId)
      if (!promotion) {
        throw new AppError('Promotion not found', 404)
      }

      // Send to VIP customers first
      await this.sendPromotionalEmail(
        promotionId,
        `🔥 VIP Flash Sale: ${promotion.name}`,
        'flash-sale-vip',
        'vip_members'
      )

      // Wait 30 minutes, then send to all customers
      setTimeout(async () => {
        await this.sendPromotionalEmail(
          promotionId,
          `⚡ Flash Sale Alert: ${promotion.name}`,
          'flash-sale-general',
          'all_customers'
        )
      }, 30 * 60 * 1000) // 30 minutes

      logger.info(`Initiated flash sale notification sequence for promotion: ${promotionId}`)
    } catch (error) {
      logger.error('Error sending flash sale notification:', error)
      throw new AppError('Failed to send flash sale notification', 500)
    }
  }

  /**
   * Send cart abandonment email with promotional offer
   */
  async sendCartAbandonmentPromotion(
    userId: string,
    cartItems: Array<{ productId: string; productName: string; price: number }>,
    promotionCode?: string
  ): Promise<void> {
    try {
      const user = await this.getUserById(userId)
      if (!user) return

      const template = this.buildCartAbandonmentTemplate(cartItems, promotionCode)
      
      await this.sendEmail({
        to: user.email,
        subject: promotionCode 
          ? `Don't forget your cart + Special 10% OFF!`
          : `Your premium wines are waiting...`,
        html: template,
        category: 'cart_abandonment_promotion'
      })

      logger.info(`Sent cart abandonment promotion email to user: ${userId}`)
    } catch (error) {
      logger.error('Error sending cart abandonment promotion:', error)
    }
  }

  /**
   * Send low stock alert with promotional pricing
   */
  async sendLowStockPromotion(productId: string, stock: number): Promise<void> {
    try {
      const product = await this.getProductById(productId)
      if (!product) return

      // Get users who have this product in wishlist or viewed recently
      const interestedUsers = await this.getInterestedUsers(productId)
      
      const template = this.buildLowStockTemplate(product, stock)
      
      for (const user of interestedUsers) {
        await this.sendEmail({
          to: user.email,
          subject: `⚠️ Only ${stock} left: ${product.name}`,
          html: template,
          category: 'low_stock_promotion'
        })
      }

      logger.info(`Sent low stock promotion emails for product: ${productId} to ${interestedUsers.length} users`)
    } catch (error) {
      logger.error('Error sending low stock promotion:', error)
    }
  }

  /**
   * Track email engagement
   */
  async trackEmailEngagement(
    emailId: string,
    eventType: 'open' | 'click' | 'conversion',
    userId?: string
  ): Promise<void> {
    try {
      const email = await this.getPromotionalEmailById(emailId)
      if (!email) return

      // Update engagement metrics
      switch (eventType) {
        case 'open':
          email.openRate = await this.calculateOpenRate(emailId)
          break
        case 'click':
          email.clickRate = await this.calculateClickRate(emailId)
          break
        case 'conversion':
          email.conversionRate = await this.calculateConversionRate(emailId)
          break
      }

      await this.updatePromotionalEmail(email)
      
      // Track individual user engagement
      if (userId) {
        await this.trackUserEngagement(emailId, userId, eventType)
      }

      logger.info(`Tracked ${eventType} for email: ${emailId}`)
    } catch (error) {
      logger.error('Error tracking email engagement:', error)
    }
  }

  // Private helper methods

  private async getPromotionById(id: string): Promise<Promotion | null> {
    // Mock implementation - in real app, query database
    return {
      id,
      name: 'Premium Collection Sale',
      description: '80% off premium wines',
      type: 'flash_sale',
      discountType: 'percentage',
      discountValue: 80,
      applicableProducts: [],
      applicableCategories: [],
      customerTiers: ['bronze', 'silver', 'gold', 'platinum', 'vip'],
      currentUsageCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      bannerMessage: '🔥 80% OFF Premium Collection!',
      urgencyMessage: 'Limited time offer!',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private async getRecipientsBySegment(segment: CustomerSegment): Promise<Array<{ id: string; email: string; name: string }>> {
    // Mock implementation - in real app, query database based on segment
    const mockUsers = [
      { id: '1', email: 'vip@example.com', name: 'VIP Customer' },
      { id: '2', email: 'customer@example.com', name: 'Regular Customer' }
    ]

    switch (segment as CustomerSegment) {
      case 'vip_members':
        return mockUsers.filter(u => u.email.includes('vip'))
      case 'new_customers':
        return mockUsers.slice(0, 1)
      case 'high_value_customers':
        return mockUsers
      default:
        return mockUsers
    }
  }

  private buildEmailTemplate(template: string, promotion: Promotion): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${promotion.name}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B0000, #DC143C); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #fff; }
          .cta-button { display: inline-block; background: #8B0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .discount-badge { background: #FFD700; color: #8B0000; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; }
          .urgency { background: #FFF3CD; border: 1px solid #FFEAA7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍷 Premium Wine Collection</h1>
            <div class="discount-badge">${promotion.discountValue}% OFF</div>
          </div>
          <div class="content">
            <h2>${promotion.name}</h2>
            <p>${promotion.description}</p>
            
            ${promotion.urgencyMessage ? `
              <div class="urgency">
                <strong>⏰ ${promotion.urgencyMessage}</strong>
              </div>
            ` : ''}
            
            <p>Don't miss this exclusive opportunity to add premium wines to your collection at unprecedented prices.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{shop_url}}" class="cta-button">Shop Now</a>
            </div>
            
            <p><small>This offer expires on ${promotion.endDate?.toLocaleDateString() || 'soon'}. Terms and conditions apply.</small></p>
          </div>
        </div>
      </body>
      </html>
    `

    return baseTemplate.replace('{{template_content}}', template)
  }

  private buildCartAbandonmentTemplate(
    cartItems: Array<{ productId: string; productName: string; price: number }>,
    promotionCode?: string
  ): string {
    const itemsHtml = cartItems.map(item => `
      <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
        <h3>${item.productName}</h3>
        <p style="color: #8B0000; font-weight: bold;">$${item.price.toFixed(2)}</p>
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Cart is Waiting</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>🍷 Your Premium Wines Are Waiting...</h1>
          
          ${promotionCode ? `
            <div style="background: #FFD700; color: #8B0000; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <strong>Special Offer: Use code ${promotionCode} for 10% OFF!</strong>
            </div>
          ` : ''}
          
          <p>You left these premium wines in your cart:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
            ${itemsHtml}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{cart_url}}" style="display: inline-block; background: #8B0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Complete Your Purchase
            </a>
          </div>
          
          <p><small>This cart will expire in 24 hours. Secure your wines now!</small></p>
        </div>
      </body>
      </html>
    `
  }

  private buildLowStockTemplate(product: any, stock: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Low Stock Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #FFF3CD; border: 1px solid #FFEAA7; padding: 20px; border-radius: 5px; text-align: center;">
            <h1>⚠️ Low Stock Alert</h1>
            <h2>${product.name}</h2>
            <p style="font-size: 18px; color: #8B0000;"><strong>Only ${stock} bottles remaining!</strong></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{product_url}}" style="display: inline-block; background: #8B0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Secure Your Bottle Now
            </a>
          </div>
          
          <p>This premium wine is selling fast. Don't miss your chance to add it to your collection.</p>
        </div>
      </body>
      </html>
    `
  }

  private async sendEmailsToRecipients(
    recipients: Array<{ id: string; email: string; name: string }>,
    emailCampaign: PromotionalEmail,
    promotion: Promotion
  ): Promise<void> {
    for (const recipient of recipients) {
      try {
        await this.sendEmail({
          to: recipient.email,
          subject: emailCampaign.subject,
          html: (emailCampaign.template || emailCampaign.content || '').replace('{{recipient_name}}', recipient.name),
          category: 'promotional',
          campaignId: emailCampaign.id
        })
      } catch (error) {
        logger.error(`Failed to send email to ${recipient.email}:`, error)
      }
    }
  }

  private async sendEmail(emailData: {
    to: string
    subject: string
    html: string
    category: string
    campaignId?: string
  }): Promise<void> {
    // Mock email sending - in real implementation, use SendGrid, AWS SES, etc.
    logger.info(`Sending email to ${emailData.to}: ${emailData.subject}`)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private async getUserById(id: string): Promise<{ id: string; email: string; name: string } | null> {
    // Mock implementation
    return { id, email: 'user@example.com', name: 'User' }
  }

  private async getProductById(id: string): Promise<{ id: string; name: string; price: number } | null> {
    // Mock implementation
    return { id, name: 'Premium Wine', price: 499.99 }
  }

  private async getInterestedUsers(productId: string): Promise<Array<{ id: string; email: string; name: string }>> {
    // Mock implementation
    return [{ id: '1', email: 'interested@example.com', name: 'Interested Customer' }]
  }

  private async getPromotionalEmailById(id: string): Promise<PromotionalEmail | null> {
    // Mock implementation
    return null
  }

  private async calculateOpenRate(emailId: string): Promise<number> {
    // Mock implementation
    return Math.random() * 30 + 15 // 15-45% open rate
  }

  private async calculateClickRate(emailId: string): Promise<number> {
    // Mock implementation
    return Math.random() * 10 + 5 // 5-15% click rate
  }

  private async calculateConversionRate(emailId: string): Promise<number> {
    // Mock implementation
    return Math.random() * 5 + 2 // 2-7% conversion rate
  }

  private async trackUserEngagement(emailId: string, userId: string, eventType: string): Promise<void> {
    // Mock implementation
    logger.info(`User ${userId} ${eventType} email ${emailId}`)
  }

  private async storePromotionalEmail(email: PromotionalEmail): Promise<void> {
    // Mock implementation
    logger.info(`Stored promotional email: ${email.id}`)
  }

  private async updatePromotionalEmail(email: PromotionalEmail): Promise<void> {
    // Mock implementation
    logger.info(`Updated promotional email: ${email.id}`)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}