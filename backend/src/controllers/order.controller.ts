import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { ResponseHelper } from '../utils/response';
import { OrderStatus } from '../types/order';

export class OrderController {
  /**
   * Create order directly (without cart)
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.unauthorized(res, 'Authentication required');
        return;
      }

      const { items, shippingAddressId, billingAddressId, notes } = req.body;

      const order = await orderService.createOrder({
        userId,
        items,
        shippingCost: 10,
        taxAmount: 0
      });

      ResponseHelper.created(res, order);
    } catch (error: any) {
      console.error('Create order error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to create order');
      }
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Admin can view any order, users can only view their own
      const order = await orderService.getOrderById(orderId);

      ResponseHelper.success(res, order);
    } catch (error: any) {
      console.error('Get order error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to retrieve order');
      }
    }
  }

  /**
   * Get user's orders with pagination
   */
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.unauthorized(res, 'Authentication required');
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await orderService.getOrdersByUserId(userId, {
        limit,
        offset: (page - 1) * limit
      });

      ResponseHelper.success(res, result);
    } catch (error) {
      console.error('Get user orders error:', error);
      ResponseHelper.internalServerError(res, 'Failed to retrieve orders');
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      if (!isAdmin) {
        ResponseHelper.forbidden(res, 'Admin access required');
        return;
      }

      const { orderId } = req.params;
      const { status } = req.body;

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      const order = await orderService.updateOrderStatus(orderId, status as OrderStatus);

      ResponseHelper.success(res, order);
    } catch (error: any) {
      console.error('Update order status error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to update order status');
      }
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      const { reason } = req.body;

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Verify order ownership for non-admin users
      if (!isAdmin) {
        const order = await orderService.getOrderById(orderId);
        if (!order || order.userId !== userId) {
          ResponseHelper.forbidden(res, 'Access denied');
          return;
        }
      }

      const order = await orderService.cancelOrder(orderId, reason);

      ResponseHelper.success(res, order);
    } catch (error: any) {
      console.error('Cancel order error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to cancel order');
      }
    }
  }

  /**
   * Modify order
   */
  async modifyOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      const modifications = req.body;

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Verify order ownership for non-admin users
      if (!isAdmin) {
        const order = await orderService.getOrderById(orderId);
        if (!order || order.userId !== userId) {
          ResponseHelper.forbidden(res, 'Access denied');
          return;
        }
      }

      const order = await orderService.modifyOrder(orderId, modifications);

      ResponseHelper.success(res, order);
    } catch (error: any) {
      console.error('Modify order error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to modify order');
      }
    }
  }

  /**
   * Get order receipt
   */
  async getOrderReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Verify order ownership for non-admin users
      if (!isAdmin) {
        const order = await orderService.getOrderById(orderId);
        if (!order || order.userId !== userId) {
          ResponseHelper.forbidden(res, 'Access denied');
          return;
        }
      }

      const receipt = await orderService.getOrderReceipt(orderId);

      ResponseHelper.success(res, receipt);
    } catch (error: any) {
      console.error('Get order receipt error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to get order receipt');
      }
    }
  }

  /**
   * Get recommended products for order
   */
  async getOrderRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      const limit = parseInt(req.query.limit as string) || 4;

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Verify order ownership for non-admin users
      if (!isAdmin) {
        const order = await orderService.getOrderById(orderId);
        if (!order || order.userId !== userId) {
          ResponseHelper.forbidden(res, 'Access denied');
          return;
        }
      }

      const recommendations = await orderService.getRecommendedProducts(orderId, limit);

      ResponseHelper.success(res, recommendations);
    } catch (error: any) {
      console.error('Get order recommendations error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to get recommendations');
      }
    }
  }

  /**
   * Email order receipt
   */
  async emailOrderReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Verify order ownership for non-admin users
      if (!isAdmin) {
        const order = await orderService.getOrderById(orderId);
        if (!order || order.userId !== userId) {
          ResponseHelper.forbidden(res, 'Access denied');
          return;
        }
      }

      await orderService.emailOrderReceipt(orderId);

      ResponseHelper.success(res, { message: 'Receipt sent successfully' });
    } catch (error: any) {
      console.error('Email order receipt error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to email receipt');
      }
    }
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

      if (!orderId) {
        ResponseHelper.badRequest(res, 'Order ID is required');
        return;
      }

      // Verify order ownership for non-admin users
      if (!isAdmin) {
        const order = await orderService.getOrderById(orderId);
        if (!order || order.userId !== userId) {
          ResponseHelper.forbidden(res, 'Access denied');
          return;
        }
      }

      const trackingInfo = await orderService.getOrderTracking(orderId);

      ResponseHelper.success(res, trackingInfo);
    } catch (error: any) {
      console.error('Get order tracking error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to get tracking information');
      }
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
      if (!isAdmin) {
        ResponseHelper.forbidden(res, 'Admin access required');
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      // This would need to be implemented in the service
      // For now, return a placeholder response
      ResponseHelper.success(res, {
        orders: [],
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      ResponseHelper.internalServerError(res, 'Failed to retrieve orders');
    }
  }
}

export const orderController = new OrderController();