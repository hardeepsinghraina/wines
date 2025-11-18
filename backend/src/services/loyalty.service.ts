import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class LoyaltyService {
  /**
   * Get loyalty member by user ID
   */
  async getLoyaltyMemberByUserId(userId: string) {
    return await prisma.loyaltyMember.findUnique({
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
   * Create new loyalty member
   */
  async createLoyaltyMember(userId: string) {
    return await prisma.loyaltyMember.create({
      data: {
        userId,
        tier: 'BRONZE',
        points: 0,
        totalSpent: 0
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
   * Add points to loyalty member
   */
  async addPoints(userId: string, points: number, reason: string) {
    try {
      let loyaltyMember = await this.getLoyaltyMemberByUserId(userId)
      
      if (!loyaltyMember) {
        loyaltyMember = await this.createLoyaltyMember(userId)
      }

      const updatedMember = await prisma.loyaltyMember.update({
        where: { userId },
        data: {
          points: {
            increment: points
          }
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

      // Check for tier upgrade
      const newTier = this.calculateTier(updatedMember.points)
      if (newTier !== updatedMember.tier) {
        await this.updateTier(userId, newTier)
      }

      logger.info('Points added to loyalty member', {
        userId,
        points,
        reason,
        newTotal: updatedMember.points
      })

      return updatedMember
    } catch (error) {
      logger.error('Error adding loyalty points', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        points
      })
      throw error
    }
  }

  /**
   * Deduct points from loyalty member
   */
  async deductPoints(userId: string, points: number, reason: string) {
    try {
      const loyaltyMember = await this.getLoyaltyMemberByUserId(userId)
      
      if (!loyaltyMember) {
        throw new Error('Loyalty member not found')
      }

      if (loyaltyMember.points < points) {
        throw new Error('Insufficient points')
      }

      const updatedMember = await prisma.loyaltyMember.update({
        where: { userId },
        data: {
          points: {
            decrement: points
          }
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

      logger.info('Points deducted from loyalty member', {
        userId,
        points,
        reason,
        newTotal: updatedMember.points
      })

      return updatedMember
    } catch (error) {
      logger.error('Error deducting loyalty points', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        points
      })
      throw error
    }
  }

  /**
   * Update total spent and recalculate tier
   */
  async updateTotalSpent(userId: string, amount: number) {
    try {
      let loyaltyMember = await this.getLoyaltyMemberByUserId(userId)
      
      if (!loyaltyMember) {
        loyaltyMember = await this.createLoyaltyMember(userId)
      }

      const updatedMember = await prisma.loyaltyMember.update({
        where: { userId },
        data: {
          totalSpent: {
            increment: amount
          }
        }
      })

      // Calculate points earned (1 point per euro spent)
      const pointsEarned = Math.floor(amount)
      if (pointsEarned > 0) {
        await this.addPoints(userId, pointsEarned, `Purchase of €${amount}`)
      }

      // Check for tier upgrade based on total spent
      const newTier = this.calculateTierBySpending(updatedMember.totalSpent)
      if (newTier !== updatedMember.tier) {
        await this.updateTier(userId, newTier)
      }

      return updatedMember
    } catch (error) {
      logger.error('Error updating total spent', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        amount
      })
      throw error
    }
  }

  /**
   * Update loyalty tier
   */
  async updateTier(userId: string, newTier: string) {
    return await prisma.loyaltyMember.update({
      where: { userId },
      data: { tier: newTier },
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
   * Get loyalty statistics
   */
  async getLoyaltyStats() {
    const [totalMembers, tierDistribution] = await Promise.all([
      prisma.loyaltyMember.count(),
      prisma.loyaltyMember.groupBy({
        by: ['tier'],
        _count: {
          id: true
        }
      })
    ])

    return {
      totalMembers,
      tierDistribution: tierDistribution.reduce((acc: any, item: any) => {
        acc[item.tier] = item._count.id
        return acc
      }, {})
    }
  }

  /**
   * Get top loyalty members
   */
  async getTopMembers(limit: number = 10) {
    return await prisma.loyaltyMember.findMany({
      orderBy: { points: 'desc' },
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
   * Calculate tier based on points
   */
  private calculateTier(points: number): string {
    if (points >= 10000) return 'PLATINUM'
    if (points >= 5000) return 'GOLD'
    if (points >= 1000) return 'SILVER'
    return 'BRONZE'
  }

  /**
   * Calculate tier based on total spending
   */
  private calculateTierBySpending(totalSpent: number): string {
    if (totalSpent >= 10000) return 'PLATINUM'
    if (totalSpent >= 5000) return 'GOLD'
    if (totalSpent >= 1000) return 'SILVER'
    return 'BRONZE'
  }
}

export const loyaltyService = new LoyaltyService()