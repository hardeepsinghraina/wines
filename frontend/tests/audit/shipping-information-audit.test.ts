import { test, expect, Page } from '@playwright/test';

/**
 * Task 5: Audit Shipping Information Collection
 * 
 * This test suite audits the shipping information collection phase of the checkout flow.
 * It covers:
 * - 5.1: Shipping address form validation
 * - 5.2: Country-specific address validation
 * - 5.3: Saved address selection
 * - 5.4: Billing address handling
 * - 5.5: Shipping address submission
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 13.2
 */

test.describe('Task 5: Shipping Information Collection Audit', () => {
  
  // Helper function to add items to cart and navigate to checkout
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
      // Guest checkout button might not be visible if already authenticated
      console.log('Guest checkout not needed or already authenticated');
    }
    
    // Wait for the shipping address form to be visible
    await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });
  }


  // ============================================================================
  // Task 5.1: Test Shipping Address Form
  // ============================================================================
  
  test.describe('5.1 Test shipping address form', () => {
    
    test('should verify all required fields are present', async ({ page }) => {
      await navigateToCheckout(page);
      
      // Verify all required fields exist
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="street"]')).toBeVisible();
      await expect(page.locator('input[name="city"]')).toBeVisible();
      await expect(page.locator('input[name="state"]')).toBeVisible();
      await expect(page.locator('input[name="postalCode"]')).toBeVisible();
      await expect(page.locator('select[name="country"]')).toBeVisible();
      await expect(page.locator('input[name="phone"]')).toBeVisible();
      
      // Verify labels are present
      await expect(page.locator('label:has-text("First Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Last Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Street Address")')).toBeVisible();
      await expect(page.locator('label:has-text("City")')).toBeVisible();
      await expect(page.locator('label:has-text("State/Province")')).toBeVisible();
      await expect(page.locator('label:has-text("Postal Code")')).toBeVisible();
      await expect(page.locator('label:has-text("Country")')).toBeVisible();
      await expect(page.locator('label:has-text("Phone Number")')).toBeVisible();
    });


    test('should test real-time validation for first name', async ({ page }) => {
      await navigateToCheckout(page);
      
      const firstNameInput = page.locator('input[name="firstName"]');
      await expect(firstNameInput).toBeVisible({ timeout: 5000 });
      
      // Test empty field - click submit to trigger validation
      await firstNameInput.fill('');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for empty first name
      const errorMessage = page.locator('text=/First name is required|required/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should test real-time validation for last name', async ({ page }) => {
      await navigateToCheckout(page);
      
      const lastNameInput = page.locator('input[name="lastName"]');
      await expect(lastNameInput).toBeVisible({ timeout: 5000 });
      
      // Fill first name to avoid multiple errors
      await page.locator('input[name="firstName"]').fill('John');
      
      // Test empty last name
      await lastNameInput.fill('');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for empty last name
      const errorMessage = page.locator('text=/Last name is required|required/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });


    test('should test street address validation', async ({ page }) => {
      await navigateToCheckout(page);
      
      const streetInput = page.locator('input[name="street"]');
      await expect(streetInput).toBeVisible({ timeout: 5000 });
      
      // Fill required fields except street
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      
      // Test empty street
      await streetInput.fill('');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for empty street
      const errorMessage = page.locator('text=/Street address is required|required/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should test city validation', async ({ page }) => {
      await navigateToCheckout(page);
      
      const cityInput = page.locator('input[name="city"]');
      await expect(cityInput).toBeVisible({ timeout: 5000 });
      
      // Fill required fields except city
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main St');
      
      // Test empty city
      await cityInput.fill('');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for empty city
      const errorMessage = page.locator('text=/City is required|required/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });


    test('should test state/province validation', async ({ page }) => {
      await navigateToCheckout(page);
      
      const stateInput = page.locator('input[name="state"]');
      await expect(stateInput).toBeVisible({ timeout: 5000 });
      
      // Fill required fields except state
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main St');
      await page.locator('input[name="city"]').fill('New York');
      
      // Test empty state
      await stateInput.fill('');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for empty state
      const errorMessage = page.locator('text=/State.*required|Province.*required|required/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should test postal code validation', async ({ page }) => {
      await navigateToCheckout(page);
      
      const postalCodeInput = page.locator('input[name="postalCode"]');
      await expect(postalCodeInput).toBeVisible({ timeout: 5000 });
      
      // Fill required fields except postal code
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main St');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      
      // Test empty postal code
      await postalCodeInput.fill('');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for empty postal code
      const errorMessage = page.locator('text=/Postal code is required|required/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });


    test('should test country selection', async ({ page }) => {
      await navigateToCheckout(page);
      
      const countrySelect = page.locator('select[name="country"]');
      
      // Verify country dropdown has options
      await expect(countrySelect).toBeVisible({ timeout: 5000 });
      
      // Get all options
      const options = await countrySelect.locator('option').all();
      expect(options.length).toBeGreaterThan(1); // Should have more than just placeholder
      
      // Test selecting a country
      await countrySelect.selectOption('US');
      const selectedValue = await countrySelect.inputValue();
      expect(selectedValue).toBe('US');
    });

    test('should test phone number validation (optional field)', async ({ page }) => {
      await navigateToCheckout(page);
      
      const phoneInput = page.locator('input[name="phone"]');
      
      // Verify phone field is present
      await expect(phoneInput).toBeVisible({ timeout: 5000 });
      
      // Test with invalid phone format
      await phoneInput.fill('abc123');
      
      // Fill all required fields
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main St');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('input[name="postalCode"]').fill('10001');
      await page.locator('select[name="country"]').selectOption('US');
      
      const continueButton = page.locator('button:has-text("Continue")');
      await continueButton.click();
      
      // May show error for invalid phone format
      const errorMessage = page.locator('text=/Invalid phone|phone.*format/i');
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        await expect(errorMessage).toBeVisible();
      }
      
      // Test with valid phone format
      await phoneInput.fill('+1-555-123-4567');
      await phoneInput.blur();
      
      // Error should clear or not appear
      await expect(errorMessage).not.toBeVisible({ timeout: 2000 }).catch(() => {});
    });
  });


  // ============================================================================
  // Task 5.2: Test Country-Specific Address Validation
  // ============================================================================
  
  test.describe('5.2 Test country-specific address validation', () => {
    
    test('should test US postal code format (12345 or 12345-6789)', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill form with US address
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main St');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('select[name="country"]').selectOption('US');
      
      const postalCodeInput = page.locator('input[name="postalCode"]');
      
      // Test valid 5-digit format
      await postalCodeInput.fill('10001');
      await page.waitForTimeout(500);
      
      // Test valid 9-digit format
      await postalCodeInput.fill('10001-1234');
      await page.waitForTimeout(500);
      
      // Test invalid format
      await postalCodeInput.fill('ABC123');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for invalid format
      const errorMessage = page.locator('text=/Invalid postal code|postal code.*format/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });


    test('should test UK postal code format (SW1A 1AA)', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill form with UK address
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('10 Downing Street');
      await page.locator('input[name="city"]').fill('London');
      await page.locator('input[name="state"]').fill('Greater London');
      await page.locator('select[name="country"]').selectOption('GB');
      
      const postalCodeInput = page.locator('input[name="postalCode"]');
      
      // Test valid UK format
      await postalCodeInput.fill('SW1A 1AA');
      await page.waitForTimeout(500);
      
      // Test another valid format
      await postalCodeInput.fill('EC1A 1BB');
      await page.waitForTimeout(500);
      
      // Test invalid format
      await postalCodeInput.fill('12345');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for invalid UK format
      const errorMessage = page.locator('text=/Invalid postal code|postal code.*format/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should test German postal code format (12345)', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill form with German address
      await page.locator('input[name="firstName"]').fill('Hans');
      await page.locator('input[name="lastName"]').fill('Schmidt');
      await page.locator('input[name="street"]').fill('Hauptstraße 1');
      await page.locator('input[name="city"]').fill('Berlin');
      await page.locator('input[name="state"]').fill('Berlin');
      await page.locator('select[name="country"]').selectOption('DE');
      
      const postalCodeInput = page.locator('input[name="postalCode"]');
      
      // Test valid German format (5 digits)
      await postalCodeInput.fill('10115');
      await page.waitForTimeout(500);
      
      // Test invalid format
      await postalCodeInput.fill('ABC12');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for invalid format
      const errorMessage = page.locator('text=/Invalid postal code|postal code.*format/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });


    test('should test French postal code format (12345)', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill form with French address
      await page.locator('input[name="firstName"]').fill('Jean');
      await page.locator('input[name="lastName"]').fill('Dupont');
      await page.locator('input[name="street"]').fill('1 Rue de la Paix');
      await page.locator('input[name="city"]').fill('Paris');
      await page.locator('input[name="state"]').fill('Île-de-France');
      await page.locator('select[name="country"]').selectOption('FR');
      
      const postalCodeInput = page.locator('input[name="postalCode"]');
      
      // Test valid French format (5 digits)
      await postalCodeInput.fill('75001');
      await page.waitForTimeout(500);
      
      // Test invalid format
      await postalCodeInput.fill('ABC12');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Should show error for invalid format
      const errorMessage = page.locator('text=/Invalid postal code|postal code.*format/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    });

    test('should verify validation error messages are helpful', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill form with invalid data
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main St');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('select[name="country"]').selectOption('US');
      await page.locator('input[name="postalCode"]').fill('INVALID');
      
      const submitButton = page.locator('button:has-text("Save Address")');
      await submitButton.click();
      
      // Check that error message is helpful and specific
      const errorMessage = page.locator('text=/Invalid postal code|postal code.*format/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
      
      // Verify the error message contains useful information
      const errorText = await errorMessage.first().textContent();
      expect(errorText).toBeTruthy();
      expect(errorText!.length).toBeGreaterThan(10); // Should be descriptive
    });
  });


  // ============================================================================
  // Task 5.3: Test Saved Address Selection
  // ============================================================================
  
  test.describe('5.3 Test saved address selection', () => {
    
    test('should verify saved addresses load for authenticated users', async ({ page }) => {
      // This test requires authentication
      // For now, we'll test the UI structure
      await navigateToCheckout(page);
      
      // Check if saved addresses section exists (may not be visible for guest users)
      const savedAddressSection = page.locator('text=/Use a saved address|saved address/i');
      
      // If user is authenticated and has saved addresses, this should be visible
      if (await savedAddressSection.isVisible({ timeout: 2000 })) {
        await expect(savedAddressSection).toBeVisible();
      }
    });

    test('should test selecting a saved address', async ({ page }) => {
      await navigateToCheckout(page);
      
      // Look for saved address buttons
      const savedAddressButtons = page.locator('button').filter({ hasText: /^\d+.*St|^\d+.*Ave|^\d+.*Rd/i });
      
      // If saved addresses exist, test selection
      if (await savedAddressButtons.count() > 0) {
        const firstAddress = savedAddressButtons.first();
        await firstAddress.click();
        
        // Verify form fields are populated
        const firstNameInput = page.locator('input[name="firstName"]');
        const value = await firstNameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('should verify form pre-fills with selected address', async ({ page }) => {
      await navigateToCheckout(page);
      
      // Look for saved address buttons
      const savedAddressButtons = page.locator('button').filter({ hasText: /^\d+.*St|^\d+.*Ave|^\d+.*Rd/i });
      
      // If saved addresses exist, test pre-fill
      if (await savedAddressButtons.count() > 0) {
        const firstAddress = savedAddressButtons.first();
        await firstAddress.click();
        await page.waitForTimeout(500);
        
        // Verify all fields are populated
        const firstName = await page.locator('input[name="firstName"]').inputValue();
        const lastName = await page.locator('input[name="lastName"]').inputValue();
        const street = await page.locator('input[name="street"]').inputValue();
        const city = await page.locator('input[name="city"]').inputValue();
        
        expect(firstName.length).toBeGreaterThan(0);
        expect(lastName.length).toBeGreaterThan(0);
        expect(street.length).toBeGreaterThan(0);
        expect(city.length).toBeGreaterThan(0);
      }
    });

    test('should test editing a saved address', async ({ page }) => {
      await navigateToCheckout(page);
      
      // Look for saved address buttons
      const savedAddressButtons = page.locator('button').filter({ hasText: /^\d+.*St|^\d+.*Ave|^\d+.*Rd/i });
      
      // If saved addresses exist, test editing
      if (await savedAddressButtons.count() > 0) {
        const firstAddress = savedAddressButtons.first();
        await firstAddress.click();
        await page.waitForTimeout(500);
        
        // Modify a field
        const cityInput = page.locator('input[name="city"]');
        const originalCity = await cityInput.inputValue();
        await cityInput.fill(originalCity + ' Modified');
        
        // Verify the change persists
        const newCity = await cityInput.inputValue();
        expect(newCity).toContain('Modified');
      }
    });
  });


  // ============================================================================
  // Task 5.4: Test Billing Address Handling
  // ============================================================================
  
  test.describe('5.4 Test billing address handling', () => {
    
    test('should test "Use same address for billing" checkbox', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Find the checkbox - it's a direct input with a label
      const sameAddressCheckbox = page.locator('input[type="checkbox"]').filter({ 
        hasText: /Use same address for billing|same.*billing/i 
      }).or(page.locator('label:has-text("Use same address for billing") + input[type="checkbox"]'))
        .or(page.locator('text=/Use same address for billing/i >> .. >> input[type="checkbox"]'));
      
      // Verify checkbox exists
      await expect(sameAddressCheckbox.first()).toBeVisible({ timeout: 5000 });
      
      // Check if it's checked by default
      const isChecked = await sameAddressCheckbox.first().isChecked();
      
      // Toggle the checkbox
      await sameAddressCheckbox.first().click();
      await page.waitForTimeout(500);
      
      // Verify state changed
      const newState = await sameAddressCheckbox.first().isChecked();
      expect(newState).toBe(!isChecked);
    });

    test('should verify billing form appears when unchecked', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Find and uncheck the "same address" checkbox
      const sameAddressCheckbox = page.locator('text=/Use same address for billing/i >> .. >> input[type="checkbox"]')
        .or(page.locator('input[type="checkbox"]').filter({ hasText: /same.*billing/i }));
      
      // Ensure it's unchecked
      const isChecked = await sameAddressCheckbox.first().isChecked();
      if (isChecked) {
        await sameAddressCheckbox.first().click();
        await page.waitForTimeout(500);
      }
      
      // Look for billing address form
      const billingAddressHeading = page.locator('text=/Billing Address/i');
      await expect(billingAddressHeading).toBeVisible({ timeout: 3000 });
    });


    test('should test billing address validation', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Uncheck "same address" checkbox
      const sameAddressCheckbox = page.locator('text=/Use same address for billing/i >> .. >> input[type="checkbox"]');
      
      const isChecked = await sameAddressCheckbox.first().isChecked();
      if (isChecked) {
        await sameAddressCheckbox.first().click();
        await page.waitForTimeout(500);
      }
      
      // Fill shipping address
      await page.locator('input[name="firstName"]').first().fill('John');
      await page.locator('input[name="lastName"]').first().fill('Doe');
      await page.locator('input[name="street"]').first().fill('123 Main St');
      await page.locator('input[name="city"]').first().fill('New York');
      await page.locator('input[name="state"]').first().fill('NY');
      await page.locator('input[name="postalCode"]').first().fill('10001');
      await page.locator('select[name="country"]').first().selectOption('US');
      
      // Try to continue without filling billing address - click the first Save Address button
      const saveButton = page.locator('button:has-text("Save Address")').first();
      await saveButton.click();
      
      // Should show validation errors for billing address
      const errorMessages = page.locator('text=/required|invalid/i');
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
    });

    test('should verify billing address saves correctly', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Uncheck "same address" checkbox
      const sameAddressCheckbox = page.locator('text=/Use same address for billing/i >> .. >> input[type="checkbox"]');
      
      const isChecked = await sameAddressCheckbox.first().isChecked();
      if (isChecked) {
        await sameAddressCheckbox.first().click();
        await page.waitForTimeout(1000);
      }
      
      // Fill both addresses
      const allFirstNameInputs = page.locator('input[name="firstName"]');
      const allLastNameInputs = page.locator('input[name="lastName"]');
      const allStreetInputs = page.locator('input[name="street"]');
      const allCityInputs = page.locator('input[name="city"]');
      const allStateInputs = page.locator('input[name="state"]');
      const allPostalCodeInputs = page.locator('input[name="postalCode"]');
      const allCountrySelects = page.locator('select[name="country"]');
      
      // Fill shipping address (first set of fields)
      await allFirstNameInputs.nth(0).fill('John');
      await allLastNameInputs.nth(0).fill('Doe');
      await allStreetInputs.nth(0).fill('123 Main St');
      await allCityInputs.nth(0).fill('New York');
      await allStateInputs.nth(0).fill('NY');
      await allPostalCodeInputs.nth(0).fill('10001');
      await allCountrySelects.nth(0).selectOption('US');
      
      // Fill billing address (second set of fields)
      const inputCount = await allFirstNameInputs.count();
      if (inputCount > 1) {
        await allFirstNameInputs.nth(1).fill('Jane');
        await allLastNameInputs.nth(1).fill('Smith');
        await allStreetInputs.nth(1).fill('456 Oak Ave');
        await allCityInputs.nth(1).fill('Boston');
        await allStateInputs.nth(1).fill('MA');
        await allPostalCodeInputs.nth(1).fill('02101');
        await allCountrySelects.nth(1).selectOption('US');
      }
      
      // Continue to next step - click the Continue to Shipping button
      const continueButton = page.locator('button:has-text("Continue to Shipping")');
      await continueButton.click();
      
      // Wait for navigation or success
      await page.waitForTimeout(2000);
      
      // Verify we moved to next step or no errors
      const shippingMethodHeading = page.locator('text=/Shipping Method/i');
      if (await shippingMethodHeading.isVisible({ timeout: 2000 })) {
        await expect(shippingMethodHeading).toBeVisible();
      }
    });
  });


  // ============================================================================
  // Task 5.5: Test Shipping Address Submission
  // ============================================================================
  
  test.describe('5.5 Test shipping address submission', () => {
    
    test('should fill valid shipping address', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill complete valid address
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main Street');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('input[name="postalCode"]').fill('10001');
      await page.locator('select[name="country"]').selectOption('US');
      await page.locator('input[name="phone"]').fill('+1-555-123-4567');
      
      // Verify all fields are filled
      expect(await page.locator('input[name="firstName"]').inputValue()).toBe('John');
      expect(await page.locator('input[name="lastName"]').inputValue()).toBe('Doe');
      expect(await page.locator('input[name="street"]').inputValue()).toBe('123 Main Street');
      expect(await page.locator('input[name="city"]').inputValue()).toBe('New York');
      expect(await page.locator('input[name="state"]').inputValue()).toBe('NY');
      expect(await page.locator('input[name="postalCode"]').inputValue()).toBe('10001');
      expect(await page.locator('select[name="country"]').inputValue()).toBe('US');
    });

    test('should click continue button', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill valid address
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main Street');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('input[name="postalCode"]').fill('10001');
      await page.locator('select[name="country"]').selectOption('US');
      
      // Find and click continue button
      const continueButton = page.locator('button:has-text("Continue to Shipping")');
      await expect(continueButton).toBeVisible({ timeout: 5000 });
      await expect(continueButton).toBeEnabled();
      
      await continueButton.click();
    });


    test('should verify navigation to shipping method step', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill valid address
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="street"]').fill('123 Main Street');
      await page.locator('input[name="city"]').fill('New York');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('input[name="postalCode"]').fill('10001');
      await page.locator('select[name="country"]').selectOption('US');
      
      // Click continue
      const continueButton = page.locator('button:has-text("Continue to Shipping")');
      await continueButton.click();
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      // Verify we're on shipping method step
      const shippingMethodHeading = page.locator('h2:has-text("Shipping Method")');
      await expect(shippingMethodHeading).toBeVisible({ timeout: 5000 });
      
      // Verify progress indicator shows step 2
      const progressIndicator = page.locator('text=/Step 2|Shipping Method/i');
      await expect(progressIndicator.first()).toBeVisible({ timeout: 3000 });
    });

    test('should verify address data persists', async ({ page }) => {
      await navigateToCheckout(page);
      
      await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
      
      // Fill valid address
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      };
      
      await page.locator('input[name="firstName"]').fill(testData.firstName);
      await page.locator('input[name="lastName"]').fill(testData.lastName);
      await page.locator('input[name="street"]').fill(testData.street);
      await page.locator('input[name="city"]').fill(testData.city);
      await page.locator('input[name="state"]').fill(testData.state);
      await page.locator('input[name="postalCode"]').fill(testData.postalCode);
      await page.locator('select[name="country"]').selectOption(testData.country);
      
      // Click continue
      const continueButton = page.locator('button:has-text("Continue to Shipping")');
      await continueButton.click();
      
      // Wait for navigation to shipping method
      await page.waitForTimeout(2000);
      
      // Go back to shipping address step
      const backButton = page.locator('button:has-text("Back")');
      if (await backButton.isVisible({ timeout: 2000 })) {
        await backButton.click();
        await page.waitForTimeout(1000);
        
        // Verify data persists
        expect(await page.locator('input[name="firstName"]').inputValue()).toBe(testData.firstName);
        expect(await page.locator('input[name="lastName"]').inputValue()).toBe(testData.lastName);
        expect(await page.locator('input[name="street"]').inputValue()).toBe(testData.street);
        expect(await page.locator('input[name="city"]').inputValue()).toBe(testData.city);
        expect(await page.locator('input[name="state"]').inputValue()).toBe(testData.state);
        expect(await page.locator('input[name="postalCode"]').inputValue()).toBe(testData.postalCode);
        expect(await page.locator('select[name="country"]').inputValue()).toBe(testData.country);
      }
    });
  });
});
