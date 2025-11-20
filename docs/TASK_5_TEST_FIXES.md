# Task 5: Shipping Information Audit Test Fixes

## Summary

Fixed the shipping information audit tests to properly handle the checkout flow and form interactions.

## Issues Identified

1. **Navigation Helper Issues**: Tests were timing out because the checkout page requires:
   - Items in the cart
   - Guest checkout authentication
   - Proper waiting for form elements to load

2. **Selector Issues**: Tests were using incorrect button text:
   - Changed from `"Continue"` to `"Save Address"` for form submission
   - Changed from `"Continue"` to `"Continue to Shipping"` for navigation

3. **Timing Issues**: Added proper waits and visibility checks before interacting with elements

## Changes Made

### 1. Updated Navigation Helper (`navigateToCheckout`)

```typescript
async function navigateToCheckout(page: Page) {
  // Navigate to products page
  await page.goto('/products');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Wait for products to load
  
  // Add a product to cart
  const addToCartButtons = page.locator('button:has-text("Add to Cart")');
  const count = await addToCartButtons.count();
  
  if (count > 0) {
    await addToCartButtons.first().click();
    await page.waitForTimeout(1500); // Wait for cart to update
  }
  
  // Navigate to checkout
  await page.goto('/checkout');
  await page.waitForTimeout(2000); // Wait for page to load
  
  // Handle guest checkout option if present
  const guestCheckoutButton = page.locator('button:has-text("Continue as Guest")');
  try {
    if (await guestCheckoutButton.isVisible({ timeout: 3000 })) {
      const emailInput = page.locator('input[type="email"]').first();
      await emailInput.fill('guest@example.com');
      await guestCheckoutButton.click();
      await page.waitForTimeout(2000); // Wait for form to appear
    }
  } catch (e) {
    console.log('Guest checkout not needed or already authenticated');
  }
  
  // Wait for the shipping address form to be visible
  await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
}
```

### 2. Updated Form Validation Tests

All validation tests now:
- Wait for form visibility with `await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 })`
- Use correct button selector: `button:has-text("Save Address")`
- Have proper timeout handling

### 3. Updated Country-Specific Validation Tests

- Added visibility checks before filling forms
- Changed button selector to `"Save Address"`
- Maintained proper wait times between actions

### 4. Updated Billing Address Tests

- Improved checkbox selector to handle different DOM structures
- Added proper waits after toggling checkbox
- Updated button text to `"Continue to Shipping"`

### 5. Updated Submission Tests

- Changed button selector to `"Continue to Shipping"`
- Added visibility checks before form interactions
- Improved navigation verification

## Test Structure

The tests now follow this pattern:

```typescript
test('test name', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Wait for form to be visible
  await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
  
  // Perform test actions
  await page.locator('input[name="firstName"]').fill('John');
  // ... more actions
  
  // Submit or verify
  const submitButton = page.locator('button:has-text("Save Address")');
  await submitButton.click();
  
  // Verify results
  const errorMessage = page.locator('text=/required/i');
  await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
});
```

## Running the Tests

### Prerequisites

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Ensure Database is Running**:
   - PostgreSQL should be running with test data
   - Products should be available in the database

### Run Tests

```bash
cd frontend
npx playwright test tests/audit/shipping-information-audit.test.ts --config=playwright-audit.config.ts --reporter=list
```

### Run Specific Test Group

```bash
# Run only form validation tests
npx playwright test tests/audit/shipping-information-audit.test.ts -g "5.1 Test shipping address form"

# Run only country-specific validation
npx playwright test tests/audit/shipping-information-audit.test.ts -g "5.2 Test country-specific"

# Run only billing address tests
npx playwright test tests/audit/shipping-information-audit.test.ts -g "5.4 Test billing address"
```

## Known Issues

1. **Timeout on First Run**: The first test may timeout if the application is still loading. This is expected behavior.

2. **Cart State**: Tests assume a clean cart state. If cart has items from previous sessions, tests may behave differently.

3. **Guest Checkout**: Tests use guest checkout flow. Authenticated user tests would need different setup.

## Form Field Reference

The AddressForm component uses these field names:
- `firstName` - First name input
- `lastName` - Last name input
- `company` - Company name (optional)
- `street` - Street address
- `city` - City
- `state` - State/Province
- `postalCode` - Postal/ZIP code
- `country` - Country select dropdown
- `phone` - Phone number (optional)
- `isDefault` - Default address checkbox

## Button Text Reference

- **Save Address**: Submits the address form (validates fields)
- **Continue to Shipping**: Proceeds to shipping method step (after address is saved)
- **Back**: Returns to previous step
- **Continue as Guest**: Initiates guest checkout flow

## Next Steps

1. Ensure backend and frontend are running
2. Verify products are available in the database
3. Run tests with proper environment setup
4. Review test results and adjust timeouts if needed
5. Consider adding test fixtures for consistent test data
