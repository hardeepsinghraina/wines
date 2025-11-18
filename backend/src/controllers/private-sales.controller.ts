import { Request, Response } from 'express'
import { privateSalesService } from '@/services/private-sales.service'
import { ResponseHelper } from '@/utils/response'
import { logger } from '@/utils/logger'

export class PrivateSalesController {
  /**
   * Get private sales
   */
  async getPrivateSales(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { minPrice, maxPrice, region, vintage, limit, offset } = req.query

      const filters: any = {}
      if (minPrice) filters.minPrice = Number(minPrice)
      if (maxPrice) filters.maxPrice = Number(maxPrice)
      if (region) filters.region = region as string
      if (vintage) filters.vintage = Number(vintage)
      if (limit) filters.limit = Number(limit)
      if (offset) filters.offset = Number(offset)

      const sales = await privateSalesService.getPrivateSalesWines(filters)

      return ResponseHelper.success(res, sales)
    } catch (error) {
      logger.error('Error getting private sales:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get private sales')
    }
  }

  /**
   * Get private sale by ID
   */
  async getPrivateSaleById(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return ResponseHelper.badRequest(res, 'ID parameter is required')
      }

      const sale = await privateSalesService.getPrivateSaleWineById(id)
      return ResponseHelper.success(res, sale)
    } catch (error) {
      logger.error('Error getting private sale:', error)
      const message = error instanceof Error ? error.message : 'Failed to get private sale'
      return ResponseHelper.notFound(res, message)
    }
  }

  /**
   * Check user eligibility
   */
  async checkUserEligibility(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const access = await privateSalesService.checkUserAccess(userId)
      return ResponseHelper.success(res, access)
    } catch (error) {
      logger.error('Error checking user eligibility:', error)
      return ResponseHelper.internalServerError(res, 'Failed to check eligibility')
    }
  }

  /**
   * Purchase from private sale
   */
  async purchaseFromPrivateSale(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.params
      const { quantity } = req.body

      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      if (!id) {
        return ResponseHelper.badRequest(res, 'ID parameter is required')
      }

      const purchase = await privateSalesService.purchasePrivateSaleWine(userId, id, quantity)
      return ResponseHelper.created(res, purchase)
    } catch (error) {
      logger.error('Error purchasing from private sale:', error)
      const message = error instanceof Error ? error.message : 'Failed to purchase from private sale'
      return ResponseHelper.badRequest(res, message)
    }
  }

  /**
   * Get user private sale purchases
   */
  async getUserPrivateSalePurchases(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const purchases = await privateSalesService.getUserPrivateSaleOrders(userId)
      return ResponseHelper.success(res, purchases)
    } catch (error) {
      logger.error('Error getting user private sale purchases:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get purchases')
    }
  }

  /**
   * Grant user access (simplified - just log the request)
   */
  async grantUserAccess(req: Request, res: Response) {
    try {
      const { userId, privateSaleId, reason } = req.body

      const result = await privateSalesService.requestAccess(userId, reason)
      return ResponseHelper.success(res, result)
    } catch (error) {
      logger.error('Error granting user access:', error)
      return ResponseHelper.internalServerError(res, 'Failed to grant access')
    }
  }

  /**
   * Request access to private sales
   */
  async requestAccess(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { reason } = req.body

      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const result = await privateSalesService.requestAccess(userId, reason)
      return ResponseHelper.success(res, result)
    } catch (error) {
      logger.error('Error requesting access:', error)
      return ResponseHelper.internalServerError(res, 'Failed to request access')
    }
  }

  /**
   * Get private sales statistics
   */
  async getPrivateSalesStats(req: Request, res: Response) {
    try {
      const stats = await privateSalesService.getPrivateSalesStats()
      return ResponseHelper.success(res, stats)
    } catch (error) {
      logger.error('Error getting private sales stats:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get statistics')
    }
  }
}

export const privateSalesController = new PrivateSalesController()