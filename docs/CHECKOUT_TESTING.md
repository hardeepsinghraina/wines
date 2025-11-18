# Checkout End-to-End Testing Documentation

## Overview

This document describes the comprehensive testing suite for the checkout flow, covering all aspects from cart management to order confirmation, including cryptocurrency payments and age verification.

## Test Structure

### Backend Tests (`backend/tests/integration/checkout-e2e.test.ts`)

#### Complete Checkout Flow Tests
- **Full User Journey**: Tests the complete flow from user registration to order confirmation
- **Guest Checkout**: Validates guest checkout functionality without user registration
- **Multiple Payment Methods**: Tests different cryptocurrency payment options (BTC, ETH, USDT TRC20)
- **Age Verification**: Ensures age verification requirements are properly handled

#### Error Handling Tests
- **Invalid Product IDs**: Tests handling of non-existent products
- **Insufficient Inventory**: Validates stock checking and error responses
- **Invalid Addresses**: Tests address validation and error handling
- **Invalid Payment Methods**: Ensures proper validation of payment data

#### Performance Tests
- **Concurrent Requests**: Tests system behavior under concurrent checkout requests
- **Response Time**: Validates checkout completion within acceptable time limits

### Frontend Tests

#### Unit Tests (`frontend/tests/unit/checkout.test.tsx`)
- **CheckoutProgressIndicator**: Tests step navigation and progress display
- **CheckoutSummary**: Validates order summary calculations and display
- **EnhancedPaymentForm**: Tests payment method selection and crypto integration
- **GuestCheckoutOption**: Validates guest checkout form and validation

#### End-to-End Tests (`frontend/tests/e2e/checkout.spec.ts`)
- **Complete Checkout Flow**: Full browser automation testing
- **Guest Checkout Flow**: Tests guest user experience
- **Multiple Crypto Currencies**: Validates different payment options
- **Form Validation**: Tests client-side validation and error handling
- **Network Error Handling**: Tests graceful degradation on network failures
- **Accessibility**: Validates keyboard navigation and screen reader compatibility
- **Mobile Responsiveness**: Tests checkout flow on mobile devices
- **Performance**: Validates page load times and interaction responsiveness

## Test Scenarios Covered

### 1. User Authentication Scenarios
- ✅ Registered user checkout
- ✅ Guest checkout with email validation
- ✅ Login/register redirects during checkout
- ✅ Session persistence across checkout steps

### 2. Product and Cart Scenarios
- ✅ Adding products to cart
- ✅ Cart quantity updates
- ✅ Cart persistence across sessions
- ✅ Out of stock handling
- ✅ Cart clearing after successful order

### 3. Address and Shipping Scenarios
- ✅ Shipping address validation
- ✅ Billing address (same as shipping)
- ✅ Separate billing address
- ✅ Saved address selection
- ✅ Shipping method selection
- ✅ Shipping cost calculation

### 4. Payment Scenarios
- ✅ Bitcoin (BTC) payments
- ✅ Ethereum (ETH) payments
- ✅ USDT TRC20 payments
- ✅ QR code generation for mobile payments
- ✅ Wallet address display and validation
- ✅ Payment amount calculation
- ✅ Payment confirmation flow

### 5. Age Verification Scenarios
- ✅ Age verification overlay display
- ✅ Age verification requirement enforcement
- ✅ Session storage of verification status
- ✅ Integration with checkout flow

### 6. Order Management Scenarios
- ✅ Order creation and confirmation
- ✅ Order ID generation
- ✅ Order details display
- ✅ Order history integration
- ✅ Email confirmation (mocked)

### 7. Error Handling Scenarios
- ✅ Form validation errors
- ✅ Network connectivity issues
- ✅ Server errors
- ✅ Payment failures
- ✅ Inventory issues
- ✅ Invalid data handling

### 8. Performance Scenarios
- ✅ Page load performance
- ✅ Form interaction responsiveness
- ✅ Step transition smoothness
- ✅ Concurrent user handling
- ✅ Large cart handling

### 9. Accessibility Scenarios
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Color contrast compliance

### 10. Mobile Scenarios
- ✅ Mobile-responsive design
- ✅ Touch interactions
- ✅ Mobile payment flow
- ✅ Mobile QR code scanning
- ✅ Mobile form usability

## Running Tests

### Prerequisites
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up test database
cd backend && npm run db:migrate
```

### Individual Test Suites

#### Backend Integration Tests
```bash
cd backend
npm run test:integration
npm run test:e2e
```

#### Frontend Unit Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

#### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e
npm run test:e2e:headed  # Run with browser UI
npm run test:e2e:ui      # Run with Playwright UI
```

### Complete Test Suite
```bash
# Run all checkout tests
node scripts/run-checkout-tests.js

# Or run individually
cd frontend && npm run test:all
cd ../backend && npm run test:all
```

## Test Data and Fixtures

### Test User Data
```javascript
const testUser = {
  email: 'e2e-checkout@example.com',
  password: 'E2ECheckout123!',
  firstName: 'E2E',
  lastName: 'Checkout',
  dateOfBirth: '1990-01-01'
};
```

### Test Address Data
```javascript
const testAddress = {
  firstName: 'E2E',
  lastName: 'Checkout',
  street: '123 E2E Test Street',
  city: 'Test City',
  state: 'CA',
  postalCode: '90210',
  country: 'US',
  phone: '+1-555-0123'
};
```

### Crypto Wallet Addresses (Test)
- **BTC**: `bc1qkgve6jynj7hnhyy3n6hz68zz66yuglzqzr83r5`
- **ETH**: `0xc71b5d01e24F8D0d31e464D15B2b04032f58F4b3`
- **USDT TRC20**: `TXeXRbMZuunsMS558WV6xWBFiXTmgbQQnp`

## Test Environment Setup

### Environment Variables
```bash
# Frontend (.env.test)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENVIRONMENT=test

# Backend (.env.test)
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/wine_test
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=test-secret-key
```

### Database Setup
```bash
# Create test database
createdb wine_test

# Run migrations
cd backend && npm run db:migrate

# Seed test data
npm run db:seed
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Checkout E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      - name: Run tests
        run: node scripts/run-checkout-tests.js
```

## Test Coverage Requirements

### Minimum Coverage Thresholds
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Critical Path Coverage
- ✅ Complete checkout flow: 100%
- ✅ Payment processing: 100%
- ✅ Age verification: 100%
- ✅ Error handling: 90%
- ✅ Form validation: 90%

## Performance Benchmarks

### Response Time Requirements
- **Page Load**: < 3 seconds
- **Form Interactions**: < 500ms
- **Step Transitions**: < 500ms
- **Payment Processing**: < 5 seconds
- **Order Confirmation**: < 2 seconds

### Load Testing Targets
- **Concurrent Users**: 50+
- **Requests per Second**: 100+
- **Error Rate**: < 1%
- **95th Percentile Response Time**: < 2 seconds

## Accessibility Standards

### WCAG 2.1 AA Compliance
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast ratios
- ✅ Focus indicators
- ✅ Alternative text for images
- ✅ Form labels and descriptions

## Browser Compatibility

### Supported Browsers
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

### Mobile Browsers
- ✅ Mobile Chrome
- ✅ Mobile Safari
- ✅ Mobile Firefox

## Troubleshooting

### Common Issues

#### Test Database Connection
```bash
# Check database connection
psql -h localhost -U test -d wine_test

# Reset test database
cd backend && npm run db:reset
```

#### Redis Connection
```bash
# Check Redis connection
redis-cli ping

# Clear Redis cache
redis-cli flushall
```

#### Port Conflicts
```bash
# Check for port usage
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :6379  # Redis
```

### Debug Mode
```bash
# Run tests with verbose output
VERBOSE_TESTS=true npm run test

# Run E2E tests with browser UI
npm run test:e2e:headed

# Run with Playwright debug mode
DEBUG=pw:api npm run test:e2e
```

## Maintenance

### Regular Test Updates
- Update test data monthly
- Review and update test scenarios quarterly
- Performance benchmark reviews quarterly
- Browser compatibility testing monthly

### Test Data Cleanup
```bash
# Clean up test data
cd backend && npm run db:reset

# Remove test artifacts
rm -rf frontend/test-results
rm -rf backend/coverage
```

## Contributing

### Adding New Tests
1. Follow existing test patterns
2. Include both positive and negative test cases
3. Add appropriate test data and fixtures
4. Update documentation
5. Ensure tests pass in CI/CD pipeline

### Test Naming Conventions
- Use descriptive test names
- Group related tests in describe blocks
- Use consistent naming patterns
- Include test IDs for E2E tests

### Code Review Checklist
- [ ] Tests cover new functionality
- [ ] Tests include error scenarios
- [ ] Performance impact considered
- [ ] Accessibility requirements met
- [ ] Mobile compatibility verified
- [ ] Documentation updated