import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'

const prisma = new PrismaClient()

export class AdminOrderController {
  /**
   * Get all orders with pagination and filtering
   */
  async getAllOrders(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        status, 
        dateFrom,
        dateTo,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (search) {
        where.OR = [
          { orderNumber: { contains: search as string, mode: 'insensitive' } },
          { user: { 
            OR: [
              { email: { contains: search as string, mode: 'insensitive' } },
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } }
            ]
          }}
        ]
      }

      if (status) {
        where.status = status
      }

      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
        if (dateTo) where.createdAt.lte = new Date(dateTo as string)
      }

      // Get orders with related data
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            items: {
              include: {
                wine: {
                  select: {
                    id: true,
                    name: true,
                    producer: true,
                    vintage: true
                  }
                }
              }
            },
            payment: true,
            shipping: true
          }
        }),
        prisma.order.count({ where })
      ])

      return ResponseHelper.paginated(res, orders, Number(page), Number(limit), total)
    } catch (error) {
      logger.error('Get all orders error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch orders')
    }
  }  /*
*
   * Get single order by ID
   */
  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const order = await prisma.order.findUnique({
        where: { id } as any,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              createdAt: true
            }
          },
          items: {
            include: {
              wine: true
            }
          },
          payment: true,
          shipping: true
        }
      })

      if (!order) {
        return ResponseHelper.notFound(res, 'Order not found')
      }

      return ResponseHelper.success(res, order)
    } catch (error) {
      logger.error('Get order by ID error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: req.params.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch order')
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status, notes } = req.body

      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id } as any
      })

      if (!existingOrder) {
        return ResponseHelper.notFound(res, 'Order not found')
      }

      // Update order status
      const order = await prisma.order.update({
        where: { id } as any,
        data: {
          status,
          ...(notes && { notes })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              wine: {
                select: {
                  name: true,
                  producer: true,
                  vintage: true
                }
              }
            }
          }
        }
      })

      logger.info('Order status updated', { 
        orderId: id,
        oldStatus: existingOrder.status,
        newStatus: status,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, order)
    } catch (error) {
      logger.error('Update order status error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: req.params.id,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update order status')
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { reason } = req.body

      // Check if order exists and can be cancelled
      const existingOrder = await prisma.order.findUnique({
        where: { id } as any,
        include: {
          payment: true,
          shipping: true
        }
      })

      if (!existingOrder) {
        return ResponseHelper.notFound(res, 'Order not found')
      }

      if (['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(existingOrder.status)) {
        return ResponseHelper.badRequest(res, 'Order cannot be cancelled in current status')
      }

      // Update order status to cancelled
      const order = await prisma.order.update({
        where: { id } as any,
        data: {
          status: 'CANCELLED'
        }
      })

      logger.info('Order cancelled', { 
        orderId: id,
        reason,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, {
        message: 'Order cancelled successfully',
        order
      })
    } catch (error) {
      logger.error('Cancel order error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: req.params.id,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to cancel order')
    }
  }

  /**
   * Process refund for order
   */
  async refundOrder(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { amount, reason } = req.body

      // Check if order exists
      const existingOrder = await prisma.order.findUnique({
        where: { id } as any,
        include: {
          payment: true
        }
      })

      if (!existingOrder) {
        return ResponseHelper.notFound(res, 'Order not found')
      }

      if (!existingOrder.payment) {
        return ResponseHelper.badRequest(res, 'No payment found for this order')
      }

      // Create refund payment record
      const refundPayment = await prisma.payment.create({
        data: {
          orderId: id!,
          method: existingOrder.payment?.method || 'CREDIT_CARD',
          status: 'COMPLETED',
          currency: existingOrder.currency,
          amount: -Math.abs(Number(amount)), // Negative amount for refund
          transactionHash: `refund_${Date.now()}`
        }
      })

      // Update order status
      await prisma.order.update({
        where: { id } as any,
        data: {
          status: 'REFUNDED'
        }
      })

      logger.info('Order refunded', { 
        orderId: id,
        refundAmount: amount,
        reason,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, {
        message: 'Refund processed successfully',
        refund: refundPayment
      })
    } catch (error) {
      logger.error('Refund order error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: req.params.id,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to process refund')
    }
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query

      const where: any = {}
      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
        if (dateTo) where.createdAt.lte = new Date(dateTo as string)
      }

      const [
        totalOrders,
        ordersByStatus,
        revenueStats,
        topProducts
      ] = await Promise.all([
        // Total orders count
        prisma.order.count({ where }),

        // Orders by status
        prisma.order.groupBy({
          by: ['status'],
          where,
          _count: {
            id: true
          }
        }),

        // Revenue statistics
        prisma.order.aggregate({
          where: {
            ...where,
            status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
          },
          _sum: {
            totalAmount: true
          },
          _avg: {
            totalAmount: true
          }
        }),

        // Top selling products
        prisma.orderItem.groupBy({
          by: ['wineId'],
          where: {
            order: where
          },
          _sum: {
            quantity: true,
            totalPrice: true
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 10
        })
      ])

      // Get wine details for top products
      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item: any) => {
          const wine = await prisma.wine.findUnique({
            where: { id: item.wineId },
            select: {
              id: true,
              name: true,
              producer: true,
              vintage: true
            }
          })
          return {
            ...item,
            wine
          }
        })
      )

      return ResponseHelper.success(res, {
        totalOrders,
        ordersByStatus,
        revenue: {
          total: revenueStats._sum.totalAmount || 0,
          average: revenueStats._avg.totalAmount || 0
        },
        topProducts: topProductsWithDetails
      })
    } catch (error) {
      logger.error('Get order analytics error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch order analytics')
    }
  }
}

export const adminOrderController = new AdminOrderController()