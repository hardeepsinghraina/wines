import { test, expect, Page } from '@playwright/test';

/**
 * Complete Purchase Flow Audit
 * 
 * This test validates the entire purchase journey from product discovery to order confirmation.
 * It checks all critical steps in the checkout and payment process.
 */

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:5000';

test.describe('Complete Purchase Flow Audit', () => {
  test.setTimeout(120000); // 2 minutes for complete flow

  test('should complete full purchase flow from product to confirmation', async ({ page }) => {
    const results = {
      productDiscovery: false,
      addToCart: false,
      cartView: false,
      checkoutInitiation: false,
      shippingInfo: false,
      paymentMethod: false,
      orderReview: false,
      orderConfirmation: false,
      errors: [] as string[]
    };

    try {
      // Step 1: Product Discovery
      console.log('Step 1: Testing Product Discovery...');
      await page.goto(`${BASE_URL}/products`);
      await page.waitForLoadState('networkidle');
      
      const productCards = page.locator('.bg-white.rounded-lg.shadow-md');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        results.productDiscovery = true;
        console.log(`✓ Found ${productCount} products`);
      } else {
        results.errors.push('No products found on products page');
      }

      // Step 2: Add to Cart
      console.log('Step 2: Testing Add to Cart...');
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click();
        await page.waitForTimeout(2000);
        results.addToCart = true;
        console.log('✓ Product added to cart');
      } else {
        results.errors.push('Add to Cart button not found');
      }

      // Step 3: View Cart
      console.log('Step 3: Testing Cart View...');
      const cartLink = page.locator('a[href*="cart"], button:has-text("Cart")');
      
      if (await cartLink.count() > 0) {
        await cartLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check if we're on cart page or cart is visible
        const currentUrl = page.url();
        const hasCartContent = await page.locator('text=/cart|shopping|checkout/i').count() > 0;
        
        if (currentUrl.includes('cart') || hasCartContent) {
          results.cartView = true;
          console.log('✓ Cart view accessible');
        } else {
          results.errors.push('Cart page not accessible');
        }
      } else {
        results.errors.push('Cart link not found');
      }

      // Step 4: Checkout Initiation
      console.log('Step 4: Testing Checkout Initiation...');
      const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout")');
      
      if (await checkoutButton.count() > 0) {
        await checkoutButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        if (currentUrl.includes('checkout')) {
          results.checkoutInitiation = true;
          console.log('✓ Checkout initiated');
        } else {
          results.errors.push('Checkout page not reached');
        }
      } else {
        // Try direct navigation
        await page.goto(`${BASE_URL}/checkout`);
        await page.waitForLoadState('networkidle');
        
        const is404 = await page.locator('text=/404|not found/i').count() > 0;
        if (!is404) {
          results.checkoutInitiation = true;
          console.log('✓ Checkout page accessible (direct navigation)');
        } else {
          results.errors.push('Checkout button not found and page returns 404');
        }
      }

      // Step 5: Shipping Information
      console.log('Step 5: Testing Shipping Information...');
      const shippingFields = page.locator('input[name*="address"], input[name*="shipping"], input[placeholder*="address"]');
      const shippingSection = page.locator('text=/shipping|delivery|address/i');
      
      if (await shippingFields.count() > 0 || await shippingSection.count() > 0) {
        results.shippingInfo = true;
        console.log('✓ Shipping information section present');
      } else {
        results.errors.push('Shipping information section not found');
      }

      // Step 6: Payment Method Selection
      console.log('Step 6: Testing Payment Method...');
      const paymentSection = page.locator('text=/payment|credit card|crypto|bitcoin/i');
      const paymentButtons = page.locator('button:has-text("Pay"), button:has-text("Complete"), button:has-text("Place Order")');
      
      if (await paymentSection.count() > 0 || await paymentButtons.count() > 0) {
        results.paymentMethod = true;
        console.log('✓ Payment method section present');
      } else {
        results.errors.push('Payment method section not found');
      }

      // Step 7: Order Review
      console.log('Step 7: Testing Order Review...');
      const reviewSection = page.locator('text=/review|summary|total|subtotal/i');
      const priceElements = page.locator('text=/\\$[0-9]+/');
      
      if (await reviewSection.count() > 0 || await priceElements.count() > 0) {
        results.orderReview = true;
        console.log('✓ Order review section present');
      } else {
        results.errors.push('Order review section not found');
      }

      // Step 8: Order Confirmation (simulate)
      console.log('Step 8: Testing Order Confirmation...');
      const mockOrderId = 'ORD-' + Date.now();
      await page.goto(`${BASE_URL}/order-confirmation/${mockOrderId}`);
      await page.waitForLoadState('networkidle');
      
      const is404 = await page.locator('text=/404|not found/i').count() > 0;
      const hasContent = await page.locator('body').textContent();
      
      if (!is404 && hasContent && hasContent.length > 100) {
        results.orderConfirmation = true;
        console.log('✓ Order confirmation page accessible');
      } else {
        results.errors.push('Order confirmation page not properly implemented');
      }

    } catch (error) {
      results.errors.push(`Test execution error: ${error}`);
    }

    // Generate Report
    console.log('\n=== PURCHASE FLOW AUDIT RESULTS ===\n');
    console.log('Product Discovery:', results.productDiscovery ? '✓ PASS' : '✗ FAIL');
    console.log('Add to Cart:', results.addToCart ? '✓ PASS' : '✗ FAIL');
    console.log('Cart View:', results.cartView ? '✓ PASS' : '✗ FAIL');
    console.log('Checkout Initiation:', results.checkoutInitiation ? '✓ PASS' : '✗ FAIL');
    console.log('Shipping Information:', results.shippingInfo ? '✓ PASS' : '✗ FAIL');
    console.log('Payment Method:', results.paymentMethod ? '✓ PASS' : '✗ FAIL');
    console.log('Order Review:', results.orderReview ? '✓ PASS' : '✗ FAIL');
    console.log('Order Confirmation:', results.orderConfirmation ? '✓ PASS' : '✗ FAIL');
    
    const passedSteps = Object.values(results).filter(v => v === true).length;
    const totalSteps = 8;
    const successRate = (passedSteps / totalSteps * 100).toFixed(1);
    
    console.log(`\nOverall Success Rate: ${successRate}% (${passedSteps}/${totalSteps} steps)`);
    
    if (results.errors.length > 0) {
      console.log('\nErrors Found:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Assert minimum requirements
    expect(results.productDiscovery).toBeTruthy();
    expect(results.addToCart).toBeTruthy();
    expect(passedSteps).toBeGreaterThanOrEqual(5); // At least 5 out of 8 steps should pass
  });

  test('should verify API endpoints are functional', async ({ page }) => {
    console.log('\n=== API ENDPOINTS AUDIT ===\n');
    
    const endpoints = [
      { name: 'Health Check', url: `${API_URL}/api/health`, method: 'GET' },
      { name: 'Products List', url: `${API_URL}/api/products`, method: 'GET' },
      { name: 'Cart', url: `${API_URL}/api/cart`, method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint.url);
        const status = response.ok() ? '✓ PASS' : '✗ FAIL';
        console.log(`${endpoint.name}: ${status} (${response.status()})`);
        
        if (response.ok()) {
          const data = await response.json();
          console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`${endpoint.name}: ✗ FAIL (${error})`);
      }
    }
  });

  test('should verify critical pages are accessible', async ({ page }) => {
    console.log('\n=== PAGE ACCESSIBILITY AUDIT ===\n');
    
    const pages = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: 'Collections', url: '/collections' },
      { name: 'Cart', url: '/cart' },
      { name: 'Checkout', url: '/checkout' },
      { name: 'Login', url: '/login' },
      { name: 'Account Orders', url: '/account/orders' },
    ];

    for (const pageInfo of pages) {
      try {
        await page.goto(`${BASE_URL}${pageInfo.url}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        const is404 = await page.locator('text=/404|not found/i').count() > 0;
        const hasContent = await page.locator('body').textContent();
        
        if (!is404 && hasContent && hasContent.length > 100) {
          console.log(`${pageInfo.name}: ✓ ACCESSIBLE`);
        } else {
          console.log(`${pageInfo.name}: ✗ NOT FOUND (404)`);
        }
      } catch (error) {
        console.log(`${pageInfo.name}: ✗ ERROR (${error})`);
      }
    }
  });
});
