import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class PrivateSalesService {
  /**
   * Get wines available for private sales (simplified)
   * For now, we'll just return featured wines as "private sales"
   */
  async getPrivateSalesWines(filters?: {
    minPrice?: number
    maxPrice?: number
    region?: string
    vintage?: number
    limit?: number
    offset?: number
  }) {
    const where: any = {
      isActive: true,
      isFeatured: true // Use featured wines as private sales
    }
    
    if (filters?.minPrice !== undefined) {
      where.price = { ...where.price, gte: filters.minPrice }
    }
    
    if (filters?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice }
    }
    
    if (filters?.region) {
      where.region = { contains: filters.region }
    }
    
    if (filters?.vintage) {
      where.vintage = filters.vintage
    }

    return await prisma.wine.findMany({
      where,
      orderBy: { price: 'desc' }, // Show most expensive first for private sales
      take: filters?.limit || 20,
      skip: filters?.offset || 0
    })
  }

  /**
   * Get private sale wine by ID
   */
  async getPrivateSaleWineById(wineId: string) {
    const wine = await prisma.wine.findUnique({
      where: { 
        id: wineId,
        isActive: true,
        isFeatured: true // Must be featured to be in private sales
      }
    })

    if (!wine) {
      throw new Error('Private sale wine not found')
    }

    return wine
  }

  /**
   * Check if user has access to private sales
   * Simplified: check if user is a loyalty member with GOLD or PLATINUM tier
   */
  async checkUserAccess(userId: string) {
    try {
      const loyaltyMember = await prisma.loyaltyMember.findUnique({
        where: { userId }
      })

      // Allow access if user is GOLD or PLATINUM tier
      const hasAccess = loyaltyMember && ['GOLD', 'PLATINUM'].includes(loyaltyMember.tier)

      return {
        hasAccess,
        tier: loyaltyMember?.tier || 'BRONZE',
        reason: hasAccess ? 'Access granted' : 'Requires GOLD or PLATINUM tier'
      }
    } catch (error) {
      logger.error('Error checking private sales access', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      return {
        hasAccess: false,
        tier: 'BRONZE',
        reason: 'Error checking access'
      }
    }
  }

  /**
   * Request access to private sales
   */
  async requestAccess(userId: string, reason?: string) {
    try {
      // For now, just log the request
      logger.info('Private sales access requested', {
        userId,
        reason,
        requestedAt: new Date()
      })

      // In a real implementation, this would create a request record
      // and notify administrators

      return {
        success: true,
        message: 'Access request submitted successfully'
      }
    } catch (error) {
      logger.error('Error requesting private sales access', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      throw error
    }
  }

  /**
   * Purchase private sale wine
   */
  async purchasePrivateSaleWine(userId: string, wineId: string, quantity: number) {
    try {
      // Check user access
      const access = await this.checkUserAccess(userId)
      if (!access.hasAccess) {
        throw new Error('Access denied to private sales')
      }

      // Check wine availability
      const wine = await this.getPrivateSaleWineById(wineId)
      if (wine.stock < quantity) {
        throw new Error('Insufficient stock')
      }

      // Create order (simplified)
      const orderNumber = `PS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      const unitPrice = wine.price || 0
      const totalPrice = unitPrice * quantity

      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber,
          status: 'PENDING',
          subtotal: totalPrice,
          shippingCost: 0, // Free shipping for private sales
          taxAmount: 0,
          totalAmount: totalPrice,
          currency: wine.currency,
          items: {
            create: {
              wineId,
              quantity,
              unitPrice: unitPrice || 0,
              totalPrice
            }
          }
        },
        include: {
          items: {
            include: {
              wine: true
            }
          }
        }
      })

      // Update wine stock
      await prisma.wine.update({
        where: { id: wineId },
        data: {
          stock: {
            decrement: quantity
          }
        }
      })

      logger.info('Private sale purchase created', {
        orderId: order.id,
        userId,
        wineId,
        quantity,
        totalPrice
      })

      return order
    } catch (error) {
      logger.error('Error purchasing private sale wine', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        wineId,
        quantity
      })
      throw error
    }
  }

  /**
   * Get private sales statistics
   */
  async getPrivateSalesStats() {
    const [totalWines, totalValue, averagePrice] = await Promise.all([
      prisma.wine.count({
        where: {
          isActive: true,
          isFeatured: true
        }
      }),
      prisma.wine.aggregate({
        _sum: {
          price: true
        },
        where: {
          isActive: true,
          isFeatured: true
        }
      }),
      prisma.wine.aggregate({
        _avg: {
          price: true
        },
        where: {
          isActive: true,
          isFeatured: true
        }
      })
    ])

    return {
      totalWines,
      totalValue: totalValue._sum.price || 0,
      averagePrice: averagePrice._avg.price || 0
    }
  }

  /**
   * Get user's private sale orders
   */
  async getUserPrivateSaleOrders(userId: string) {
    return await prisma.order.findMany({
      where: {
        userId,
        orderNumber: {
          startsWith: 'PS-' // Private sale orders start with PS-
        }
      },
      include: {
        items: {
          include: {
            wine: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}

export const privateSalesService = new PrivateSalesService()