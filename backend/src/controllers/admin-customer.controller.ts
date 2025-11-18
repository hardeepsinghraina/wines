import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'

const prisma = new PrismaClient()

export class AdminCustomerController {
  /**
   * Get all customers with pagination and filtering
   */
  async getAllCustomers(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        isActive,
        emailVerified,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {
        role: 'CUSTOMER' // Only get customers, not admins
      }
      
      if (search) {
        where.OR = [
          { email: { contains: search as string } },
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } }
        ]
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true'
      }

      if (emailVerified !== undefined) {
        where.emailVerified = emailVerified === 'true'
      }

      // Get customers with related data
      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                orders: true
              }
            },
            orders: {
              select: {
                totalAmount: true,
                currency: true,
                status: true
              },
              where: {
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
              }
            }
          }
        }),
        prisma.user.count({ where })
      ])

      // Calculate customer statistics
      const customersWithStats = customers.map((customer: any) => {
        const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0)
        const orderCount = customer._count.orders
        const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0

        return {
          ...customer,
          statistics: {
            totalSpent,
            orderCount,
            averageOrderValue
          }
        }
      })

      return ResponseHelper.paginated(res, customersWithStats, Number(page), Number(limit), total)
    } catch (error) {
      logger.error('Get all customers error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch customers')
    }
  }

  /**
   * Get single customer by ID
   */
  async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const customer = await prisma.user.findUnique({
        where: { 
          id,
          role: 'CUSTOMER'
        } as any,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          orders: {
            include: {
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
              },
              payment: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          _count: {
            select: {
              orders: true
            }
          }
        }
      })

      if (!customer) {
        return ResponseHelper.notFound(res, 'Customer not found')
      }

      // Calculate customer statistics
      const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0)
      const completedOrders = customer.orders.filter((order: any) => 
        ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
      ).length
      const averageOrderValue = completedOrders > 0 ? totalSpent / completedOrders : 0

      const customerWithStats = {
        ...customer,
        statistics: {
          totalSpent,
          orderCount: customer._count.orders,
          completedOrders,
          averageOrderValue,
          lastOrderDate: customer.orders[0]?.createdAt || null
        }
      }

      return ResponseHelper.success(res, customerWithStats)
    } catch (error) {
      logger.error('Get customer by ID error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId: req.params.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch customer')
    }
  }

  /**
   * Update customer status (activate/deactivate)
   */
  async updateCustomerStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { isActive, reason } = req.body

      // Check if customer exists
      const existingCustomer = await prisma.user.findUnique({
        where: { 
          id,
          role: 'CUSTOMER'
        } as any
      })

      if (!existingCustomer) {
        return ResponseHelper.notFound(res, 'Customer not found')
      }

      // Update customer status
      const customer = await prisma.user.update({
        where: { id } as any,
        data: { isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          emailVerified: true
        }
      })

      logger.info('Customer status updated', { 
        customerId: id,
        oldStatus: existingCustomer.isActive,
        newStatus: isActive,
        reason,
        adminId: (req as any).admin?.id 
      })

      return ResponseHelper.success(res, {
        message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
        customer
      })
    } catch (error) {
      logger.error('Update customer status error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId: req.params.id,
        adminId: (req as any).admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update customer status')
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query

      const where: any = {
        role: 'CUSTOMER'
      }

      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) where.createdAt.gte = new Date(dateFrom as string)
        if (dateTo) where.createdAt.lte = new Date(dateTo as string)
      }

      const [
        totalCustomers,
        activeCustomers,
        verifiedCustomers,
        newCustomersOverTime,
        topCustomers
      ] = await Promise.all([
        // Total customers
        prisma.user.count({ where }),

        // Active customers
        prisma.user.count({ 
          where: { ...where, isActive: true } 
        }),

        // Email verified customers
        prisma.user.count({ 
          where: { ...where, emailVerified: true } 
        }),

        // New customers over time (last 30 days)
        prisma.user.groupBy({
          by: ['createdAt'],
          where: {
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          _count: {
            id: true
          }
        }),

        // Top customers by spending
        prisma.user.findMany({
          where: {
            ...where,
            orders: {
              some: {
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
              }
            }
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            orders: {
              select: {
                totalAmount: true
              },
              where: {
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
              }
            }
          },
          take: 10
        })
      ])

      // Calculate top customers with spending
      const topCustomersWithSpending = topCustomers
        .map((customer: any) => ({
          ...customer,
          totalSpent: customer.orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0),
          orderCount: customer.orders.length
        }))
        .sort((a: any, b: any) => b.totalSpent - a.totalSpent)

      return ResponseHelper.success(res, {
        totalCustomers,
        activeCustomers,
        verifiedCustomers,
        newCustomersOverTime,
        topCustomers: topCustomersWithSpending,
        metrics: {
          activationRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
          verificationRate: totalCustomers > 0 ? (verifiedCustomers / totalCustomers) * 100 : 0
        }
      })
    } catch (error) {
      logger.error('Get customer analytics error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch customer analytics')
    }
  }

  /**
   * Search customers
   */
  async searchCustomers(req: Request, res: Response) {
    try {
      const { q, limit = 10 } = req.query

      if (!q || (q as string).length < 2) {
        return ResponseHelper.badRequest(res, 'Search query must be at least 2 characters')
      }

      const customers = await prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          OR: [
            { email: { contains: q as string } },
            { firstName: { contains: q as string } },
            { lastName: { contains: q as string } }
          ]
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      })

      return ResponseHelper.success(res, customers)
    } catch (error) {
      logger.error('Search customers error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to search customers')
    }
  }
}

export const adminCustomerController = new AdminCustomerController()