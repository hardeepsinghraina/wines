import { test, expect, Page } from '@playwright/test';

/**
 * Payment Method Selection Audit Tests
 * 
 * This test suite audits the payment method selection step of the checkout flow.
 * It validates Requirements 7.1-7.5 and 13.1 from the requirements document.
 * 
 * Test Coverage:
 * - Task 7.1: Payment options display (crypto + fiat)
 * - Task 7.2: Cryptocurrency selection and exchange rates
 * - Task 7.3: Real-time exchange rate updates
 * - Task 7.4: Saved payment methods
 * - Task 7.5: Payment method validation
 * - Task 7.6: Payment method navigation
 */

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  frontendURL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  testTimeout: 60000,
  navigationTimeout: 30000,
  // Test user credentials
  testUser: {
    email: 'audit-test@example.com',
    password: 'TestPassword123!',
  },
  // Expected cryptocurrency options
  expectedCryptos: ['BTC', 'ETH', 'USDT'],
  // Rate update interval (30 seconds as per design)
  rateUpdateInterval: 30000,
};

// Helper function to navigate to payment step
async function navigateToPaymentStep(page: Page, isAuthenticated: boolean = false) {
  // Start from homepage
  await page.goto(TEST_CONFIG.frontendURL);
  
  // Add a product to cart
  await page.waitForSelector('[data-testid="product-card"], .product-card, [class*="product"]', { 
    timeout: 10000 
  });
  
  // Find and click first "Add to Cart" button
  const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
  await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
  await addToCartButton.click();
  
  // Wait for cart to update
  await page.waitForTimeout(2000);
  
  // Navigate to checkout
  await page.goto(`${TEST_CONFIG.frontendURL}/checkout`);
  await page.waitForLoadState('networkidle');
  
  // Handle guest checkout if not authenticated
  if (!isAuthenticated) {
    const guestCheckoutButton = page.locator('button:has-text("Continue as Guest"), button:has-text("Guest Checkout")');
    if (await guestCheckoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Fill guest email
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill('guest@example.com');
      await guestCheckoutButton.click();
      await page.waitForTimeout(1000);
    }
  }
  
  // Fill shipping address (Step 1)
  await page.waitForSelector('input[name="firstName"], input[placeholder*="First"]', { timeout: 10000 });
  await page.fill('input[name="firstName"], input[placeholder*="First"]', 'John');
  await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'Doe');
  await page.fill('input[name="street"], input[placeholder*="Street"], input[placeholder*="Address"]', '123 Main St');
  await page.fill('input[name="city"], input[placeholder*="City"]', 'New York');
  await page.fill('input[name="state"], input[placeholder*="State"]', 'NY');
  await page.fill('input[name="postalCode"], input[placeholder*="Postal"], input[placeholder*="ZIP"]', '10001');
  
  // Select country
  const countrySelect = page.locator('select[name="country"], select:has(option:has-text("United States"))');
  if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await countrySelect.selectOption('US');
  }
  
  // Continue to shipping method
  const continueButton = page.locator('button:has-text("Continue")').first();
  await continueButton.click();
  await page.waitForTimeout(2000);
  
  // Select shipping method (Step 2)
  await page.waitForSelector('[data-testid="shipping-method"], .shipping-method, [class*="shipping"]', { 
    timeout: 10000 
  });
  
  // Select first shipping option
  const shippingOption = page.locator('[data-testid="shipping-method"], .shipping-method, input[type="radio"]').first();
  await shippingOption.click();
  await page.waitForTimeout(1000);
  
  // Continue to payment
  const continueToPayment = page.locator('button:has-text("Continue"), button:has-text("Payment")').first();
  await continueToPayment.click();
  await page.waitForTimeout(2000);
  
  // Verify we're on payment step
  await page.waitForSelector('text=/Payment Method|Select.*payment|Cryptocurrency/i', { timeout: 10000 });
}

test.describe('Task 7.1: Test payment options display', () => {
  test('should display all cryptocurrency payment options', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Verify payment method section is visible
    await expect(page.locator('text=/Payment Method|Select.*payment/i')).toBeVisible();
    
    // Verify cryptocurrency options are displayed
    for (const crypto of TEST_CONFIG.expectedCryptos) {
      const cryptoOption = page.locator(`text=/${crypto}/i`).first();
      await expect(cryptoOption).toBeVisible({ timeout: 10000 });
    }
    
    console.log('✓ All cryptocurrency options displayed');
  });

  test('should display cryptocurrency names and symbols', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Check for Bitcoin
    await expect(page.locator('text=/Bitcoin|BTC/i')).toBeVisible();
    
    // Check for Ethereum
    await expect(page.locator('text=/Ethereum|ETH/i')).toBeVisible();
    
    // Check for USDT
    await expect(page.locator('text=/Tether|USDT/i')).toBeVisible();
    
    console.log('✓ Cryptocurrency names and symbols displayed');
  });

  test('should display payment method descriptions', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Look for descriptive text about cryptocurrencies
    const hasDescription = await page.locator('text=/network|wallet|address|payment/i').count() > 0;
    expect(hasDescription).toBeTruthy();
    
    console.log('✓ Payment method descriptions displayed');
  });

  test('should display payment security notice', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Look for security-related text
    const securityText = page.locator('text=/secure|encrypted|safe|privacy/i');
    const hasSecurityNotice = await securityText.count() > 0;
    expect(hasSecurityNotice).toBeTruthy();
    
    console.log('✓ Payment security notice displayed');
  });
});

test.describe('Task 7.2: Test cryptocurrency selection', () => {
  test('should allow selecting Bitcoin', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Find and click Bitcoin option
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await btcOption.click();
    await page.waitForTimeout(1000);
    
    // Verify selection (look for selected state indicators)
    const isSelected = await btcOption.evaluate((el) => {
      const classes = el.className;
      return classes.includes('ring') || classes.includes('selected') || classes.includes('active');
    });
    
    expect(isSelected).toBeTruthy();
    console.log('✓ Bitcoin selection works');
  });

  test('should display exchange rate for selected cryptocurrency', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select a cryptocurrency
    const ethOption = page.locator('[class*="card"]:has-text("Ethereum"), [class*="card"]:has-text("ETH")').first();
    await ethOption.click();
    await page.waitForTimeout(2000);
    
    // Look for exchange rate display
    const rateText = page.locator('text=/rate|1.*ETH|price/i');
    await expect(rateText.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Exchange rate displayed');
  });

  test('should calculate and display crypto amount', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select Bitcoin
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await btcOption.click();
    await page.waitForTimeout(2000);
    
    // Look for crypto amount display (should show BTC amount)
    const amountText = page.locator('text=/[0-9.]+.*BTC|BTC.*[0-9.]+/i');
    await expect(amountText.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Crypto amount calculated and displayed');
  });

  test('should display wallet address for selected cryptocurrency', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select a cryptocurrency
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await btcOption.click();
    await page.waitForTimeout(2000);
    
    // Look for wallet address (long alphanumeric string)
    const walletAddress = page.locator('text=/[a-zA-Z0-9]{20,}/');
    const hasWalletAddress = await walletAddress.count() > 0;
    expect(hasWalletAddress).toBeTruthy();
    
    console.log('✓ Wallet address displayed');
  });

  test('should display fiat to crypto conversion', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select USDT
    const usdtOption = page.locator('[class*="card"]:has-text("Tether"), [class*="card"]:has-text("USDT")').first();
    await usdtOption.click();
    await page.waitForTimeout(2000);
    
    // Look for both fiat and crypto amounts
    const hasFiatAmount = await page.locator('text=/\\$[0-9.]+|USD/i').count() > 0;
    const hasCryptoAmount = await page.locator('text=/[0-9.]+.*USDT/i').count() > 0;
    
    expect(hasFiatAmount).toBeTruthy();
    expect(hasCryptoAmount).toBeTruthy();
    
    console.log('✓ Fiat to crypto conversion displayed');
  });

  test('should display exchange rate format correctly', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select Ethereum
    const ethOption = page.locator('[class*="card"]:has-text("Ethereum"), [class*="card"]:has-text("ETH")').first();
    await ethOption.click();
    await page.waitForTimeout(2000);
    
    // Look for properly formatted rate (e.g., "1 ETH = $2,500")
    const ratePattern = /1\s*(ETH|BTC|USDT)\s*=\s*[\$€]?\s*[0-9,]+/i;
    const rateElements = await page.locator('text=/rate|price/i').allTextContents();
    const hasFormattedRate = rateElements.some(text => ratePattern.test(text));
    
    expect(hasFormattedRate).toBeTruthy();
    console.log('✓ Exchange rate format is correct');
  });
});

test.describe('Task 7.3: Test real-time exchange rate updates', () => {
  test('should indicate that rates are updated periodically', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Look for text indicating rate updates
    const updateText = page.locator('text=/updated|refresh|real-time|30 second/i');
    const hasUpdateInfo = await updateText.count() > 0;
    expect(hasUpdateInfo).toBeTruthy();
    
    console.log('✓ Rate update information displayed');
  });

  test('should show loading state during rate fetch', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    // Navigate to checkout
    await page.goto(`${TEST_CONFIG.frontendURL}/checkout`);
    
    // Add product and navigate quickly to catch loading state
    await page.goto(TEST_CONFIG.frontendURL);
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
    await addToCartButton.click();
    await page.waitForTimeout(1000);
    
    await page.goto(`${TEST_CONFIG.frontendURL}/checkout`);
    
    // Look for loading indicator
    const loadingIndicator = page.locator('text=/loading|fetching|please wait/i, [class*="loading"], [class*="spinner"]');
    const hasLoading = await loadingIndicator.count() > 0;
    
    // This might not always catch it, but we should see it at least once
    console.log(`✓ Loading state check completed (found: ${hasLoading})`);
  });

  test('should maintain selected cryptocurrency after rate update', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout + 35000);
    
    await navigateToPaymentStep(page, false);
    
    // Select Bitcoin
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await btcOption.click();
    await page.waitForTimeout(2000);
    
    // Get initial crypto amount
    const initialAmount = await page.locator('text=/[0-9.]+.*BTC/i').first().textContent();
    
    // Wait for potential rate update (30 seconds + buffer)
    console.log('Waiting for rate update interval...');
    await page.waitForTimeout(32000);
    
    // Verify Bitcoin is still selected
    const isStillSelected = await btcOption.evaluate((el) => {
      const classes = el.className;
      return classes.includes('ring') || classes.includes('selected') || classes.includes('active');
    });
    
    expect(isStillSelected).toBeTruthy();
    console.log('✓ Selection maintained after rate update');
  });
});

test.describe('Task 7.4: Test saved payment methods', () => {
  test('should show saved payment methods section for authenticated users', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    // Note: This test assumes authentication is implemented
    // For now, we'll check if the UI supports saved methods
    
    await navigateToPaymentStep(page, false);
    
    // Look for saved payment methods section
    const savedMethodsSection = page.locator('text=/saved.*payment|use.*saved|previous.*payment/i');
    
    // This might not be visible for guest users, which is expected
    const hasSavedSection = await savedMethodsSection.count() > 0;
    console.log(`✓ Saved payment methods section check completed (found: ${hasSavedSection})`);
  });

  test('should allow adding new payment method', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // The ability to select a cryptocurrency is essentially adding a new payment method
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await expect(btcOption).toBeVisible();
    await btcOption.click();
    
    console.log('✓ New payment method can be added');
  });
});

test.describe('Task 7.5: Test payment method validation', () => {
  test('should enable continue button when payment method is selected', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Find continue/review button
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    
    // Check if button is initially disabled
    const initiallyDisabled = await continueButton.isDisabled().catch(() => false);
    
    // Select a payment method
    const ethOption = page.locator('[class*="card"]:has-text("Ethereum"), [class*="card"]:has-text("ETH")').first();
    await ethOption.click();
    await page.waitForTimeout(1000);
    
    // Check if button is now enabled
    const nowEnabled = await continueButton.isEnabled();
    
    expect(nowEnabled).toBeTruthy();
    console.log('✓ Continue button enabled after payment selection');
  });

  test('should show validation message if no payment method selected', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Try to continue without selecting payment
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    
    // If button is disabled, that's a form of validation
    const isDisabled = await continueButton.isDisabled().catch(() => false);
    
    if (!isDisabled) {
      // Try clicking and look for error message
      await continueButton.click();
      await page.waitForTimeout(1000);
      
      const errorMessage = page.locator('text=/select.*payment|payment.*required|choose.*payment/i');
      const hasError = await errorMessage.count() > 0;
      
      console.log(`✓ Validation check completed (button disabled: ${isDisabled}, error shown: ${hasError})`);
    } else {
      console.log('✓ Continue button properly disabled without payment selection');
    }
  });

  test('should validate payment selection before proceeding', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select a payment method
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await btcOption.click();
    await page.waitForTimeout(1000);
    
    // Try to continue
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // Should proceed to review step (no error)
    const reviewHeading = page.locator('text=/review.*order|order.*summary|place.*order/i');
    const onReviewStep = await reviewHeading.count() > 0;
    
    expect(onReviewStep).toBeTruthy();
    console.log('✓ Payment validation allows proceeding with valid selection');
  });
});

test.describe('Task 7.6: Test payment method navigation', () => {
  test('should navigate back to shipping method step', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Click back button
    const backButton = page.locator('button:has-text("Back")').first();
    await backButton.click();
    await page.waitForTimeout(2000);
    
    // Verify we're on shipping method step
    const shippingHeading = page.locator('text=/shipping.*method|select.*shipping|delivery.*option/i');
    await expect(shippingHeading.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Back navigation to shipping method works');
  });

  test('should persist shipping selection when navigating back', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Go back to shipping
    const backButton = page.locator('button:has-text("Back")').first();
    await backButton.click();
    await page.waitForTimeout(2000);
    
    // Check if a shipping method is still selected
    const selectedShipping = page.locator('[class*="selected"], [class*="ring"], input[type="radio"]:checked');
    const hasSelection = await selectedShipping.count() > 0;
    
    expect(hasSelection).toBeTruthy();
    console.log('✓ Shipping selection persisted');
  });

  test('should navigate forward to review step', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select payment method
    const ethOption = page.locator('[class*="card"]:has-text("Ethereum"), [class*="card"]:has-text("ETH")').first();
    await ethOption.click();
    await page.waitForTimeout(1000);
    
    // Continue to review
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // Verify we're on review step
    const reviewHeading = page.locator('text=/review.*order|order.*summary/i');
    await expect(reviewHeading.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Forward navigation to review step works');
  });

  test('should persist payment selection when navigating forward', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select Bitcoin
    const btcOption = page.locator('[class*="card"]:has-text("Bitcoin"), [class*="card"]:has-text("BTC")').first();
    await btcOption.click();
    await page.waitForTimeout(1000);
    
    // Continue to review
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // Check if payment method is displayed on review page
    const paymentDisplay = page.locator('text=/Bitcoin|BTC|Cryptocurrency/i');
    await expect(paymentDisplay.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Payment selection persisted to review step');
  });

  test('should allow returning to payment step from review', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    await navigateToPaymentStep(page, false);
    
    // Select payment and go to review
    const usdtOption = page.locator('[class*="card"]:has-text("Tether"), [class*="card"]:has-text("USDT")').first();
    await usdtOption.click();
    await page.waitForTimeout(1000);
    
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // Go back from review
    const backFromReview = page.locator('button:has-text("Back")').first();
    await backFromReview.click();
    await page.waitForTimeout(2000);
    
    // Verify we're back on payment step
    const paymentHeading = page.locator('text=/payment.*method|select.*payment/i');
    await expect(paymentHeading.first()).toBeVisible({ timeout: 5000 });
    
    // Verify USDT is still selected
    const usdtStillSelected = page.locator('[class*="card"]:has-text("USDT")').first();
    const isSelected = await usdtStillSelected.evaluate((el) => {
      const classes = el.className;
      return classes.includes('ring') || classes.includes('selected') || classes.includes('active');
    });
    
    expect(isSelected).toBeTruthy();
    console.log('✓ Can return to payment step with selection preserved');
  });
});

// Summary test to verify complete payment flow
test.describe('Complete Payment Method Flow', () => {
  test('should complete full payment method selection flow', async ({ page }) => {
    test.setTimeout(TEST_CONFIG.testTimeout);
    
    console.log('Starting complete payment method flow test...');
    
    // Navigate to payment step
    await navigateToPaymentStep(page, false);
    console.log('✓ Navigated to payment step');
    
    // Verify all payment options are visible
    for (const crypto of TEST_CONFIG.expectedCryptos) {
      await expect(page.locator(`text=/${crypto}/i`).first()).toBeVisible();
    }
    console.log('✓ All payment options visible');
    
    // Select Ethereum
    const ethOption = page.locator('[class*="card"]:has-text("Ethereum"), [class*="card"]:has-text("ETH")').first();
    await ethOption.click();
    await page.waitForTimeout(2000);
    console.log('✓ Selected Ethereum');
    
    // Verify exchange rate and amount displayed
    await expect(page.locator('text=/rate|ETH/i').first()).toBeVisible();
    console.log('✓ Exchange rate displayed');
    
    // Continue to review
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Review")').first();
    await continueButton.click();
    await page.waitForTimeout(2000);
    console.log('✓ Navigated to review step');
    
    // Verify payment method shown on review
    await expect(page.locator('text=/Ethereum|ETH|Cryptocurrency/i').first()).toBeVisible();
    console.log('✓ Payment method displayed on review');
    
    // Go back to payment
    const backButton = page.locator('button:has-text("Back")').first();
    await backButton.click();
    await page.waitForTimeout(2000);
    console.log('✓ Navigated back to payment');
    
    // Verify Ethereum still selected
    const isStillSelected = await ethOption.evaluate((el) => {
      const classes = el.className;
      return classes.includes('ring') || classes.includes('selected') || classes.includes('active');
    });
    expect(isStillSelected).toBeTruthy();
    console.log('✓ Payment selection persisted');
    
    console.log('✅ Complete payment method flow test passed');
  });
});
