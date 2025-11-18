import { PrismaClient } from '@prisma/client'
import {
  PromotionalPricing,
  Promotion,
  DiscountCode,
  BulkPricingTier,
  VIPPricingTier,
  PromotionalAnalytics,
  CreatePromotionRequest,
  CreateDiscountCodeRequest,
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  PromotionalPricingResponse,
  PriceCalculation,
  PromotionType,
  DiscountType,
  CustomerTier
} from '../types/promotional-pricing'
import { AppError } from '../middleware/joi-validation'
import { logger } from '../utils/logger'

export class PromotionalPricingService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Get promotional pricing for a product
   */
  async getPromotionalPricing(
    productId: string,
    customerTier?: CustomerTier,
    quantity: number = 1
  ): Promise<PromotionalPricingResponse> {
    try {
      const wine = await this.prisma.wine.findUnique({
        where: { id: productId },
        include: {
          prices: true,
          inventory: true
        }
      })

      if (!wine) {
        throw new AppError('Product not found', 404)
      }

      const originalPrice = wine.originalPrice
      let currentPrice = wine.currentPrice
      let discountAmount = originalPrice - currentPrice
      let discountPercent = wine.discountPercent || 0
      let promotionName = '80% Off Premium Collection'

      // Check for active promotions
      const activePromotions = await this.getActivePromotions(productId, customerTier)
      let bestPromotion: Promotion | null = null
      let bestDiscount = discountAmount

      for (const promotion of activePromotions) {
        const promotionDiscount = this.calculatePromotionDiscount(
          originalPrice,
          promotion,
          quantity
        )

        if (promotionDiscount > bestDiscount) {
          bestDiscount = promotionDiscount
          bestPromotion = promotion
          promotionName = promotion.name
        }
      }

      // Apply best discount
      if (bestDiscount > discountAmount) {
        discountAmount = bestDiscount
        currentPrice = originalPrice - discountAmount
        discountPercent = (discountAmount / originalPrice) * 100
      }

      // Get stock information for scarcity indicators
      const totalStock = wine.inventory?.reduce((sum: number, inv: any) => sum + inv.availableQty, 0) || wine.stock
      const stockScarcity = this.getStockScarcityInfo(totalStock)

      // Get bulk pricing tiers
      const bulkPricing = await this.getBulkPricingTiers(productId, originalPrice)

      // Get VIP pricing if applicable
      const vipPricing = customerTier ? await this.getVIPPricing(productId, customerTier, originalPrice) : undefined

      const response: any = {
        productId,
        originalPrice,
        currentPrice,
        discountAmount,
        discountPercent: Math.round(discountPercent),
        savings: discountAmount,
        promotionName,
        bulkPricing
      }

      const urgencyMsg = this.getUrgencyMessage(bestPromotion)
      if (urgencyMsg) {
        response.urgencyMessage = urgencyMsg
      }

      if (stockScarcity) {
        response.stockScarcity = stockScarcity
      }

      if (vipPricing) {
        response.vipPricing = vipPricing
      }

      return response
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error getting promotional pricing:', error)
      throw new AppError('Failed to get promotional pricing', 500)
    }
  }

  /**
   * Create a new promotion
   */
  async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
    try {
      // Validate promotion data
      this.validatePromotionData(data)

      const promotion: any = {
        id: this.generateId(),
        name: data.name,
        description: data.description,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount || 0,
        minOrderAmount: data.minOrderAmount || 0,
        applicableProducts: data.applicableProducts,
        applicableCategories: data.applicableCategories,
        customerTiers: data.customerTiers,
        currentUsageCount: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: true,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add optional fields only if they have values
      if (data.totalUsageLimit) {
        promotion.totalUsageLimit = data.totalUsageLimit
      }
      if (data.perCustomerLimit) {
        promotion.perCustomerLimit = data.perCustomerLimit
      }
      if (data.bannerMessage) {
        promotion.bannerMessage = data.bannerMessage
      }
      if (data.emailSubject) {
        promotion.emailSubject = data.emailSubject
      }
      if (data.urgencyMessage) {
        promotion.urgencyMessage = data.urgencyMessage
      }

      // Store in cache/database (simplified for demo)
      await this.storePromotion(promotion)

      logger.info(`Created promotion: ${promotion.name}`)
      return promotion
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error creating promotion:', error)
      throw new AppError('Failed to create promotion', 500)
    }
  }

  /**
   * Create a discount code
   */
  async createDiscountCode(data: CreateDiscountCodeRequest): Promise<DiscountCode> {
    try {
      // Check if code already exists
      const existingCode = await this.getDiscountCodeByCode(data.code)
      if (existingCode) {
        throw new AppError('Discount code already exists', 400)
      }

      const discountCode: any = {
        id: this.generateId(),
        code: data.code.toUpperCase(),
        name: data.name,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount || 0,
        minOrderAmount: data.minOrderAmount || 0,
        applicableProducts: data.applicableProducts,
        applicableCategories: [],
        customerTiers: data.customerTiers,
        currentUsageCount: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: true,
        usageCount: 0,
        revenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add optional fields only if they have values
      if (data.description) {
        discountCode.description = data.description
      }
      if (data.totalUsageLimit) {
        discountCode.totalUsageLimit = data.totalUsageLimit
      }
      if (data.perCustomerLimit) {
        discountCode.perCustomerLimit = data.perCustomerLimit
      }

      await this.storeDiscountCode(discountCode)

      logger.info(`Created discount code: ${discountCode.code}`)
      return discountCode
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error creating discount code:', error)
      throw new AppError('Failed to create discount code', 500)
    }
  }

  /**
   * Apply discount to cart
   */
  async applyDiscount(data: ApplyDiscountRequest): Promise<ApplyDiscountResponse> {
    try {
      const originalTotal = data.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      let discountAmount = 0
      let appliedPromotion: Promotion | null = null
      let appliedDiscountCode: DiscountCode | null = null

      if (data.code) {
        // Apply discount code
        const discountCode = await this.getDiscountCodeByCode(data.code)
        if (!discountCode) {
          return {
            success: false,
            discountAmount: 0,
            discountPercent: 0,
            originalTotal,
            discountedTotal: originalTotal,
            savings: 0,
            error: 'Invalid discount code'
          }
        }

        const validation = this.validateDiscountCode(discountCode, data)
        if (!validation.isValid) {
          return {
            success: false,
            discountAmount: 0,
            discountPercent: 0,
            originalTotal,
            discountedTotal: originalTotal,
            savings: 0,
            error: validation.errors[0] || 'Validation failed'
          }
        }

        discountAmount = this.calculateDiscountAmount(originalTotal, discountCode.discountType, discountCode.discountValue, discountCode.maxDiscountAmount)
        appliedDiscountCode = discountCode
      } else if (data.promotionId) {
        // Apply promotion
        const promotion = await this.getPromotionById(data.promotionId)
        if (!promotion) {
          return {
            success: false,
            discountAmount: 0,
            discountPercent: 0,
            originalTotal,
            discountedTotal: originalTotal,
            savings: 0,
            error: 'Invalid promotion'
          }
        }

        discountAmount = this.calculateDiscountAmount(originalTotal, promotion.discountType, promotion.discountValue, promotion.maxDiscountAmount)
        appliedPromotion = promotion
      }

      const discountedTotal = Math.max(0, originalTotal - discountAmount)
      const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0

      return {
        success: true,
        discountAmount,
        discountPercent: Math.round(discountPercent),
        originalTotal,
        discountedTotal,
        savings: discountAmount,
        ...(appliedPromotion && { appliedPromotion }),
        ...(appliedDiscountCode && { appliedDiscountCode }),
        message: `You saved $${discountAmount.toFixed(2)}!`
      }
    } catch (error) {
      logger.error('Error applying discount:', error)
      return {
        success: false,
        discountAmount: 0,
        discountPercent: 0,
        originalTotal: data.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        discountedTotal: data.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        savings: 0,
        error: 'Failed to apply discount'
      }
    }
  }

  /**
   * Get bulk pricing tiers for a product
   */
  async getBulkPricingTiers(productId: string, originalPrice: number): Promise<BulkPricingTier[]> {
    // Default bulk pricing tiers (80% off structure)
    const tiers: BulkPricingTier[] = [
      {
        id: `${productId}-bulk-1`,
        wineId: productId,
        minQuantity: 3,
        maxQuantity: 5,
        discountPercent: 85, // Additional 5% off for bulk
        tierName: '3-5 bottles',
        unitPrice: originalPrice * 0.15, // 85% off
        totalSavings: originalPrice * 0.85,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `${productId}-bulk-2`,
        wineId: productId,
        minQuantity: 6,
        maxQuantity: 11,
        discountPercent: 87, // Additional 7% off for bulk
        tierName: '6-11 bottles',
        unitPrice: originalPrice * 0.13, // 87% off
        totalSavings: originalPrice * 0.87,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `${productId}-bulk-3`,
        wineId: productId,
        minQuantity: 12,
        discountPercent: 90, // Additional 10% off for bulk
        tierName: '12+ bottles',
        unitPrice: originalPrice * 0.10, // 90% off
        totalSavings: originalPrice * 0.90,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return tiers
  }

  /**
   * Get VIP pricing for a customer tier
   */
  async getVIPPricing(productId: string, customerTier: CustomerTier, originalPrice: number) {
    const vipDiscounts = {
      bronze: 2, // Additional 2% off
      silver: 5, // Additional 5% off
      gold: 8, // Additional 8% off
      platinum: 12, // Additional 12% off
      vip: 15 // Additional 15% off
    }

    const additionalDiscount = vipDiscounts[customerTier as keyof typeof vipDiscounts] || 0
    const totalDiscount = 80 + additionalDiscount // Base 80% + VIP bonus
    const vipPrice = originalPrice * (1 - totalDiscount / 100)

    return {
      tier: customerTier,
      discountPercent: totalDiscount,
      vipPrice
    }
  }

  /**
   * Get promotional analytics
   */
  async getPromotionalAnalytics(promotionId: string): Promise<PromotionalAnalytics> {
    try {
      // Enhanced analytics with real-time data
      const analytics = await this.calculatePromotionalMetrics(promotionId)

      return {
        promotionId,
        impressions: analytics.impressions,
        clicks: analytics.clicks,
        conversions: analytics.conversions,
        revenue: analytics.revenue,
        viewToClick: analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0,
        clickToConversion: analytics.clicks > 0 ? (analytics.conversions / analytics.clicks) * 100 : 0,
        overallConversion: analytics.impressions > 0 ? (analytics.conversions / analytics.impressions) * 100 : 0,
        newCustomers: analytics.newCustomers,
        returningCustomers: analytics.returningCustomers,
        averageOrderValue: analytics.conversions > 0 ? analytics.revenue / analytics.conversions : 0,
        dailyMetrics: await this.getDailyMetrics(promotionId),
        topPerformingProducts: await this.getTopPerformingProducts(promotionId),
        updatedAt: new Date()
      }
    } catch (error) {
      logger.error('Error getting promotional analytics:', error)
      throw new AppError('Failed to get promotional analytics', 500)
    }
  }

  /**
   * Track promotional event (impression, click, conversion)
   */
  async trackPromotionalEvent(
    promotionId: string,
    eventType: 'impression' | 'click' | 'conversion',
    userId?: string,
    productId?: string,
    revenue?: number
  ): Promise<void> {
    try {
      const eventData = {
        promotionId,
        eventType,
        userId,
        productId,
        revenue,
        timestamp: new Date()
      }

      // Store event for analytics
      await this.storePromotionalEvent({
        promotionId,
        eventType,
        userId: userId || '',
        productId: productId || '',
        revenue: revenue || 0,
        timestamp: new Date()
      })

      // Update real-time metrics
      await this.updatePromotionalMetrics(promotionId, eventType, revenue)

      logger.info(`Tracked promotional ${eventType} for promotion: ${promotionId}`)
    } catch (error) {
      logger.error('Error tracking promotional event:', error)
    }
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(promotionId: string): Promise<{
    impressions: number
    clicks: number
    addToCarts: number
    checkouts: number
    conversions: number
    dropOffRates: {
      impressionToClick: number
      clickToCart: number
      cartToCheckout: number
      checkoutToConversion: number
    }
  }> {
    try {
      const metrics = await this.calculatePromotionalMetrics(promotionId)
      const addToCarts = Math.floor(metrics.clicks * 0.3) // Mock 30% add to cart rate
      const checkouts = Math.floor(addToCarts * 0.6) // Mock 60% checkout rate

      return {
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        addToCarts,
        checkouts,
        conversions: metrics.conversions,
        dropOffRates: {
          impressionToClick: metrics.impressions > 0 ? ((metrics.impressions - metrics.clicks) / metrics.impressions) * 100 : 0,
          clickToCart: metrics.clicks > 0 ? ((metrics.clicks - addToCarts) / metrics.clicks) * 100 : 0,
          cartToCheckout: addToCarts > 0 ? ((addToCarts - checkouts) / addToCarts) * 100 : 0,
          checkoutToConversion: checkouts > 0 ? ((checkouts - metrics.conversions) / checkouts) * 100 : 0
        }
      }
    } catch (error) {
      logger.error('Error getting conversion funnel:', error)
      throw new AppError('Failed to get conversion funnel', 500)
    }
  }

  /**
   * Get promotional ROI analysis
   */
  async getPromotionalROI(promotionId: string): Promise<{
    totalRevenue: number
    totalDiscount: number
    netRevenue: number
    roi: number
    costPerAcquisition: number
    customerLifetimeValue: number
  }> {
    try {
      const metrics = await this.calculatePromotionalMetrics(promotionId)
      const totalDiscount = metrics.conversions * 200 // Average discount per conversion
      const marketingCost = 5000 // Mock marketing spend
      const netRevenue = metrics.revenue - totalDiscount - marketingCost
      const roi = marketingCost > 0 ? (netRevenue / marketingCost) * 100 : 0
      const costPerAcquisition = metrics.conversions > 0 ? marketingCost / metrics.conversions : 0

      return {
        totalRevenue: metrics.revenue,
        totalDiscount,
        netRevenue,
        roi,
        costPerAcquisition,
        customerLifetimeValue: 1500 // Mock CLV
      }
    } catch (error) {
      logger.error('Error getting promotional ROI:', error)
      throw new AppError('Failed to get promotional ROI', 500)
    }
  }

  // Private helper methods

  private async getActivePromotions(productId: string, customerTier?: CustomerTier): Promise<Promotion[]> {
    // Mock active promotions - in real implementation, query database
    const now = new Date()
    const promotions: Promotion[] = [
      {
        id: 'promo-1',
        name: 'Premium Collection Flash Sale',
        description: '80% off all premium wines',
        type: 'flash_sale',
        discountType: 'percentage',
        discountValue: 80,
        applicableProducts: [productId],
        applicableCategories: [],
        customerTiers: ['bronze', 'silver', 'gold', 'platinum', 'vip'],
        currentUsageCount: 0,
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Started yesterday
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
        isActive: true,
        bannerMessage: '🔥 Limited Time: 80% OFF Premium Collection!',
        urgencyMessage: 'Only 7 days left!',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    return promotions.filter(p =>
      p.isActive &&
      now >= p.startDate &&
      now <= p.endDate &&
      (!customerTier || p.customerTiers.includes(customerTier))
    )
  }

  private calculatePromotionDiscount(originalPrice: number, promotion: Promotion, quantity: number): number {
    return this.calculateDiscountAmount(
      originalPrice * quantity,
      promotion.discountType,
      promotion.discountValue,
      promotion.maxDiscountAmount
    ) / quantity
  }

  private calculateDiscountAmount(
    amount: number,
    discountType: DiscountType,
    discountValue: number,
    maxDiscountAmount?: number
  ): number {
    let discount = 0

    switch (discountType) {
      case 'percentage':
        discount = amount * (discountValue / 100)
        if (maxDiscountAmount && discount > maxDiscountAmount) {
          discount = maxDiscountAmount
        }
        break
      case 'fixed_amount':
        discount = Math.min(discountValue, amount)
        break
      default:
        discount = 0
    }

    return Math.max(0, discount)
  }

  private getStockScarcityInfo(stock: number) {
    if (stock <= 5) {
      return {
        isLow: true,
        remaining: stock,
        message: `Only ${stock} left in stock!`
      }
    } else if (stock <= 10) {
      return {
        isLow: true,
        remaining: stock,
        message: `Limited stock - ${stock} remaining`
      }
    }
    return undefined
  }

  private getUrgencyMessage(promotion: Promotion | null): string | undefined {
    if (!promotion) return undefined

    const now = new Date()
    const timeLeft = promotion.endDate.getTime() - now.getTime()
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000))

    if (daysLeft <= 1) {
      return 'Ends today! Don\'t miss out!'
    } else if (daysLeft <= 3) {
      return `Only ${daysLeft} days left!`
    } else if (daysLeft <= 7) {
      return `${daysLeft} days remaining`
    }

    return promotion.urgencyMessage
  }

  private validatePromotionData(data: CreatePromotionRequest): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Promotion name is required', 400)
    }
    if (data.startDate >= data.endDate) {
      throw new AppError('End date must be after start date', 400)
    }
    if (data.discountValue <= 0) {
      throw new AppError('Discount value must be positive', 400)
    }
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      throw new AppError('Percentage discount cannot exceed 100%', 400)
    }
  }

  private validateDiscountCode(code: DiscountCode, data: ApplyDiscountRequest) {
    const errors: string[] = []
    const now = new Date()

    if (!code.isActive) {
      errors.push('Discount code is not active')
    }
    if (now < code.startDate) {
      errors.push('Discount code is not yet valid')
    }
    if (now > code.endDate) {
      errors.push('Discount code has expired')
    }
    if (code.totalUsageLimit && code.currentUsageCount >= code.totalUsageLimit) {
      errors.push('Discount code usage limit reached')
    }

    const cartTotal = data.cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    if (code.minOrderAmount && cartTotal < code.minOrderAmount) {
      errors.push(`Minimum order amount of $${code.minOrderAmount} required`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  private async getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
    // Mock implementation - in real app, query database
    return null
  }

  private async getPromotionById(id: string): Promise<Promotion | null> {
    // Mock implementation - in real app, query database
    return null
  }

  private async storePromotion(promotion: Promotion): Promise<void> {
    // Mock implementation - in real app, store in database
    logger.info(`Stored promotion: ${promotion.id}`)
  }

  private async storeDiscountCode(code: DiscountCode): Promise<void> {
    // Mock implementation - in real app, store in database
    logger.info(`Stored discount code: ${code.id}`)
  }

  private async calculatePromotionalMetrics(promotionId: string) {
    // Mock implementation - in real app, aggregate from database
    return {
      impressions: 15420 + Math.floor(Math.random() * 1000),
      clicks: 2341 + Math.floor(Math.random() * 100),
      conversions: 187 + Math.floor(Math.random() * 20),
      revenue: 93500 + Math.floor(Math.random() * 10000),
      newCustomers: 89 + Math.floor(Math.random() * 10),
      returningCustomers: 98 + Math.floor(Math.random() * 10)
    }
  }

  private async getDailyMetrics(promotionId: string) {
    // Mock daily metrics for the last 7 days
    const dailyMetrics = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      dailyMetrics.push({
        date,
        impressions: Math.floor(Math.random() * 3000) + 1000,
        clicks: Math.floor(Math.random() * 400) + 200,
        conversions: Math.floor(Math.random() * 30) + 15,
        revenue: Math.floor(Math.random() * 15000) + 8000
      })
    }
    return dailyMetrics
  }

  private async getTopPerformingProducts(promotionId: string) {
    // Mock top performing products
    return [
      {
        productId: 'wine-1',
        productName: 'Château Margaux 2015',
        impressions: 2500,
        clicks: 380,
        conversions: 45,
        revenue: 22500,
        conversionRate: 11.8
      },
      {
        productId: 'wine-2',
        productName: 'Dom Pérignon Vintage 2012',
        impressions: 2200,
        clicks: 340,
        conversions: 38,
        revenue: 19000,
        conversionRate: 11.2
      },
      {
        productId: 'wine-3',
        productName: 'Opus One 2018',
        impressions: 1800,
        clicks: 290,
        conversions: 32,
        revenue: 16000,
        conversionRate: 11.0
      }
    ]
  }

  private async storePromotionalEvent(eventData: {
    promotionId: string
    eventType: string
    userId: string
    productId: string
    revenue: number
    timestamp: Date
  }): Promise<void> {
    // Mock implementation - in real app, store in database
    logger.info(`Stored promotional event: ${eventData.eventType} for promotion ${eventData.promotionId}`)
  }

  private async updatePromotionalMetrics(
    promotionId: string,
    eventType: string,
    revenue?: number
  ): Promise<void> {
    // Mock implementation - in real app, update metrics in database
    logger.info(`Updated promotional metrics for promotion ${promotionId}: ${eventType}`)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}