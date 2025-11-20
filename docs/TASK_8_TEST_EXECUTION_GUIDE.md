# Task 8: Order Review and Submission - Test Execution Guide

## Overview

This guide provides instructions for executing the order review and submission audit tests for Task 8 of the checkout payment flow audit.

## Test File Location

```
frontend/tests/audit/order-review-audit.test.ts
```

## Prerequisites

### 1. Backend Server Running
The backend API must be running on `http://localhost:3001`:

```bash
cd backend
npm run dev
```

### 2. Frontend Server Running
The frontend application must be running on `http://localhost:3000`:

```bash
cd frontend
npm run dev
```

### 3. Test Data Setup
Ensure the database has test products available:

```bash
cd backend
node scripts/setup-audit-environment.js
```

## Running the Tests

### Run All Task 8 Tests
```bash
cd frontend
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts
```

### Run Specific Test Suites

#### Task 8.1: Order Review Display
```bash
npx playwright test tests/audit/order-review-audit.test.ts -g "Task 8.1" --config=playwright-audit.config.ts
```

#### Task 8.2: Address Display
```bash
npx playwright test tests/audit/order-review-audit.test.ts -g "Task 8.2" --config=playwright-audit.config.ts
```

#### Task 8.3: Shipping and Payment Display
```bash
npx playwright test tests/audit/order-review-audit.test.ts -g "Task 8.3" --config=playwright-audit.config.ts
```

#### Task 8.4: Edit Functionality
```bash
npx playwright test tests/audit/order-review-audit.test.ts -g "Task 8.4" --config=playwright-audit.config.ts
```

#### Task 8.5: Place Order Button State
```bash
npx playwright test tests/audit/order-review-audit.test.ts -g "Task 8.5" --config=playwright-audit.config.ts
```

#### Task 8.6: Order Submission
```bash
npx playwright test tests/audit/order-review-audit.test.ts -g "Task 8.6" --config=playwright-audit.config.ts
```

### Run with UI Mode (Recommended for Debugging)
```bash
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts --ui
```

### Run with Headed Browser (See What's Happening)
```bash
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts --headed
```

### Generate HTML Report
```bash
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts --reporter=html
npx playwright show-report
```

## Test Coverage

### Task 8.1: Order Review Display (7 tests)
- ✓ Display all order items with details
- ✓ Display item quantities
- ✓ Display item prices
- ✓ Display subtotal calculation
- ✓ Display shipping cost
- ✓ Display total amount calculation
- ✓ Verify total equals subtotal plus shipping

### Task 8.2: Address Display on Review (3 tests)
- ✓ Display shipping address completely
- ✓ Display billing address or "same as shipping" indicator
- ✓ Format addresses correctly

### Task 8.3: Shipping and Payment Display (4 tests)
- ✓ Display selected shipping method
- ✓ Display shipping cost and estimated delivery
- ✓ Display selected payment method
- ✓ Display payment amount for crypto

### Task 8.4: Edit Functionality (3 tests)
- ✓ Navigate to shipping address step when edit clicked
- ✓ Persist data when returning from edit
- ✓ Allow completing checkout after editing

### Task 8.5: Place Order Button State (4 tests)
- ✓ Enable place order button when all info complete
- ✓ Show place order button prominently
- ✓ Prevent double-click on place order button
- ✓ Show loading state during submission

### Task 8.6: Order Submission (4 tests)
- ✓ Submit order when place order clicked
- ✓ Display crypto payment screen for crypto orders
- ✓ Generate order number
- ✓ Handle order submission errors gracefully

### Complete Flow Test (1 test)
- ✓ Complete full order review and submission flow

**Total: 26 tests**

## Expected Test Results

All tests should pass when:
1. Backend and frontend servers are running
2. Test data is properly seeded
3. All checkout steps are functioning correctly
4. Order review page displays all required information
5. Place order button works correctly
6. Order submission creates orders successfully

## Troubleshooting

### Tests Timeout
- **Issue**: Tests timeout after 60 seconds
- **Solution**: Ensure both backend and frontend are running and responsive
- **Check**: Visit `http://localhost:3000` and `http://localhost:3001/health` manually

### Cannot Find Products
- **Issue**: Tests fail because no products are available
- **Solution**: Run the audit environment setup script:
  ```bash
  cd backend
  node scripts/setup-audit-environment.js
  ```

### Navigation Failures
- **Issue**: Tests fail to navigate through checkout steps
- **Solution**: 
  - Check that cart functionality is working
  - Verify shipping and payment methods are available
  - Check browser console for JavaScript errors

### Element Not Found
- **Issue**: Tests cannot find expected elements
- **Solution**:
  - Run tests in headed mode to see what's displayed
  - Check if UI components have changed
  - Update selectors in test file if needed

### Order Submission Fails
- **Issue**: Place order button doesn't work
- **Solution**:
  - Check backend logs for errors
  - Verify database connection
  - Check that order creation endpoint is working

## Test Maintenance

### Updating Selectors
If UI components change, update the selectors in the test file:
- Product cards: `[data-testid="product-card"]`
- Add to cart buttons: `button:has-text("Add to Cart")`
- Continue buttons: `button:has-text("Continue")`
- Place order button: `button:has-text("Place Order")`

### Adding New Tests
Follow the existing test structure:
1. Use descriptive test names
2. Set appropriate timeout
3. Navigate to review step using helper function
4. Verify expected behavior
5. Log success with console.log

### Test Data Requirements
Tests expect:
- At least one product available for purchase
- Shipping methods configured for US
- Cryptocurrency payment options available (BTC, ETH, USDT)

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Order Review Audit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Setup test environment
        run: |
          cd backend
          node scripts/setup-audit-environment.js
      
      - name: Start backend
        run: cd backend && npm run dev &
      
      - name: Start frontend
        run: cd frontend && npm run dev &
      
      - name: Wait for servers
        run: sleep 30
      
      - name: Run tests
        run: |
          cd frontend
          npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Performance Considerations

- Each test takes approximately 10-15 seconds
- Full suite takes about 5-7 minutes
- Tests run sequentially to avoid race conditions
- Consider running in parallel for faster execution (requires proper test isolation)

## Next Steps

After running these tests:
1. Review the test report for any failures
2. Document any issues found in the audit report
3. Create tickets for bugs discovered
4. Proceed to Task 9: Payment Processing Audit
