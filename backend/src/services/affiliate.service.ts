import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class AffiliateService {
  /**
   * Get affiliate by user ID
   */
  async getAffiliateByUserId(userId: string) {
    return await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  }

  /**
   * Create new affiliate
   */
  async createAffiliate(userId: string, data?: {
    commissionRate?: number
  }) {
    const affiliateCode = `AFF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return await prisma.affiliate.create({
      data: {
        userId,
        affiliateCode,
        commissionRate: data?.commissionRate || 5.0
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  }

  /**
   * Get affiliate statistics
   */
  async getAffiliateStats(affiliateId: string) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!affiliate) {
      throw new Error('Affiliate not found')
    }

    // For now, return basic stats since we don't have referral/commission tables
    return {
      affiliate,
      stats: {
        totalReferrals: 0,
        activeReferrals: 0,
        totalCommissions: affiliate.totalEarnings,
        pendingCommissions: 0,
        conversionRate: 0
      }
    }
  }

  /**
   * Update affiliate commission rate
   */
  async updateCommissionRate(affiliateId: string, newRate: number) {
    return await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { commissionRate: newRate },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  }

  /**
   * Get all affiliates
   */
  async getAllAffiliates(filters?: {
    isActive?: boolean
    search?: string
  }) {
    const where: any = {}
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }
    
    if (filters?.search) {
      where.user = {
        OR: [
          { email: { contains: filters.search } },
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } }
        ]
      }
    }

    return await prisma.affiliate.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Update affiliate status
   */
  async updateAffiliateStatus(affiliateId: string, isActive: boolean) {
    return await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  }

  /**
   * Get top performing affiliates
   */
  async getTopAffiliates(limit: number = 10) {
    return await prisma.affiliate.findMany({
      orderBy: { totalEarnings: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
  }

  /**
   * Process commission for order (simplified)
   */
  async processCommission(orderId: string, affiliateCode: string) {
    try {
      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // Get affiliate by code
      const affiliate = await prisma.affiliate.findUnique({
        where: { affiliateCode }
      })

      if (!affiliate || !affiliate.isActive) {
        throw new Error('Affiliate not found or inactive')
      }

      // Calculate commission
      const commissionAmount = (order.totalAmount * affiliate.commissionRate) / 100

      // Update affiliate total earnings
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          totalEarnings: {
            increment: commissionAmount
          }
        }
      })

      logger.info('Commission processed', {
        affiliateId: affiliate.id,
        orderId,
        commissionAmount
      })

      return { commissionAmount, affiliate }
    } catch (error) {
      logger.error('Error processing commission', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
        affiliateCode
      })
      throw error
    }
  }
}

export const affiliateService = new AffiliateService()