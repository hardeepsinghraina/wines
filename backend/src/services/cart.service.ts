import { PrismaClient } from '@prisma/client';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '../types/cart';
import { AppError } from '../middleware/joi-validation';
import { logger } from '../utils/logger';

// Cart expiration settings
const CART_EXPIRATION_DAYS = 30; // 30 days for guest carts
const USER_CART_EXPIRATION_DAYS = 90; // 90 days for user carts
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class CartService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Generate a unique cart ID
   */
  private generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Start periodic cleanup of expired carts
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCarts();
    }, CLEANUP_INTERVAL_MS);
  }

  /**
   * Clean up expired carts
   */
  private async cleanupExpiredCarts(): Promise<void> {
    try {
      const now = new Date();

      // Clean up expired guest carts (30 days)
      const guestExpirationDate = new Date(now.getTime() - (CART_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));
      const expiredGuestCarts = await (this.prisma.cartItem as any).deleteMany({
        where: {
          sessionId: { not: null },
          userId: null,
          updatedAt: { lt: guestExpirationDate }
        }
      });

      // Clean up expired user carts (90 days)
      const userExpirationDate = new Date(now.getTime() - (USER_CART_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));
      const expiredUserCarts = await (this.prisma.cartItem as any).deleteMany({
        where: {
          userId: { not: null },
          sessionId: null,
          updatedAt: { lt: userExpirationDate }
        }
      });

      const totalCleaned = expiredGuestCarts.count + expiredUserCarts.count;
      if (totalCleaned > 0) {
        logger.info(`Cleaned up ${totalCleaned} expired cart items`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired carts:', error);
    }
  }

  /**
   * Generate a unique cart item ID
   */
  private generateCartItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }


  /**
   * Get or create cart for user or session
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new AppError('Either userId or sessionId must be provided', 400);
    }

    try {
      // Try to find existing cart
      let cart = await (this.prisma.cartItem as any).findMany({
        where: userId
          ? { userId, sessionId: null }
          : sessionId
            ? { sessionId, userId: null }
            : { userId: null, sessionId: null },
        include: {
          wine: {
            include: {
              images: true,
              prices: true,
              inventory: true  
            }
          }
        }
      });

      // If no cart items found, return empty cart structure
      if (!cart || cart.length === 0) {
        return {
          id: this.generateCartId(),
          ...(userId && { userId }),
          ...(sessionId && { sessionId }),
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Transform cart items to expected format
      const items: CartItem[] = cart.map((item: any) => ({
        id: item.id,
        cartId: item.userId || item.sessionId || 'unknown',
        wineId: item.wineId,
        quantity: item.quantity,
        addedAt: item.createdAt,
        updatedAt: item.updatedAt,
        wine: {
          id: item.wine.id,
          name: item.wine.name,
          producer: item.wine.producer,
          region: item.wine.region,
          vintage: item.wine.vintage,
          bottleSize: item.wine.bottleSize,
          images: item.wine.images.map((img: any) => ({
            url: img.url,
            altText: img.altText || item.wine.name,
            isPrimary: img.isPrimary
          })),
          prices: item.wine.prices.map((price: any) => ({
            currency: price.currency,
            price: price.currentPrice
          })),
          inventory: item.wine.inventory.map((inv: any) => ({
            quantity: inv.quantity,
            location: inv.location
          }))
        }
      }));

      return {
        id: userId || sessionId || 'unknown',
        ...(userId && { userId }),
        ...(sessionId && { sessionId }),
        items,
        createdAt: cart[0]?.createdAt || new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error getting or creating cart:', error);
      throw new AppError('Failed to get cart', 500);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(
    cartId: string,
    request: AddToCartRequest
  ): Promise<CartItem> {
    const { wineId, quantity } = request;

    try {
      // Check if wine exists and get inventory
      const wine = await this.prisma.wine.findUnique({
        where: { id: wineId },
        include: {
          images: true,
          prices: true,
          inventory: true
        }
      });

      if (!wine) {
        throw new AppError('Wine not found or not available', 404);
      }

      // Check inventory
      const totalInventory = wine.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      if (totalInventory < quantity) {
        throw new AppError('Insufficient inventory', 400);
      }

      // Extract userId or sessionId from cartId
      const userId = cartId.startsWith('user_') ? cartId.replace('user_', '') : undefined;
      const sessionId = !userId ? cartId : undefined;

      // Check if item already exists in cart
      const existingItem = await (this.prisma.cartItem as any).findFirst({
        where: userId
          ? { wineId, userId, sessionId: null }
          : sessionId
            ? { wineId, sessionId, userId: null }
            : { wineId, userId: null, sessionId: null }
      });

      let cartItem: any;

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;

        if (totalInventory < newQuantity) {
          throw new AppError('Insufficient inventory for requested quantity', 400);
        }

        cartItem = await (this.prisma.cartItem as any).update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: {
            wine: {
              include: {
                images: true,
                prices: true,
                inventory: true
              }
            }
          }
        });
      } else {
        // Create new item
        cartItem = await (this.prisma.cartItem as any).create({
          data: userId
            ? { wineId, quantity, userId, sessionId: null }
            : sessionId
              ? { wineId, quantity, sessionId, userId: null }
              : { wineId, quantity, userId: null, sessionId: null },
          include: {
            wine: {
              include: {
                images: true,
                prices: true,
                inventory: true
              }
            }
          }
        });
      }

      // Transform to expected format
      return {
        id: cartItem.id,
        cartId: userId || sessionId || 'unknown',
        wineId: cartItem.wineId,
        quantity: cartItem.quantity,
        addedAt: cartItem.createdAt,
        updatedAt: cartItem.updatedAt,
        wine: {
          id: cartItem.wine.id,
          name: cartItem.wine.name,
          producer: cartItem.wine.producer,
          region: cartItem.wine.region,
          vintage: cartItem.wine.vintage,
          bottleSize: cartItem.wine.bottleSize,
          images: cartItem.wine.images.map((img: any) => ({
            url: img.url,
            altText: img.altText || cartItem.wine.name,
            isPrimary: img.isPrimary
          })),
          prices: cartItem.wine.prices.map((price: any) => ({
            currency: price.currency,
            price: price.currentPrice
          })),
          inventory: cartItem.wine.inventory.map((inv: any) => ({
            quantity: inv.quantity,
            location: inv.location
          }))
        }
      };
    } catch (error) {
      logger.error('Error adding to cart:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add item to cart', 500);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    cartId: string,
    wineId: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    const { quantity } = request;

    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400);
    }

    try {
      // Extract userId or sessionId from cartId
      const userId = cartId.startsWith('user_') ? cartId.replace('user_', '') : undefined;
      const sessionId = !userId ? cartId : undefined;

      // Find existing cart item
      const existingItem = await (this.prisma.cartItem as any).findFirst({
        where: userId
          ? { wineId, userId, sessionId: null }
          : sessionId
            ? { wineId, sessionId, userId: null }
            : { wineId, userId: null, sessionId: null }
      });

      if (!existingItem) {
        throw new AppError('Item not found in cart', 404);
      }

      // Check wine exists and inventory
      const wine = await this.prisma.wine.findUnique({
        where: { id: wineId },
        include: {
          images: true,
          prices: true,
          inventory: true
        }
      });

      if (!wine) {
        throw new AppError('Wine not found', 404);
      }

      // Check inventory
      const totalInventory = wine.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      if (totalInventory < quantity) {
        throw new AppError('Insufficient inventory', 400);
      }

      // Update item
      const cartItem = await (this.prisma.cartItem as any).update({
        where: { id: existingItem.id },
        data: { quantity },
        include: {
          wine: {
            include: {
              images: true,
              prices: true,
              inventory: true
            }
          }
        }
      });

      // Transform to expected format
      return {
        id: cartItem.id,
        cartId: userId || sessionId || 'unknown',
        wineId: cartItem.wineId,
        quantity: cartItem.quantity,
        addedAt: cartItem.createdAt,
        updatedAt: cartItem.updatedAt,
        wine: {
          id: cartItem.wine.id,
          name: cartItem.wine.name,
          producer: cartItem.wine.producer,
          region: cartItem.wine.region,
          vintage: cartItem.wine.vintage,
          bottleSize: cartItem.wine.bottleSize,
          images: cartItem.wine.images.map((img: any) => ({
            url: img.url,
            altText: img.altText || cartItem.wine.name,
            isPrimary: img.isPrimary
          })),
          prices: cartItem.wine.prices.map((price: any) => ({
            currency: price.currency,
            price: price.currentPrice
          })),
          inventory: cartItem.wine.inventory.map((inv: any) => ({
            quantity: inv.quantity,
            location: inv.location
          }))
        }
      };
    } catch (error) {
      logger.error('Error updating cart item:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update cart item', 500);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartId: string, wineId: string): Promise<void> {
    try {
      // Extract userId or sessionId from cartId
      const userId = cartId.startsWith('user_') ? cartId.replace('user_', '') : undefined;
      const sessionId = !userId ? cartId : undefined;

      // Find and delete the cart item
      const deletedItem = await (this.prisma.cartItem as any).deleteMany({
        where: userId
          ? { wineId, userId, sessionId: null }
          : sessionId
            ? { wineId, sessionId, userId: null }
            : { wineId, userId: null, sessionId: null }
      });

      if (deletedItem.count === 0) {
        throw new AppError('Item not found in cart', 404);
      }
    } catch (error) {
      logger.error('Error removing from cart:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove item from cart', 500);
    }
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<void> {
    try {
      // Extract userId or sessionId from cartId
      const userId = cartId.startsWith('user_') ? cartId.replace('user_', '') : undefined;
      const sessionId = !userId ? cartId : undefined;

      // Delete all cart items for this user/session
      await (this.prisma.cartItem as any).deleteMany({
        where: userId
          ? { userId, sessionId: null }
          : sessionId
            ? { sessionId, userId: null }
            : { userId: null, sessionId: null }
      });
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw new AppError('Failed to clear cart', 500);
    }
  }

  /**
   * Calculate tax based on subtotal and location
   */
  private calculateTax(subtotal: number, location?: string): number {
    // Default tax rate (this would typically be based on shipping location)
    const taxRate = 0.08; // 8% default tax rate
    return subtotal * taxRate;
  }

  /**
   * Calculate shipping cost based on items and location
   */
  private calculateShipping(items: CartItem[], location?: string): number {
    if (items.length === 0) return 0;

    // Calculate subtotal for free shipping threshold
    const subtotal = items.reduce((sum, item) => {
      if (item.wine && item.wine.prices) {
        const price = item.wine.prices.find(p => p.currency === 'EUR');
        if (price) {
          return sum + (price.price * item.quantity);
        }
      }
      return sum;
    }, 0);

    // Free shipping for orders over €200
    if (subtotal >= 200) return 0;

    // Standard shipping rates
    const baseShipping = 15.99;
    const perBottleShipping = 2.50;
    const totalBottles = items.reduce((sum, item) => sum + item.quantity, 0);

    return baseShipping + (perBottleShipping * Math.max(0, totalBottles - 3));
  }

  /**
   * Estimate delivery date
   */
  private estimateDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 business days
    return deliveryDate.toISOString().split('T')[0] || deliveryDate.toISOString();
  }

  /**
   * Validate item availability and stock
   */
  private async validateItemAvailability(cartId: string): Promise<void> {
    try {
      // Extract userId or sessionId from cartId
      const userId = cartId.startsWith('user_') ? cartId.replace('user_', '') : undefined;
      const sessionId = !userId ? cartId : undefined;

      // Get cart items with wine data
      const cartItems = await (this.prisma.cartItem as any).findMany({
        where: userId
          ? { userId, sessionId: null }
          : sessionId
            ? { sessionId, userId: null }
            : { userId: null, sessionId: null },
        include: {
          wine: {
            include: {
              inventory: true
            }
          }
        }
      });

      for (const item of cartItems as any[]) {
        const totalInventory = item.wine.inventory.reduce((sum: number, inv: any) => sum + inv.quantity, 0);

        if (totalInventory === 0) {
          // Remove out of stock items
          await (this.prisma.cartItem as any).delete({
            where: { id: item.id }
          });
        } else if (item.quantity > totalInventory) {
          // Adjust quantity to available stock
          await (this.prisma.cartItem as any).update({
            where: { id: item.id },
            data: { quantity: totalInventory }
          });
        }
      }
    } catch (error) {
      logger.error('Error validating cart items:', error);
    }
  }

  /**
   * Get cart summary with totals, taxes, and shipping
   */
  async getCartSummary(cartId: string, currency: string = 'EUR', location?: string): Promise<CartSummary> {
    try {
      // Extract userId or sessionId from cartId
      const userId = cartId.startsWith('user_') ? cartId.replace('user_', '') : undefined;
      const sessionId = !userId ? cartId : undefined;

      // Get cart items from database
      const cartItems = await (this.prisma.cartItem as any).findMany({
        where: userId
          ? { userId, sessionId: null }
          : sessionId
            ? { sessionId, userId: null }
            : { userId: null, sessionId: null },
        include: {
          wine: {
            include: {
              images: true,
              prices: true,
              inventory: true
            }
          }
        }
      });

      let subtotal = 0;
      let itemCount = 0;
      const items: CartItem[] = [];

      for (const item of cartItems as any[]) {
        // Find price in requested currency
        const price = item.wine.prices.find((p: any) => p.currency === currency);
        const priceValue = price?.currentPrice || item.wine.currentPrice || 0;

        subtotal += priceValue * item.quantity;
        itemCount += item.quantity;

        // Transform to expected format
        items.push({
          id: item.id,
          cartId: userId || sessionId || 'unknown',
          wineId: item.wineId,
          quantity: item.quantity,
          addedAt: item.createdAt,
          updatedAt: item.updatedAt,
          wine: {
            id: item.wine.id,
            name: item.wine.name,
            producer: item.wine.producer,
            region: item.wine.region,
            vintage: item.wine.vintage,
            bottleSize: item.wine.bottleSize,
            images: item.wine.images.map((img: any) => ({
              url: img.url,
              altText: img.altText || item.wine.name,
              isPrimary: img.isPrimary
            })),
            prices: item.wine.prices.map((price: any) => ({
              currency: price.currency,
              price: price.currentPrice
            })),
            inventory: item.wine.inventory.map((inv: any) => ({
              quantity: inv.quantity,
              location: inv.location
            }))
          }
        });
      }

      const tax = this.calculateTax(subtotal, location);
      const shipping = this.calculateShipping(items, location);
      const total = subtotal + tax + shipping;

      return {
        itemCount,
        subtotal,
        tax,
        shipping,
        total,
        currency,
        items,
        estimatedDelivery: this.estimateDelivery()
      };
    } catch (error) {
      logger.error('Error getting cart summary:', error);
      throw new AppError('Failed to get cart summary', 500);
    }
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeGuestCart(guestSessionId: string, userId: string): Promise<Cart> {
    try {
      // Get guest cart items
      const guestItems = await (this.prisma.cartItem as any).findMany({
        where: { sessionId: guestSessionId, userId: null },
        include: {
          wine: {
            include: {
              images: true,
              prices: true,
              inventory: true
            }
          }
        }
      }) as any[];

      if (guestItems.length === 0) {
        return this.getOrCreateCart(userId);
      }

      // Merge items from guest cart to user cart
      for (const guestItem of guestItems) {
        try {
          // Check if user already has this item
          const existingUserItem = await (this.prisma.cartItem as any).findFirst({
            where: {
              userId,
              wineId: guestItem.wineId,
              sessionId: null
            }
          });

          if (existingUserItem) {
            // Update existing item quantity
            await (this.prisma.cartItem as any).update({
              where: { id: existingUserItem.id },
              data: { quantity: existingUserItem.quantity + guestItem.quantity }
            });
          } else {
            // Create new item for user
            await (this.prisma.cartItem as any).create({
              data: {
                userId,
                wineId: guestItem.wineId,
                quantity: guestItem.quantity,
                sessionId: null
              }
            });
          }
        } catch (error) {
          logger.error('Error merging cart item:', error);
          // Continue with other items if one fails
        }
      }

      // Delete guest cart items
      await (this.prisma.cartItem as any).deleteMany({
        where: { sessionId: guestSessionId, userId: null }
      });

      return this.getOrCreateCart(userId);
    } catch (error) {
      logger.error('Error merging guest cart:', error);
      throw new AppError('Failed to merge guest cart', 500);
    }
  }
}

export const cartService = new CartService();