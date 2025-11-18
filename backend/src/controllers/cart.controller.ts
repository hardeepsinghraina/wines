import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { orderService } from '../services/order.service';
import { cartAbandonmentService } from '../services/cart-abandonment.service';
import { ResponseHelper } from '../utils/response';

export class CartController {
  /**
   * Get user's cart or create if doesn't exist
   */
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const cartId = userId ? `user_${userId}` : sessionId || 'anonymous';
      const summary = await cartService.getCartSummary(cartId);

      ResponseHelper.success(res, {
        cart,
        summary
      });
    } catch (error) {
      console.error('Get cart error:', error);
      ResponseHelper.internalServerError(res, 'Failed to retrieve cart');
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const { wineId, quantity } = req.body;

      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const cartId = userId ? `user_${userId}` : sessionId || 'anonymous';
      const cartItem = await cartService.addToCart(cartId, { wineId, quantity });

      // Track cart activity for abandonment monitoring
      await cartAbandonmentService.trackCartActivity(cartId, userId, sessionId, req.user?.email);

      ResponseHelper.success(res, cartItem);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to add item to cart');
      }
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const { wineId } = req.params;
      const { quantity } = req.body;

      if (!wineId) {
        ResponseHelper.badRequest(res, 'Wine ID is required');
        return;
      }

      const cartId = userId ? `user_${userId}` : sessionId || 'anonymous';
      const cartItem = await cartService.updateCartItem(cartId, wineId, { quantity });

      ResponseHelper.success(res, cartItem);
    } catch (error: any) {
      console.error('Update cart item error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to update cart item');
      }
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const { wineId } = req.params;

      if (!wineId) {
        ResponseHelper.badRequest(res, 'Wine ID is required');
        return;
      }

      const cartId = userId ? `user_${userId}` : sessionId || 'anonymous';
      await cartService.removeFromCart(cartId, wineId);

      ResponseHelper.success(res, null);
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to remove item from cart');
      }
    }
  }

  /**
   * Clear cart
   */
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const cartId = userId ? `user_${userId}` : sessionId || 'anonymous';
      await cartService.clearCart(cartId);

      ResponseHelper.success(res, null);
    } catch (error) {
      console.error('Clear cart error:', error);
      ResponseHelper.internalServerError(res, 'Failed to clear cart');
    }
  }

  /**
   * Get cart summary
   */
  async getCartSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const currency = req.query.currency as string || 'EUR';

      const cartId = userId ? `user_${userId}` : sessionId || 'anonymous';
      const summary = await cartService.getCartSummary(cartId, currency);

      ResponseHelper.success(res, summary);
    } catch (error) {
      console.error('Get cart summary error:', error);
      ResponseHelper.internalServerError(res, 'Failed to retrieve cart summary');
    }
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseHelper.unauthorized(res, 'Authentication required');
        return;
      }

      // Get cart first
      const cart = await cartService.getOrCreateCart(userId);
      
      const order = await orderService.createOrderFromCart(userId, cart.items);

      ResponseHelper.created(res, order);
    } catch (error: any) {
      console.error('Create order from cart error:', error);
      if (error.statusCode) {
        ResponseHelper.error(res, error.message, error.statusCode);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to create order');
      }
    }
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeGuestCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { guestSessionId } = req.body;

      if (!userId) {
        ResponseHelper.unauthorized(res, 'Authentication required');
        return;
      }

      if (!guestSessionId) {
        ResponseHelper.badRequest(res, 'Guest session ID is required');
        return;
      }

      const cart = await cartService.mergeGuestCart(guestSessionId, userId);
      const summary = await cartService.getCartSummary(cart.id);

      ResponseHelper.success(res, {
        cart,
        summary
      });
    } catch (error) {
      console.error('Merge guest cart error:', error);
      ResponseHelper.internalServerError(res, 'Failed to merge guest cart');
    }
  }

  /**
   * Recover abandoned cart
   */
  async recoverCart(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        ResponseHelper.badRequest(res, 'Recovery token is required');
        return;
      }

      const cart = await cartAbandonmentService.recoverCartFromToken(token);
      
      if (!cart) {
        ResponseHelper.notFound(res, 'Invalid or expired recovery token');
        return;
      }

      const summary = await cartService.getCartSummary(cart.id);

      ResponseHelper.success(res, {
        cart,
        summary,
        message: 'Cart recovered successfully'
      });
    } catch (error) {
      console.error('Recover cart error:', error);
      ResponseHelper.internalServerError(res, 'Failed to recover cart');
    }
  }

  /**
   * Get cart abandonment statistics (admin only)
   */
  async getAbandonmentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await cartAbandonmentService.getAbandonmentStats();
      ResponseHelper.success(res, stats);
    } catch (error) {
      console.error('Get abandonment stats error:', error);
      ResponseHelper.internalServerError(res, 'Failed to get abandonment statistics');
    }
  }
}

export const cartController = new CartController();