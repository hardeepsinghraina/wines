import { Request, Response } from 'express'
import { affiliateService } from '@/services/affiliate.service'
import { loyaltyService } from '@/services/loyalty.service'
import { ResponseHelper } from '@/utils/response'
import { logger } from '@/utils/logger'

export class AffiliateController {
  /**
   * Create affiliate program
   */
  async createAffiliateProgram(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const affiliate = await affiliateService.createAffiliate(userId)
      return ResponseHelper.created(res, affiliate)
    } catch (error) {
      logger.error('Error creating affiliate program:', error)
      const message = error instanceof Error ? error.message : 'Failed to create affiliate program'
      return ResponseHelper.internalServerError(res, message)
    }
  }

  /**
   * Get affiliate program
   */
  async getAffiliateProgram(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const affiliate = await affiliateService.getAffiliateByUserId(userId)
      if (!affiliate) {
        return ResponseHelper.notFound(res, 'Affiliate program not found')
      }

      return ResponseHelper.success(res, affiliate)
    } catch (error) {
      logger.error('Error getting affiliate program:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get affiliate program')
    }
  }

  /**
   * Get affiliate statistics
   */
  async getAffiliateStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const affiliate = await affiliateService.getAffiliateByUserId(userId)
      if (!affiliate) {
        return ResponseHelper.notFound(res, 'Affiliate program not found')
      }

      const stats = await affiliateService.getAffiliateStats(affiliate.id)
      return ResponseHelper.success(res, stats)
    } catch (error) {
      logger.error('Error getting affiliate stats:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get affiliate statistics')
    }
  }

  /**
   * Get user referrals (simplified - return empty for now)
   */
  async getUserReferrals(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      // Return empty array since we don't have referral tracking in simplified version
      return ResponseHelper.success(res, [])
    } catch (error) {
      logger.error('Error getting user referrals:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get referrals')
    }
  }

  /**
   * Get user commissions (simplified - return empty for now)
   */
  async getUserCommissions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      // Return empty array since we don't have commission tracking in simplified version
      return ResponseHelper.success(res, [])
    } catch (error) {
      logger.error('Error getting user commissions:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get commissions')
    }
  }

  /**
   * Track referral (simplified - just return success)
   */
  async trackReferral(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { affiliateCode } = req.body

      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      // In simplified version, just return success
      return ResponseHelper.success(res, {
        message: 'Referral tracked successfully',
        affiliateCode
      })
    } catch (error) {
      logger.error('Error tracking referral:', error)
      return ResponseHelper.internalServerError(res, 'Failed to track referral')
    }
  }

  /**
   * Get loyalty status
   */
  async getLoyaltyStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const loyaltyMember = await loyaltyService.getLoyaltyMemberByUserId(userId)
      if (!loyaltyMember) {
        // Create loyalty member if doesn't exist
        const newMember = await loyaltyService.createLoyaltyMember(userId)
        return ResponseHelper.success(res, newMember)
      }

      return ResponseHelper.success(res, loyaltyMember)
    } catch (error) {
      logger.error('Error getting loyalty status:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get loyalty status')
    }
  }

  /**
   * Get loyalty transactions (simplified - return empty)
   */
  async getLoyaltyTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      // Return empty array since we don't have transaction tracking in simplified version
      return ResponseHelper.success(res, [])
    } catch (error) {
      logger.error('Error getting loyalty transactions:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get loyalty transactions')
    }
  }

  /**
   * Get available rewards (simplified - return empty)
   */
  async getAvailableRewards(req: Request, res: Response) {
    try {
      // Return empty array since we don't have rewards in simplified version
      return ResponseHelper.success(res, [])
    } catch (error) {
      logger.error('Error getting available rewards:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get available rewards')
    }
  }

  /**
   * Redeem reward (simplified - return error)
   */
  async redeemReward(req: Request, res: Response) {
    try {
      return ResponseHelper.badRequest(res, 'Reward redemption not available in simplified version')
    } catch (error) {
      logger.error('Error redeeming reward:', error)
      return ResponseHelper.internalServerError(res, 'Failed to redeem reward')
    }
  }

  /**
   * Award points
   */
  async awardPoints(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const { points, description } = req.body

      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const result = await loyaltyService.addPoints(userId, points, description)
      return ResponseHelper.success(res, result)
    } catch (error) {
      logger.error('Error awarding points:', error)
      return ResponseHelper.internalServerError(res, 'Failed to award points')
    }
  }
}

export const affiliateController = new AffiliateController()