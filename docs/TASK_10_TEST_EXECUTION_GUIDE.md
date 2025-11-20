# Task 10: Order Confirmation Audit - Test Execution Guide

## Quick Start

```bash
# 1. Ensure backend is running
cd backend
npm run dev

# 2. Ensure frontend is running (in another terminal)
cd frontend
npm run dev

# 3. Run the order confirmation tests
cd frontend
npx playwright test tests/audit/order-confirmation-audit.test.ts
```

## Prerequisites

### 1. Environment Setup

Ensure both servers are running:

```bash
# Terminal 1: Backend (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend
npm run dev
```

### 2. Test Data Setup

The tests require:
- ✅ Test user account (email: test@example.com)
- ✅ Products in database
- ✅ Working cart functionality
- ✅ Working checkout flow
- ✅ Working order creation

### 3. Database State

Ensure the database has:
- At least one product with inventory
- Test user account created
- Cart and order tables accessible

## Running Tests

### Run All Order Confirmation Tests

```bash
cd frontend
npx playwright test tests/audit/order-confirmation-audit.test.ts
```

### Run Specific Test Suites

```bash
# Test order confirmation page display (10.1)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.1"

# Test order details display (10.2)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.2"

# Test shipping information (10.3)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.3"

# Test payment information (10.4)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.4"

# Test order confirmation email (10.5)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.5"

# Test order confirmation actions (10.6)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.6"

# Test order history (10.7)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.7"

# Test recommended products (10.8)
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "10.8"

# Run integration test
npx playwright test tests/audit/order-confirmation-audit.test.ts -g "Integration"
```

### Run with Different Options

```bash
# Run with UI mode (interactive debugging)
npx playwright test tests/audit/order-confirmation-audit.test.ts --ui

# Run with headed browser (see the browser)
npx playwright test tests/audit/order-confirmation-audit.test.ts --headed

# Run with specific browser
npx playwright test tests/audit/order-confirmation-audit.test.ts --project=chromium
npx playwright test tests/audit/order-confirmation-audit.test.ts --project=firefox
npx playwright test tests/audit/order-confirmation-audit.test.ts --project=webkit

# Run with debug mode
npx playwright test tests/audit/order-confirmation-audit.test.ts --debug

# Run and generate HTML report
npx playwright test tests/audit/order-confirmation-audit.test.ts --reporter=html

# Run with video recording
npx playwright test tests/audit/order-confirmation-audit.test.ts --video=on
```

## Test Execution Flow

### Complete Test Flow

1. **Login** → Test user logs in
2. **Add to Cart** → Product added to cart
3. **Checkout** → Complete checkout flow
4. **Order Confirmation** → Verify confirmation page
5. **Order Details** → Verify all details display
6. **Order Actions** → Test download, modify, cancel
7. **Order History** → Verify order in history

### Individual Test Flows

#### 10.1: Order Confirmation Page Display
```
1. Complete checkout
2. Verify redirect to /order-confirmation/[orderId]
3. Check order number displays
4. Check success message displays
5. Check order status displays
6. Measure page load time
```

#### 10.2: Order Details Display
```
1. Navigate to order confirmation
2. Verify order items section exists
3. Check product images display
4. Check quantities display
5. Check prices display
6. Verify subtotal, shipping, tax, total
7. Check order date displays
```

#### 10.3: Shipping Information Display
```
1. Navigate to order confirmation
2. Verify shipping section exists
3. Check shipping address displays
4. Check estimated delivery displays
5. Check tracking number (if available)
6. Check carrier information (if available)
```

#### 10.4: Payment Information Display
```
1. Navigate to order confirmation
2. Verify payment section exists
3. Check payment method displays
4. Check payment amount displays
5. Check payment status displays
6. Check transaction ID (for crypto)
```

#### 10.5: Order Confirmation Email
```
1. Complete order
2. Check for email confirmation message
3. Verify resend email option (if present)
```

#### 10.6: Order Confirmation Actions
```
1. Navigate to order confirmation
2. Test "Download Receipt" button
3. Verify download triggers
4. Test "View All Orders" link
5. Test "Continue Shopping" button
6. Test "Modify Order" (if pending)
7. Test "Cancel Order" (if eligible)
```

#### 10.7: Order History
```
1. Complete order and get order number
2. Navigate to /account/orders
3. Verify order appears in list
4. Click order details link
5. Verify navigation to order details
6. Check filtering/sorting options
```

#### 10.8: Recommended Products
```
1. Navigate to order confirmation
2. Check for recommendations section
3. Verify product images display
4. Test product links
5. Test add to cart functionality
```

## Expected Results

### Successful Test Run

```
✓ 10.1: Test order confirmation page display (5 tests)
  ✓ should redirect to confirmation page after payment
  ✓ should display order number prominently
  ✓ should display success message
  ✓ should display order status correctly
  ✓ should load confirmation page within 2 seconds

✓ 10.2: Test order details display (4 tests)
  ✓ should display all order items with images
  ✓ should display item quantities and prices
  ✓ should display subtotal, shipping, tax, and total
  ✓ should display order date

✓ 10.3: Test shipping information display (4 tests)
  ✓ should display shipping address
  ✓ should display estimated delivery date
  ✓ should display tracking number when available
  ✓ should display carrier information

✓ 10.4: Test payment information display (4 tests)
  ✓ should display payment method
  ✓ should display payment amount
  ✓ should display payment status
  ✓ should display transaction ID for crypto payments

✓ 10.5: Test order confirmation email (2 tests)
  ✓ should indicate confirmation email was sent
  ✓ should have option to resend confirmation email

✓ 10.6: Test order confirmation actions (7 tests)
  ✓ should have "Download Receipt" button
  ✓ should download receipt when clicked
  ✓ should have "View All Orders" link
  ✓ should have "Continue Shopping" button
  ✓ should navigate to products page when "Continue Shopping" clicked
  ✓ should show "Modify Order" button for pending orders
  ✓ should show "Cancel Order" button for eligible orders

✓ 10.7: Test order history (4 tests)
  ✓ should navigate to order history page
  ✓ should display new order in order list
  ✓ should have working order details link
  ✓ should support order filtering and sorting

✓ 10.8: Test recommended products (4 tests)
  ✓ should display recommended products section
  ✓ should display product images in recommendations
  ✓ should have working product links in recommendations
  ✓ should allow adding recommended products to cart

✓ Integration: Complete order confirmation flow (1 test)
  ✓ should complete full order confirmation experience

Total: 35 tests passed
```

## Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Problem**: Tests timeout waiting for elements

**Solutions**:
```bash
# Increase timeout
npx playwright test tests/audit/order-confirmation-audit.test.ts --timeout=60000

# Run with headed browser to see what's happening
npx playwright test tests/audit/order-confirmation-audit.test.ts --headed

# Check if servers are running
curl http://localhost:3000
curl http://localhost:5000/api/health
```

#### 2. Login Fails

**Problem**: Test user cannot login

**Solutions**:
- Verify test user exists in database
- Check credentials match test data
- Verify auth endpoints are working
- Check for CORS issues

```bash
# Test login manually
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

#### 3. No Products Available

**Problem**: Cannot add products to cart

**Solutions**:
- Verify products exist in database
- Check product inventory > 0
- Verify product endpoints working

```bash
# Check products
curl http://localhost:5000/api/products
```

#### 4. Checkout Fails

**Problem**: Cannot complete checkout

**Solutions**:
- Verify cart functionality working
- Check shipping options available
- Verify payment methods configured
- Check order creation endpoint

#### 5. Order Not Found

**Problem**: Order confirmation page shows "Order Not Found"

**Solutions**:
- Verify order was created in database
- Check order ID in URL is correct
- Verify order belongs to logged-in user
- Check order API endpoint

```bash
# Check order exists
curl http://localhost:5000/api/orders/[ORDER_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

#### 6. Download Doesn't Trigger

**Problem**: Receipt download test fails

**Solutions**:
- This may be expected in test environment
- Test includes try-catch for this scenario
- Verify download button exists and is clickable
- Check browser download settings

#### 7. Recommended Products Missing

**Problem**: No recommended products shown

**Solutions**:
- This is optional functionality
- Tests handle absence gracefully
- Verify recommendation API endpoint
- Check if products exist for recommendations

## Debugging Tests

### Using Playwright Inspector

```bash
# Run with inspector
npx playwright test tests/audit/order-confirmation-audit.test.ts --debug
```

This opens the Playwright Inspector where you can:
- Step through tests
- Inspect elements
- View console logs
- Take screenshots

### Using UI Mode

```bash
# Run with UI mode
npx playwright test tests/audit/order-confirmation-audit.test.ts --ui
```

UI mode provides:
- Visual test execution
- Time travel debugging
- Network inspection
- Console logs

### Viewing Test Reports

```bash
# Generate HTML report
npx playwright test tests/audit/order-confirmation-audit.test.ts --reporter=html

# Open report
npx playwright show-report
```

### Taking Screenshots

Tests automatically take screenshots on failure. To take screenshots on success:

```bash
# Run with screenshot on success
npx playwright test tests/audit/order-confirmation-audit.test.ts --screenshot=on
```

### Recording Videos

```bash
# Record videos of test execution
npx playwright test tests/audit/order-confirmation-audit.test.ts --video=on

# Videos saved to test-results/
```

## Test Data Management

### Creating Test User

```sql
-- Create test user in database
INSERT INTO users (email, password, firstName, lastName)
VALUES ('test@example.com', '[HASHED_PASSWORD]', 'John', 'Doe');
```

Or use the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Cleaning Up Test Data

After tests, you may want to clean up:

```sql
-- Delete test orders
DELETE FROM orders WHERE userId = (SELECT id FROM users WHERE email = 'test@example.com');

-- Delete test cart items
DELETE FROM cart_items WHERE cartId IN (
  SELECT id FROM carts WHERE userId = (SELECT id FROM users WHERE email = 'test@example.com')
);
```

## Performance Benchmarks

Expected test execution times:

- **Individual test**: 5-15 seconds
- **Test suite (10.1-10.8)**: 3-5 minutes
- **Complete integration test**: 30-60 seconds
- **All tests**: 5-10 minutes

## Continuous Integration

### GitHub Actions Example

```yaml
name: Order Confirmation Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          npx playwright install
      
      - name: Start backend
        run: |
          cd backend
          npm ci
          npm run dev &
          sleep 10
      
      - name: Start frontend
        run: |
          cd frontend
          npm run build
          npm start &
          sleep 10
      
      - name: Run order confirmation tests
        run: |
          cd frontend
          npx playwright test tests/audit/order-confirmation-audit.test.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Next Steps

After running tests:

1. **Review Results**: Check test output for passes/failures
2. **Analyze Failures**: Investigate any failing tests
3. **Document Issues**: Create tickets for bugs found
4. **Generate Report**: Create audit report with findings
5. **Fix Issues**: Prioritize and fix identified problems
6. **Rerun Tests**: Verify fixes with test rerun

## Support

For issues or questions:
- Check test output and error messages
- Review browser console logs
- Check network tab for API errors
- Consult Playwright documentation
- Review application logs

---

**Test File**: `frontend/tests/audit/order-confirmation-audit.test.ts`
**Test Count**: 35+ test cases
**Estimated Duration**: 5-10 minutes
**Status**: Ready for execution
