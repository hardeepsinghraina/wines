# Task 8: Order Review Audit - Quick Start Guide

## 🚀 Quick Start

### Prerequisites Check
```bash
# 1. Check if backend is running
curl http://localhost:3001/health

# 2. Check if frontend is running
curl http://localhost:3000

# 3. If not running, start them:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Run Tests
```bash
cd frontend

# Run all Task 8 tests
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts

# Run with UI (recommended for first time)
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts --ui

# Run with visible browser
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts --headed
```

### View Results
```bash
# Generate and open HTML report
npx playwright show-report
```

## 📊 What Gets Tested

### ✅ Order Review Display (7 tests)
- All order items with details
- Item quantities and prices
- Subtotal, shipping, and total calculations

### ✅ Address Display (3 tests)
- Complete shipping address
- Billing address or "same as shipping"
- Proper address formatting

### ✅ Shipping & Payment Display (4 tests)
- Selected shipping method and cost
- Estimated delivery time
- Selected payment method
- Crypto payment amount

### ✅ Edit Functionality (3 tests)
- Navigate back to edit steps
- Data persistence during edits
- Complete checkout after editing

### ✅ Place Order Button (4 tests)
- Button enabled when ready
- Prominent display
- Double-click prevention
- Loading state during submission

### ✅ Order Submission (4 tests)
- Order submission process
- Crypto payment screen display
- Order number generation
- Error handling

### ✅ Complete Flow (1 test)
- End-to-end review and submission

**Total: 26 tests**

## 🎯 Expected Results

All tests should **PASS** ✅

Typical execution time: **5-7 minutes**

## 🐛 Troubleshooting

### Tests Timeout
```bash
# Check servers are running
curl http://localhost:3001/health
curl http://localhost:3000

# Restart if needed
```

### No Products Found
```bash
# Seed test data
cd backend
node scripts/setup-audit-environment.js
```

### Tests Fail
```bash
# Run in headed mode to see what's happening
npx playwright test tests/audit/order-review-audit.test.ts --config=playwright-audit.config.ts --headed --debug
```

## 📁 Key Files

- **Tests**: `frontend/tests/audit/order-review-audit.test.ts`
- **Execution Guide**: `docs/TASK_8_TEST_EXECUTION_GUIDE.md`
- **Audit Report**: `docs/ORDER_REVIEW_AUDIT_REPORT.md`
- **Summary**: `docs/TASK_8_COMPLETION_SUMMARY.md`

## 🔄 Next Steps

After running tests:
1. Review the HTML report
2. Check `docs/ORDER_REVIEW_AUDIT_REPORT.md` for findings
3. Document any issues discovered
4. Proceed to Task 9: Payment Processing Audit

## 💡 Tips

- Use `--ui` mode for interactive debugging
- Use `--headed` to watch tests execute
- Use `-g "Task 8.1"` to run specific test suites
- Check console logs for detailed test output

## 📞 Need Help?

See detailed documentation:
- `docs/TASK_8_TEST_EXECUTION_GUIDE.md` - Full execution guide
- `docs/ORDER_REVIEW_AUDIT_REPORT.md` - Detailed findings
- `docs/TASK_8_COMPLETION_SUMMARY.md` - Implementation summary
