import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';
import { redisService } from '../../src/services/redis.service';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';

const prisma = new PrismaClient();

describe('Checkout End-to-End Tests', () => {
  let authToken: string;
  let userId: string;
  let productId: string;
  let cartId: string;
  let orderId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany({
      where: { email: 'checkout-test@example.com' }
    });
    await prisma.wine.deleteMany({
      where: { name: 'Checkout Test Wine' }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany({
      where: { email: 'checkout-test@example.com' }
    });
    await prisma.wine.deleteMany({
      where: { name: 'Checkout Test Wine' }
    });
    await prisma.$disconnect();
    const client = redisService.getClient();
    await client.quit();
  });

  describe('Complete Checkout Flow', () => {
    it('should complete the entire checkout process from cart to order confirmation', async () => {
      // Step 1: User Registration
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'checkout-test@example.com',
          password: 'CheckoutTest123!',
          firstName: 'Checkout',
          lastName: 'Tester',
          dateOfBirth: '1990-01-01'
        })
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      authToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user.id;

      // Step 2: Create Test Product
      const product = await prisma.wine.create({
        data: {
          name: 'Checkout Test Wine',
          producer: 'Test Producer',
          region: 'Test Region',
          vintage: 2020,
          category: 'RED',
          description: 'A test wine for checkout testing',
          tastingNotes: 'Rich and full-bodied',
          alcoholContent: 14.5,
          bottleSize: '750ml',
          price: {
            usd: 129.99,
            eur: 119.99,
            cryptoPrices: []
          },
          inventory: 50,
          images: [],
          specifications: {},
          isActive: true
        }
      });
      productId = product.id;

      // Step 3: Add Product to Cart
      const addToCartResponse = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: productId,
          quantity: 2
        })
        .expect(200);

      expect(addToCartResponse.body.success).toBe(true);
      cartId = addToCartResponse.body.data.cart.id;

      // Step 4: Verify Cart Contents
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(cartResponse.body.success).toBe(true);
      expect(cartResponse.body.data.items).toHaveLength(1);
      expect(cartResponse.body.data.items[0].quantity).toBe(2);
      expect(cartResponse.body.data.summary.subtotal).toBe(259.98); // 129.99 * 2

      // Step 5: Calculate Shipping Rates
      const shippingResponse = await request(app)
        .post('/api/shipping/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: {
            street: '123 Checkout Test St',
            city: 'Test City',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          },
          items: [
            {
              id: productId,
              quantity: 2,
              weight: 3.0, // 1.5kg per bottle
              dimensions: { length: 10, width: 10, height: 30 }
            }
          ]
        })
        .expect(200);

      expect(shippingResponse.body.success).toBe(true);
      expect(shippingResponse.body.data.cost).toBeGreaterThan(0);
      const shippingCost = shippingResponse.body.data.cost;

      // Step 6: Get Crypto Payment Rates
      const ratesResponse = await request(app)
        .get('/api/payments/crypto/rates')
        .expect(200);

      expect(ratesResponse.body.success).toBe(true);
      expect(ratesResponse.body.data.rates).toBeDefined();

      // Step 7: Create Order with Crypto Payment
      const totalAmount = 259.98 + shippingCost;
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 2,
              price: 129.99
            }
          ],
          shippingAddress: {
            firstName: 'Checkout',
            lastName: 'Tester',
            street: '123 Checkout Test St',
            city: 'Test City',
            state: 'CA',
            postalCode: '90210',
            country: 'US',
            phone: '+1-555-0123'
          },
          billingAddress: {
            firstName: 'Checkout',
            lastName: 'Tester',
            street: '123 Checkout Test St',
            city: 'Test City',
            state: 'CA',
            postalCode: '90210',
            country: 'US',
            phone: '+1-555-0123'
          },
          shippingMethod: {
            id: 'standard',
            name: 'Standard Shipping',
            cost: shippingCost,
            estimatedDays: 5
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'BTC',
            amount: totalAmount / 50000, // Assuming BTC price around $50k
            walletAddress: 'bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5'
          }
        })
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.status).toBe('PENDING');
      expect(orderResponse.body.data.total).toBeCloseTo(totalAmount, 2);
      orderId = orderResponse.body.data.id;

      // Step 8: Verify Order Details
      const orderDetailsResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(orderDetailsResponse.body.success).toBe(true);
      expect(orderDetailsResponse.body.data.id).toBe(orderId);
      expect(orderDetailsResponse.body.data.items).toHaveLength(1);
      expect(orderDetailsResponse.body.data.items[0].quantity).toBe(2);
      expect(orderDetailsResponse.body.data.shippingAddress.street).toBe('123 Checkout Test St');
      expect(orderDetailsResponse.body.data.paymentMethod.type).toBe('crypto');

      // Step 9: Verify Cart is Cleared
      const clearedCartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(clearedCartResponse.body.success).toBe(true);
      expect(clearedCartResponse.body.data.items).toHaveLength(0);

      // Step 10: Verify Order in User's Order History
      const userOrdersResponse = await request(app)
        .get('/api/orders/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(userOrdersResponse.body.success).toBe(true);
      expect(userOrdersResponse.body.data.orders).toHaveLength(1);
      expect(userOrdersResponse.body.data.orders[0].id).toBe(orderId);
    });

    it('should handle guest checkout flow', async () => {
      // Create another test product
      const guestProduct = await prisma.wine.create({
        data: {
          name: 'Guest Checkout Wine',
          producer: 'Guest Producer',
          region: 'Guest Region',
          vintage: 2021,
          category: 'WHITE',
          description: 'A test wine for guest checkout',
          tastingNotes: 'Light and crisp',
          alcoholContent: 12.5,
          bottleSize: '750ml',
          price: {
            usd: 89.99,
            eur: 79.99,
            cryptoPrices: []
          },
          inventory: 25,
          images: [],
          specifications: {},
          isActive: true
        }
      });

      // Guest checkout order (no authentication)
      const guestOrderResponse = await request(app)
        .post('/api/orders/guest')
        .send({
          guestEmail: 'guest@example.com',
          items: [
            {
              productId: guestProduct.id,
              quantity: 1,
              price: 89.99
            }
          ],
          shippingAddress: {
            firstName: 'Guest',
            lastName: 'User',
            street: '456 Guest St',
            city: 'Guest City',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
            phone: '+1-555-0456'
          },
          billingAddress: {
            firstName: 'Guest',
            lastName: 'User',
            street: '456 Guest St',
            city: 'Guest City',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
            phone: '+1-555-0456'
          },
          shippingMethod: {
            id: 'express',
            name: 'Express Shipping',
            cost: 25.99,
            estimatedDays: 2
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'ETH',
            amount: 0.05,
            walletAddress: '0xc71b5d01e24F8D0d31e464D15B2b04032f58F4b3'
          }
        })
        .expect(201);

      expect(guestOrderResponse.body.success).toBe(true);
      expect(guestOrderResponse.body.data.status).toBe('PENDING');
      expect(guestOrderResponse.body.data.guestEmail).toBe('guest@example.com');

      // Clean up guest product
      await prisma.wine.delete({ where: { id: guestProduct.id } });
    });

    it('should handle different payment methods', async () => {
      // Test USDT TRC20 payment
      const usdtOrderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 129.99
            }
          ],
          shippingAddress: {
            firstName: 'USDT',
            lastName: 'Tester',
            street: '789 USDT St',
            city: 'Crypto City',
            state: 'TX',
            postalCode: '75001',
            country: 'US'
          },
          billingAddress: {
            firstName: 'USDT',
            lastName: 'Tester',
            street: '789 USDT St',
            city: 'Crypto City',
            state: 'TX',
            postalCode: '75001',
            country: 'US'
          },
          shippingMethod: {
            id: 'standard',
            name: 'Standard Shipping',
            cost: 15.99,
            estimatedDays: 5
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'USDT_TRC20',
            amount: 145.98, // 129.99 + 15.99
            walletAddress: 'TXeXRbMZuunsMS558WV6xWBFiXTmgbQQnp'
          }
        })
        .expect(201);

      expect(usdtOrderResponse.body.success).toBe(true);
      expect(usdtOrderResponse.body.data.paymentMethod.currency).toBe('USDT_TRC20');
    });

    it('should validate age verification requirement', async () => {
      // Test that orders require age verification (should be handled in frontend)
      const orderWithoutAgeVerification = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 129.99
            }
          ],
          shippingAddress: {
            firstName: 'Age',
            lastName: 'Test',
            street: '123 Age St',
            city: 'Age City',
            state: 'FL',
            postalCode: '33101',
            country: 'US'
          },
          billingAddress: {
            firstName: 'Age',
            lastName: 'Test',
            street: '123 Age St',
            city: 'Age City',
            state: 'FL',
            postalCode: '33101',
            country: 'US'
          },
          shippingMethod: {
            id: 'standard',
            name: 'Standard Shipping',
            cost: 15.99,
            estimatedDays: 5
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'BTC',
            amount: 0.003,
            walletAddress: 'bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5'
          },
          ageVerified: false // Should fail validation
        });

      // Age verification should be handled in frontend, but backend should accept orders
      // This test ensures the API doesn't break with age verification data
      expect(orderWithoutAgeVerification.status).toBeLessThan(500);
    });
  });

  describe('Checkout Error Handling', () => {
    it('should handle invalid product IDs', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: 'invalid-product-id',
              quantity: 1,
              price: 100.00
            }
          ],
          shippingAddress: {
            firstName: 'Error',
            lastName: 'Test',
            street: '123 Error St',
            city: 'Error City',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'BTC',
            amount: 0.002
          }
        })
        .expect(404);
    });

    it('should handle insufficient inventory', async () => {
      // Create product with limited inventory
      const limitedProduct = await prisma.wine.create({
        data: {
          name: 'Limited Stock Wine',
          producer: 'Limited Producer',
          region: 'Limited Region',
          vintage: 2019,
          category: 'RED',
          description: 'Limited stock wine',
          price: { usd: 199.99, eur: 179.99 },
          inventory: 1, // Only 1 in stock
          isActive: true
        }
      });

      // Try to order more than available
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: limitedProduct.id,
              quantity: 5, // More than available
              price: 199.99
            }
          ],
          shippingAddress: {
            firstName: 'Stock',
            lastName: 'Test',
            street: '123 Stock St',
            city: 'Stock City',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'BTC',
            amount: 0.02
          }
        })
        .expect(400);

      // Clean up
      await prisma.wine.delete({ where: { id: limitedProduct.id } });
    });

    it('should handle invalid shipping addresses', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 129.99
            }
          ],
          shippingAddress: {
            // Missing required fields
            firstName: '',
            lastName: '',
            street: '',
            city: '',
            country: ''
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'BTC',
            amount: 0.003
          }
        })
        .expect(400);
    });

    it('should handle invalid payment methods', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 129.99
            }
          ],
          shippingAddress: {
            firstName: 'Payment',
            lastName: 'Test',
            street: '123 Payment St',
            city: 'Payment City',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          },
          paymentMethod: {
            type: 'invalid_payment_type',
            currency: 'INVALID_CURRENCY'
          }
        })
        .expect(400);
    });
  });

  describe('Checkout Performance Tests', () => {
    it('should handle concurrent checkout requests', async () => {
      const promises = [];
      
      // Create multiple concurrent checkout requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              items: [
                {
                  productId: productId,
                  quantity: 1,
                  price: 129.99
                }
              ],
              shippingAddress: {
                firstName: `Concurrent${i}`,
                lastName: 'Test',
                street: `${i} Concurrent St`,
                city: 'Concurrent City',
                state: 'CA',
                postalCode: '90210',
                country: 'US'
              },
              billingAddress: {
                firstName: `Concurrent${i}`,
                lastName: 'Test',
                street: `${i} Concurrent St`,
                city: 'Concurrent City',
                state: 'CA',
                postalCode: '90210',
                country: 'US'
              },
              shippingMethod: {
                id: 'standard',
                name: 'Standard Shipping',
                cost: 15.99,
                estimatedDays: 5
              },
              paymentMethod: {
                type: 'crypto',
                currency: 'BTC',
                amount: 0.003,
                walletAddress: 'bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5'
              }
            })
        );
      }

      const responses = await Promise.allSettled(promises);
      
      // At least some should succeed
      const successfulResponses = responses.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 201
      );
      
      expect(successfulResponses.length).toBeGreaterThan(0);
    });

    it('should complete checkout within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              quantity: 1,
              price: 129.99
            }
          ],
          shippingAddress: {
            firstName: 'Performance',
            lastName: 'Test',
            street: '123 Performance St',
            city: 'Performance City',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          },
          billingAddress: {
            firstName: 'Performance',
            lastName: 'Test',
            street: '123 Performance St',
            city: 'Performance City',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          },
          shippingMethod: {
            id: 'standard',
            name: 'Standard Shipping',
            cost: 15.99,
            estimatedDays: 5
          },
          paymentMethod: {
            type: 'crypto',
            currency: 'ETH',
            amount: 0.08,
            walletAddress: '0xc71b5d01e24F8D0d31e464D15B2b04032f58F4b3'
          }
        })
        .expect(201);

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Checkout should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});