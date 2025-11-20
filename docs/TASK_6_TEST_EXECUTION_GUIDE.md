# Task 6: Shipping Method Selection - Test Execution Guide

## Quick Start

### Prerequisites
1. **Backend Server Running**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Server Running**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Database Populated**
   ```bash
   cd backend
   npm run seed
   ```

## Running the Tests

### Run All Shipping Method Tests
```bash
cd frontend
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts
```

### Run Specific Subtasks

#### 6.1: Shipping Options Loading
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts -g "6.1 Test shipping options loading" --config=playwright-audit.config.ts
```

#### 6.2: Shipping Method Display
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts -g "6.2 Test shipping method display" --config=playwright-audit.config.ts
```

#### 6.3: Shipping Method Selection
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts -g "6.3 Test shipping method selection" --config=playwright-audit.config.ts
```

#### 6.4: Shipping Method Navigation
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts -g "6.4 Test shipping method navigation" --config=playwright-audit.config.ts
```

### Run Individual Tests
```bash
# Example: Run specific test
npx playwright test tests/audit/shipping-method-audit.test.ts -g "should verify shipping options fetch after address entry" --config=playwright-audit.config.ts
```

## Debugging Tests

### Run with UI Mode
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --ui
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --headed
```

### Run with Debug Mode
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --debug
```

### Run Single Test in Debug
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts -g "should verify shipping options fetch" --config=playwright-audit.config.ts --debug
```

## Viewing Test Reports

### Generate HTML Report
```bash
npx playwright show-report playwright-report-audit
```

### View Traces (After Test Run)
```bash
npx playwright show-trace playwright-report-audit/trace.zip
```

## Test Configuration

### Browser Selection
```bash
# Run on specific browser
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --project=chromium
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --project=firefox
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --project=webkit
```

### Parallel Execution
```bash
# Run with multiple workers
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --workers=4
```

### Retry Failed Tests
```bash
# Retry failed tests
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --retries=2
```

## Environment Setup

### Check Playwright Installation
```bash
npx playwright --version
```

### Install Playwright Browsers
```bash
npx playwright install
```

### Install Specific Browser
```bash
npx playwright install chromium
```

## Troubleshooting

### Issue: Tests Timeout
**Solution**: Ensure backend and frontend are running
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd frontend && npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts
```

### Issue: Products Not Found
**Solution**: Seed the database
```bash
cd backend
npm run seed
```

### Issue: Port Already in Use
**Solution**: Check and kill processes on ports 3000 and 5000
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### Issue: Playwright Not Found
**Solution**: Install dependencies
```bash
cd frontend
npm install
npx playwright install
```

### Issue: Test Fails on Specific Step
**Solution**: Run with headed mode to see what's happening
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts -g "failing test name" --config=playwright-audit.config.ts --headed --debug
```

## Test Data Requirements

### Required Products
- At least 1 product in the database
- Product must have valid pricing
- Product must be in stock

### Required Shipping Configuration
- Shipping methods configured for US
- Standard shipping available
- Express shipping available (optional)
- VIP shipping available for orders > $500 (optional)

### Required Backend Endpoints
- `GET /api/products` - Working
- `POST /api/cart/add` - Working
- `GET /api/shipping/methods` - Working
- `GET /api/shipping/vip-options` - Working (for VIP tests)

## Expected Test Results

### All Tests Passing
```
Running 18 tests using 1 worker

✓ 6.1 Test shipping options loading (5 tests)
✓ 6.2 Test shipping method display (5 tests)
✓ 6.3 Test shipping method selection (4 tests)
✓ 6.4 Test shipping method navigation (4 tests)

18 passed (60s)
```

### Test Duration
- **Expected**: 60-90 seconds
- **Per Test**: 3-5 seconds average
- **Timeout**: 30 seconds per test

## Continuous Integration

### GitHub Actions Example
```yaml
name: Shipping Method Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          npx playwright install --with-deps
      
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
      
      - name: Run tests
        run: |
          cd frontend
          npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: frontend/playwright-report-audit/
```

## Test Maintenance

### Updating Tests
When shipping method functionality changes:
1. Update test expectations
2. Add new tests for new features
3. Remove obsolete tests
4. Update documentation

### Adding New Tests
```typescript
test('should test new feature', async ({ page }) => {
  await navigateToShippingMethodStep(page);
  
  // Your test logic here
  
  await expect(page.locator('selector')).toBeVisible();
});
```

### Best Practices
1. Keep tests independent
2. Use descriptive test names
3. Add comments for complex logic
4. Clean up test data after tests
5. Use page object pattern for reusable code

## Performance Monitoring

### Track Test Duration
```bash
npx playwright test tests/audit/shipping-method-audit.test.ts --config=playwright-audit.config.ts --reporter=html
```

### Analyze Slow Tests
Look for tests taking > 10 seconds and optimize:
- Reduce wait times
- Optimize selectors
- Remove unnecessary steps

## Support

### Documentation
- Main Audit Docs: `docs/TASK_6_COMPLETION_SUMMARY.md`
- Audit Report: `docs/SHIPPING_METHOD_AUDIT_REPORT.md`
- Test File: `frontend/tests/audit/shipping-method-audit.test.ts`

### Getting Help
1. Check test output for error messages
2. Run with `--debug` flag
3. Review Playwright documentation
4. Check backend logs for API errors

---

**Last Updated**: 2024
**Test Suite Version**: 1.0
**Playwright Version**: Latest
