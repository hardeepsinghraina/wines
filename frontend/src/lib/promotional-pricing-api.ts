import { api } from './api'
import {
  PromotionalPricingResponse,
  BulkPricingTier,
  CreatePromotionRequest,
  CreateDiscountCodeRequest,
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  PromotionalAnalytics,
  CustomerTier
} from '../../../shared/types/promotional-pricing'

export class PromotionalPricingAPI {
  /**
   * Get promotional pricing for a product
   */
  static async getPromotionalPricing(
    productId: string,
    customerTier?: CustomerTier,
    quantity: number = 1
  ): Promise<PromotionalPricingResponse> {
    const params = new URLSearchParams()
    if (customerTier) params.append('customerTier', customerTier)
    if (quantity > 1) params.append('quantity', quantity.toString())

    const response = await api.get(`/promotional-pricing/products/${productId}/pricing?${params}`)
    return response as any
  }

  /**
   * Get bulk pricing tiers for a product
   */
  static async getBulkPricing(productId: string, originalPrice: number): Promise<BulkPricingTier[]> {
    const response = await api.get(`/promotional-pricing/products/${productId}/bulk-pricing?originalPrice=${originalPrice}`)
    return response as any
  }

  /**
   * Get VIP pricing for a product
   */
  static async getVIPPricing(
    productId: string,
    customerTier: CustomerTier,
    originalPrice: number
  ): Promise<{ tier: CustomerTier; discountPercent: number; vipPrice: number }> {
    const response = await api.get(
      `/promotional-pricing/products/${productId}/vip-pricing?customerTier=${customerTier}&originalPrice=${originalPrice}`
    )
    return response as any
  }

  /**
   * Apply discount to cart
   */
  static async applyDiscount(data: ApplyDiscountRequest): Promise<ApplyDiscountResponse> {
    const response = await api.post('/promotional-pricing/apply-discount', data)
    return response as any
  }

  /**
   * Create a new promotion (admin only)
   */
  static async createPromotion(data: CreatePromotionRequest) {
    const response = await api.post('/promotional-pricing/promotions', data)
    return response
  }

  /**
   * Create a discount code (admin only)
   */
  static async createDiscountCode(data: CreateDiscountCodeRequest) {
    const response = await api.post('/promotional-pricing/discount-codes', data)
    return response
  }

  /**
   * Get promotional analytics (admin only)
   */
  static async getPromotionalAnalytics(promotionId: string): Promise<PromotionalAnalytics> {
    const response = await api.get(`/promotional-pricing/promotions/${promotionId}/analytics`)
    return response as any
  }

  /**
   * Track promotional event
   */
  static async trackPromotionalEvent(
    promotionId: string,
    eventType: 'impression' | 'click' | 'conversion',
    userId?: string,
    productId?: string,
    revenue?: number
  ): Promise<void> {
    await api.post(`/promotional-pricing/promotions/${promotionId}/track`, {
      eventType,
      userId,
      productId,
      revenue
    })
  }

  /**
   * Get conversion funnel analytics (admin only)
   */
  static async getConversionFunnel(promotionId: string) {
    const response = await api.get(`/promotional-pricing/promotions/${promotionId}/conversion-funnel`)
    return response
  }

  /**
   * Get promotional ROI analysis (admin only)
   */
  static async getPromotionalROI(promotionId: string) {
    const response = await api.get(`/promotional-pricing/promotions/${promotionId}/roi`)
    return response
  }
}