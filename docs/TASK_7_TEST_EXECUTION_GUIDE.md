# Task 7: Payment Method Audit - Test Execution Guide

## Quick Start

### 1. Prerequisites Check
```bash
# Verify backend is running
curl http://localhost:3001/api/health

# Verify frontend is running
curl http://localhost:3000

# Verify Playwright is installed
cd frontend
npx playwright --version
```

### 2. Run All Payment Method Tests
```bash
cd frontend
npx playwright test tests/audit/payment-method-audit.test.ts
```

### 3. View Results
```bash
# Generate and open HTML report
npx playwright show-report
```

## Detailed Test Execution

### Run Individual Test Suites

#### Task 7.1: Payment Options Display
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.1"
```
**Expected Duration**: ~2 minutes  
**Tests**: 4 tests  
**Validates**: All payment options display correctly

#### Task 7.2: Cryptocurrency Selection
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.2"
```
**Expected Duration**: ~3 minutes  
**Tests**: 6 tests  
**Validates**: Crypto selection, exchange rates, amount calculation

#### Task 7.3: Real-time Exchange Rate Updates
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.3"
```
**Expected Duration**: ~2 minutes (includes 30-second wait test)  
**Tests**: 3 tests  
**Validates**: Rate updates, loading states, selection persistence

#### Task 7.4: Saved Payment Methods
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.4"
```
**Expected Duration**: ~1 minute  
**Tests**: 2 tests  
**Validates**: Saved methods display, new method addition

#### Task 7.5: Payment Method Validation
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.5"
```
**Expected Duration**: ~2 minutes  
**Tests**: 3 tests  
**Validates**: Button states, validation messages, form validation

#### Task 7.6: Payment Method Navigation
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.6"
```
**Expected Duration**: ~3 minutes  
**Tests**: 5 tests  
**Validates**: Back/forward navigation, state persistence

#### Complete Flow Test
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "Complete Payment Method Flow"
```
**Expected Duration**: ~1 minute  
**Tests**: 1 comprehensive test  
**Validates**: End-to-end payment selection flow

## Debugging Options

### Run with UI Mode (Recommended)
```bash
npx playwright test tests/audit/payment-method-audit.test.ts --ui
```
**Benefits**:
- Visual test execution
- Step-by-step debugging
- Time travel through test steps
- Easy test re-running

### Run in Headed Mode
```bash
npx playwright test tests/audit/payment-method-audit.test.ts --headed
```
**Benefits**:
- See browser actions in real-time
- Useful for understanding test flow
- Good for demonstrations

### Run with Debug Mode
```bash
npx playwright test tests/audit/payment-method-audit.test.ts --debug
```
**Benefits**:
- Pause before each action
- Inspect page state
- Step through test code

### Run Specific Test
```bash
npx playwright test tests/audit/payment-method-audit.test.ts -g "should display all cryptocurrency payment options"
```

## Test Environment Setup

### Option 1: Using Existing Environment
If you already have the backend and frontend running:
```bash
# Just run the tests
cd frontend
npx playwright test tests/audit/payment-method-audit.test.ts
```

### Option 2: Fresh Environment Setup
```bash
# Terminal 1: Start backend
cd backend
npm install
npm run dev

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev

# Terminal 3: Run tests
cd frontend
npx playwright test tests/audit/payment-method-audit.test.ts
```

### Option 3: Using Docker (if configured)
```bash
# Start services
docker-compose up -d

# Wait for services to be ready
sleep 10

# Run tests
cd frontend
npx playwright test tests/audit/payment-method-audit.test.ts
```

## Troubleshooting

### Issue: Tests Timeout
**Symptoms**: Tests fail with timeout errors  
**Solutions**:
1. Increase timeout in test file
2. Check if backend/frontend are running
3. Verify network connectivity
4. Check browser console for errors

```bash
# Run with increased timeout
npx playwright test tests/audit/payment-method-audit.test.ts --timeout=120000
```

### Issue: Cannot Find Elements
**Symptoms**: Tests fail with "element not found" errors  
**Solutions**:
1. Run in headed mode to see what's happening
2. Check if page is loading correctly
3. Verify selectors match current UI
4. Check for JavaScript errors in console

```bash
# Run in headed mode to debug
npx playwright test tests/audit/payment-method-audit.test.ts --headed
```

### Issue: Navigation Fails
**Symptoms**: Tests fail during checkout navigation  
**Solutions**:
1. Verify cart has products
2. Check if checkout flow is working manually
3. Verify all previous steps complete successfully
4. Check for validation errors

```bash
# Run with debug to step through
npx playwright test tests/audit/payment-method-audit.test.ts --debug
```

### Issue: Exchange Rate Tests Fail
**Symptoms**: Rate-related tests fail  
**Solutions**:
1. Check if mock rates are loading
2. Verify rate update interval (30 seconds)
3. Check network requests in browser dev tools
4. Verify rate calculation logic

### Issue: Saved Payment Methods Not Showing
**Symptoms**: Saved methods tests fail  
**Solutions**:
1. This is expected for guest users
2. Tests are designed to handle both cases
3. Verify authentication state if testing with logged-in user

## Test Reports

### Generate HTML Report
```bash
npx playwright test tests/audit/payment-method-audit.test.ts
npx playwright show-report
```

### Generate JSON Report
```bash
npx playwright test tests/audit/payment-method-audit.test.ts --reporter=json
```

### Generate JUnit Report (for CI/CD)
```bash
npx playwright test tests/audit/payment-method-audit.test.ts --reporter=junit
```

### Generate Multiple Reports
```bash
npx playwright test tests/audit/payment-method-audit.test.ts --reporter=html,json,junit
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Payment Method Audit Tests

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
          cd frontend
          npm ci
          npx playwright install --with-deps
      
      - name: Start services
        run: |
          docker-compose up -d
          sleep 10
      
      - name: Run payment method tests
        run: |
          cd frontend
          npx playwright test tests/audit/payment-method-audit.test.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Performance Considerations

### Test Execution Time
- **Full suite**: ~10-15 minutes
- **Individual task**: 1-3 minutes
- **Single test**: 30-60 seconds

### Optimization Tips
1. Run tests in parallel (Playwright default)
2. Use `--workers` flag to control parallelization
3. Skip slow tests during development
4. Use `test.only()` for focused testing

```bash
# Run with specific number of workers
npx playwright test tests/audit/payment-method-audit.test.ts --workers=4

# Run only fast tests (skip rate update test)
npx playwright test tests/audit/payment-method-audit.test.ts -g "Task 7.1|Task 7.2|Task 7.5"
```

## Test Data Requirements

### Required Test Data
1. **Products**: At least one product in database
2. **Shipping Options**: Standard shipping methods configured
3. **Exchange Rates**: Mock rates or API connection
4. **Wallet Addresses**: Configured in crypto-wallets.ts

### Optional Test Data
1. **User Account**: For saved payment methods tests
2. **Saved Addresses**: For authenticated user flow
3. **Order History**: For complete user experience

## Validation Checklist

After running tests, verify:
- [ ] All 24 tests pass
- [ ] No console errors in browser
- [ ] Payment options display correctly
- [ ] Exchange rates load and update
- [ ] Navigation works smoothly
- [ ] State persists across steps
- [ ] Validation prevents invalid submissions
- [ ] UI is responsive and accessible

## Next Steps

After successful test execution:
1. Review test report for any failures
2. Document any issues found
3. Create tickets for bugs or enhancements
4. Proceed to Task 8: Order review and submission
5. Update audit checklist with findings

## Support

### Getting Help
- Check test output for specific error messages
- Review browser console for JavaScript errors
- Use Playwright trace viewer for detailed debugging
- Consult Playwright documentation: https://playwright.dev

### Common Commands Reference
```bash
# Install Playwright browsers
npx playwright install

# Update Playwright
npm install -D @playwright/test@latest

# Clear test cache
npx playwright test --clear-cache

# List all tests
npx playwright test --list

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Related Documents**:
- `docs/TASK_7_COMPLETION_SUMMARY.md`
- `frontend/tests/audit/payment-method-audit.test.ts`
