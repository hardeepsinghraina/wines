import { Cart, CartItem } from '../types/cart';
import { cartService } from './cart.service';

interface AbandonedCart {
  cartId: string;
  userId?: string | undefined;
  sessionId?: string | undefined;
  email?: string | undefined;
  items: CartItem[];
  abandonedAt: Date;
  remindersSent: number;
  lastReminderAt?: Date | undefined;
  recovered: boolean;
}

// Mock storage for abandoned carts
const abandonedCarts: Map<string, AbandonedCart> = new Map();

// Configuration
const ABANDONMENT_THRESHOLD_MINUTES = 30; // Consider cart abandoned after 30 minutes
const MAX_REMINDERS = 3;
const REMINDER_INTERVALS = [60, 1440, 4320]; // 1 hour, 24 hours, 3 days (in minutes)

export class CartAbandonmentService {
  constructor() {
    // Start monitoring interval
    this.startMonitoring();
  }

  /**
   * Start monitoring for cart abandonment
   */
  private startMonitoring(): void {
    // Check every 15 minutes
    setInterval(() => {
      this.checkForAbandonedCarts();
      this.sendReminders();
    }, 15 * 60 * 1000);
  }

  /**
   * Track cart activity
   */
  async trackCartActivity(cartId: string, userId?: string, sessionId?: string, email?: string): Promise<void> {
    // Remove from abandoned carts if it was there
    const existingAbandoned = Array.from(abandonedCarts.values())
      .find(ac => ac.cartId === cartId);
    
    if (existingAbandoned) {
      abandonedCarts.delete(existingAbandoned.cartId);
    }
  }

  /**
   * Check for abandoned carts
   */
  private async checkForAbandonedCarts(): Promise<void> {
    // This would typically query the database for carts that haven't been updated recently
    // For now, we'll simulate this with our mock data
    
    const now = new Date();
    const thresholdTime = new Date(now.getTime() - (ABANDONMENT_THRESHOLD_MINUTES * 60 * 1000));

    // In a real implementation, you would query carts from the database
    // For this mock, we'll skip the actual implementation
    console.log('Checking for abandoned carts...');
  }

  /**
   * Mark cart as abandoned
   */
  async markCartAsAbandoned(cart: Cart, email?: string): Promise<void> {
    if (cart.items.length === 0) return; // Don't track empty carts

    const abandonedCart: AbandonedCart = {
      cartId: cart.id,
      userId: cart.userId || undefined,
      sessionId: cart.sessionId || undefined,
      email: email || undefined,
      items: cart.items,
      abandonedAt: new Date(),
      remindersSent: 0,
      recovered: false
    };

    abandonedCarts.set(cart.id, abandonedCart);
    console.log(`Cart ${cart.id} marked as abandoned`);
  }

  /**
   * Send abandonment reminders
   */
  private async sendReminders(): Promise<void> {
    const now = new Date();

    for (const [cartId, abandonedCart] of abandonedCarts.entries()) {
      if (abandonedCart.recovered || abandonedCart.remindersSent >= MAX_REMINDERS) {
        continue;
      }

      const minutesSinceAbandoned = Math.floor(
        (now.getTime() - abandonedCart.abandonedAt.getTime()) / (1000 * 60)
      );

      const nextReminderInterval = REMINDER_INTERVALS[abandonedCart.remindersSent];
      
      if (nextReminderInterval && minutesSinceAbandoned >= nextReminderInterval) {
        await this.sendReminderEmail(abandonedCart);
        
        abandonedCart.remindersSent++;
        abandonedCart.lastReminderAt = now;
        abandonedCarts.set(cartId, abandonedCart);
      }
    }
  }

  /**
   * Send reminder email
   */
  private async sendReminderEmail(abandonedCart: AbandonedCart): Promise<void> {
    if (!abandonedCart.email) return;

    // In a real implementation, you would send an actual email
    console.log(`Sending abandonment reminder ${abandonedCart.remindersSent + 1} to ${abandonedCart.email} for cart ${abandonedCart.cartId}`);
    
    // Email content would include:
    // - Items in cart
    // - Total value
    // - Recovery link with token
    // - Incentive (discount code, free shipping, etc.)
  }

  /**
   * Mark cart as recovered
   */
  async markCartAsRecovered(cartId: string): Promise<void> {
    const abandonedCart = abandonedCarts.get(cartId);
    if (abandonedCart) {
      abandonedCart.recovered = true;
      abandonedCarts.set(cartId, abandonedCart);
      console.log(`Cart ${cartId} marked as recovered`);
    }
  }

  /**
   * Get abandonment statistics
   */
  async getAbandonmentStats(): Promise<{
    totalAbandoned: number;
    totalRecovered: number;
    recoveryRate: number;
    averageCartValue: number;
  }> {
    const abandoned = Array.from(abandonedCarts.values());
    const totalAbandoned = abandoned.length;
    const totalRecovered = abandoned.filter(ac => ac.recovered).length;
    const recoveryRate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0;
    
    const averageCartValue = abandoned.reduce((sum, ac) => {
      const cartValue = ac.items.reduce((itemSum, item) => {
        // This would calculate based on actual wine prices
        return itemSum + (item.quantity * 50); // Mock price
      }, 0);
      return sum + cartValue;
    }, 0) / (totalAbandoned || 1);

    return {
      totalAbandoned,
      totalRecovered,
      recoveryRate,
      averageCartValue
    };
  }

  /**
   * Create recovery link
   */
  generateRecoveryLink(cartId: string): string {
    // In a real implementation, you would create a secure token
    const token = Buffer.from(`${cartId}:${Date.now()}`).toString('base64');
    return `/cart/recover?token=${token}`;
  }

  /**
   * Recover cart from token
   */
  async recoverCartFromToken(token: string): Promise<Cart | null> {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [cartId] = decoded.split(':');
      
      if (!cartId) {
        return null;
      }
      
      const abandonedCart = abandonedCarts.get(cartId);
      if (!abandonedCart || abandonedCart.recovered) {
        return null;
      }

      // Mark as recovered
      await this.markCartAsRecovered(cartId);
      
      // Return the cart (in a real implementation, you'd fetch from database)
      const recoveredCart: Cart = {
        id: abandonedCart.cartId,
        items: abandonedCart.items,
        createdAt: abandonedCart.abandonedAt,
        updatedAt: new Date()
      };

      if (abandonedCart.userId) {
        recoveredCart.userId = abandonedCart.userId;
      }
      if (abandonedCart.sessionId) {
        recoveredCart.sessionId = abandonedCart.sessionId;
      }

      return recoveredCart;
    } catch (error) {
      console.error('Failed to recover cart from token:', error);
      return null;
    }
  }
}

export const cartAbandonmentService = new CartAbandonmentService();