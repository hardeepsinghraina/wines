import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { orderNotificationService } from './order-notification.service'
import { orderTrackingService } from './order-tracking.service'

const prisma = new PrismaClient()

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(data: {
    userId: string
    items: Array<{
      wineId: string
      quantity: number
      unitPrice: number
    }>
    shippingCost?: number
    taxAmount?: number
  }) {
    try {
      const orderNumber = this.generateOrderNumber()
      const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
      const shippingCost = data.shippingCost || 0
      const taxAmount = data.taxAmount || 0
      const totalAmount = subtotal + shippingCost + taxAmount

      const order = await prisma.order.create({
        data: {
          userId: data.userId,
          orderNumber,
          status: 'PENDING',
          subtotal,
          shippingCost,
          taxAmount,
          totalAmount,
          currency: 'EUR',
          items: {
            create: data.items.map(item => ({
              wineId: item.wineId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity
            }))
          }
        },
        include: {
          items: {
            include: {
              wine: true
            }
          },
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

      logger.info('Order created', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: data.userId,
        totalAmount
      })

      // Send order confirmation notification
      await orderNotificationService.sendOrderConfirmation(order as any)

      return order
    } catch (error) {
      logger.error('Error creating order', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId
      })
      throw error
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            wine: {
              include: {
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payment: true,
        shipping: true,
        shippingAddress: true,
        billingAddress: true
      } as any
    })
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUserId(userId: string, filters?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    const where: any = { userId }
    
    if (filters?.status) {
      where.status = filters.status
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            wine: true
          }
        },
        payment: true,
        shipping: true
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    })
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: string) {
    // Get current order to track previous status
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!currentOrder) {
      throw new Error('Order not found')
    }

    const previousStatus = currentOrder.status

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            wine: {
              include: {
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        shipping: true
      } as any
    })

    // Send status update notification
    if (previousStatus !== status) {
      await orderNotificationService.sendOrderStatusUpdate(updatedOrder as any, previousStatus)
    }

    return updatedOrder
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(filters?: {
    status?: string
    search?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    
    if (filters?.status) {
      where.status = filters.status
    }
    
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search } },
        { user: { email: { contains: filters.search } } },
        { user: { firstName: { contains: filters.search } } },
        { user: { lastName: { contains: filters.search } } }
      ]
    }
    
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
      if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            wine: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        payment: true,
        shipping: true
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    })
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      })
    ])

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    }
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(userId: string, cartItems: any[]) {
    try {
      const items = cartItems.map(cartItem => ({
        wineId: cartItem.wineId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.wine.price
      }))

      const order = await this.createOrder({
        userId,
        items,
        shippingCost: 10, // Default shipping cost
        taxAmount: 0 // Simplified - no tax calculation
      })

      // Clear cart after order creation
      await prisma.cartItem.deleteMany({
        where: { userId }
      })

      return order
    } catch (error) {
      logger.error('Error creating order from cart', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      throw error
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage')
    }

    return await this.updateOrderStatus(id, 'CANCELLED')
  }

  /**
   * Modify order (limited modifications allowed)
   */
  async modifyOrder(id: string, modifications: {
    shippingAddressId?: string
    billingAddressId?: string
    notes?: string
  }) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Only allow modifications for pending orders
    if (order.status !== 'PENDING') {
      throw new Error('Order cannot be modified after confirmation')
    }

    return await prisma.order.update({
      where: { id },
      data: modifications as any,
      include: {
        items: {
          include: {
            wine: {
              include: {
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        shipping: true
      } as any
    })
  }

  /**
   * Get order receipt data
   */
  async getOrderReceipt(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            wine: {
              include: {
                images: true,
                prices: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
        shipping: true
      } as any
    })

    if (!order) {
      throw new Error('Order not found')
    }

    return {
      ...order,
      receiptNumber: `RCP-${order.orderNumber}`,
      generatedAt: new Date(),
      payments: order.payment ? [order.payment] : []
    }
  }

  /**
   * Get recommended products for post-purchase upselling
   */
  async getRecommendedProducts(orderId: string, limit: number = 4) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              wine: true
            }
          }
        }
      })

      if (!order) {
        return []
      }

      // Get wines from similar categories based on wine category field
      const orderedCategories = order.items.map(item => item.wine?.category).filter(Boolean)
      const orderedWineIds = order.items.map(item => item.wineId)

      const recommendations = await prisma.wine.findMany({
        where: {
          id: { notIn: orderedWineIds },
          category: { in: orderedCategories },
          isActive: true
        },
        include: {
          images: true,
          prices: true
        },
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      })

      return recommendations
    } catch (error) {
      logger.error('Error getting recommended products', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return []
    }
  }

  /**
   * Email order receipt
   */
  async emailOrderReceipt(orderId: string) {
    try {
      const order = await this.getOrderById(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }

      // Send receipt email using the email service
      await orderNotificationService.sendOrderConfirmation(order as any)

      logger.info('Order receipt emailed', {
        orderId,
        orderNumber: (order as any).orderNumber,
        email: (order as any).user?.email
      })

      return { success: true }
    } catch (error) {
      logger.error('Error emailing order receipt', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string) {
    try {
      const order = await this.getOrderById(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }

      // If order has tracking number, get detailed tracking info
      if ((order as any).shipping?.trackingNumber) {
        const trackingInfo = await orderTrackingService.getTrackingInfo((order as any).shipping.trackingNumber)
        return trackingInfo
      }

      // Return basic order status information
      return {
        trackingNumber: null,
        carrier: null,
        status: (order as any).status,
        estimatedDelivery: (order as any).shipping?.estimatedDelivery,
        actualDelivery: (order as any).shipping?.actualDelivery,
        trackingEvents: []
      }
    } catch (error) {
      logger.error('Error getting order tracking', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `WO-${timestamp.slice(-6)}-${random}`
  }
}

export const orderService = new OrderService()