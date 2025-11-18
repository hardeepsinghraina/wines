import { Request, Response } from 'express'
import { PromotionalPricingService } from '../services/promotional-pricing.service'
import { AppError } from '../middleware/joi-validation'
import { logger } from '../utils/logger'

export class PromotionalPricingController {
  private promotionalPricingService: PromotionalPricingService

  constructor() {
    this.promotionalPricingService = new PromotionalPricingService()
  }

  /**
   * Get promotional pricing for a product
   */
  getPromotionalPricing = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params
      const { customerTier, quantity } = req.query

      if (!productId) {
        res.status(400).json({
          success: false,
          error: 'Product ID is required'
        })
        return
      }

      const pricing = await this.promotionalPricingService.getPromotionalPricing(
        productId,
        customerTier as any,
        quantity ? parseInt(quantity as string) : 1
      )

      res.json({
        success: true,
        data: pricing
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      } else {
        logger.error('Error getting promotional pricing:', error)
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }

  /**
   * Create a new promotion
   */
  createPromotion = async (req: Request, res: Response): Promise<void> => {
    try {
      const promotion = await this.promotionalPricingService.createPromotion(req.body)

      res.status(201).json({
        success: true,
        data: promotion
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      } else {
        logger.error('Error creating promotion:', error)
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }

  /**
   * Create a discount code
   */
  createDiscountCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const discountCode = await this.promotionalPricingService.createDiscountCode(req.body)

      res.status(201).json({
        success: true,
        data: discountCode
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      } else {
        logger.error('Error creating discount code:', error)
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }

  /**
   * Apply discount to cart
   */
  applyDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.promotionalPricingService.applyDiscount(req.body)

      res.json({
        success: result.success,
        data: result
      })
    } catch (error) {
      logger.error('Error applying discount:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get bulk pricing tiers
   */
  getBulkPricing = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { productId } = req.params
      const { originalPrice } = req.query

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        })
      }

      const bulkPricing = await this.promotionalPricingService.getBulkPricingTiers(
        productId,
        parseFloat(originalPrice as string) || 0
      )

      res.json({
        success: true,
        data: bulkPricing
      })
    } catch (error) {
      logger.error('Error getting bulk pricing:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get VIP pricing
   */
  getVIPPricing = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { productId } = req.params
      const { customerTier, originalPrice } = req.query

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        })
      }

      const vipPricing = await this.promotionalPricingService.getVIPPricing(
        productId,
        customerTier as any,
        parseFloat(originalPrice as string) || 0
      )

      res.json({
        success: true,
        data: vipPricing
      })
    } catch (error) {
      logger.error('Error getting VIP pricing:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get promotional analytics
   */
  getPromotionalAnalytics = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { promotionId } = req.params

      if (!promotionId) {
        return res.status(400).json({
          success: false,
          error: 'Promotion ID is required'
        })
      }

      const analytics = await this.promotionalPricingService.getPromotionalAnalytics(promotionId)

      res.json({
        success: true,
        data: analytics
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      } else {
        logger.error('Error getting promotional analytics:', error)
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }

  /**
   * Track promotional event
   */
  trackPromotionalEvent = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { promotionId } = req.params
      const { eventType, userId, productId, revenue } = req.body

      if (!promotionId) {
        return res.status(400).json({
          success: false,
          error: 'Promotion ID is required'
        })
      }

      await this.promotionalPricingService.trackPromotionalEvent(
        promotionId,
        eventType,
        userId,
        productId,
        revenue
      )

      res.json({
        success: true,
        message: 'Event tracked successfully'
      })
    } catch (error) {
      logger.error('Error tracking promotional event:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  /**
   * Get conversion funnel analytics
   */
  getConversionFunnel = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { promotionId } = req.params

      if (!promotionId) {
        return res.status(400).json({
          success: false,
          error: 'Promotion ID is required'
        })
      }

      const funnel = await this.promotionalPricingService.getConversionFunnel(promotionId)

      res.json({
        success: true,
        data: funnel
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      } else {
        logger.error('Error getting conversion funnel:', error)
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }

  /**
   * Get promotional ROI analysis
   */
  getPromotionalROI = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { promotionId } = req.params

      if (!promotionId) {
        return res.status(400).json({
          success: false,
          error: 'Promotion ID is required'
        })
      }

      const roi = await this.promotionalPricingService.getPromotionalROI(promotionId)

      res.json({
        success: true,
        data: roi
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      } else {
        logger.error('Error getting promotional ROI:', error)
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }
}