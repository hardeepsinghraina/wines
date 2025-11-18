# Testing Guide - Website Audit Fixes

This guide provides instructions for testing all fixes implemented during the website audit.

---

## Quick Start

### 1. Run Health Check (No servers needed)
```bash
node scripts/health-check-fixes.js
```
This verifies all files are in place and configuration is correct.

### 2. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Run Smoke Tests
```bash
node scripts/smoke-test.js
```
This performs quick checks on critical endpoints and pages.

### 4. Manual Testing
Follow the detailed checklist in `docs/MANUAL_TESTING_CHECKLIST.md`

---

## Testing Scripts

### Health Check (`scripts/health-check-fixes.js`)
**Purpose:** Verify all required files exist and configuration is correct  
**When to use:** Before starting servers, after pulling code changes  
**Requirements:** None (no servers needed)  
**Duration:** < 5 seconds

**What it checks:**
- ✅ All page implementations exist
- ✅ Removed pages are gone
- ✅ API configuration files exist
- ✅ Cart components exist
- ✅ Auth components exist
- ✅ Error handling components exist
- ✅ Offline support components exist
- ⚠️ Warns about hardcoded URLs (checks for issues)

**Usage:**
```bash
node scripts/health-check-fixes.js
```

**Expected output:**
```
✅ All checks passed successfully!
Total: 22 passed, 0 failed, 2 warnings
```

---

### Smoke Test (`scripts/smoke-test.js`)
**Purpose:** Quick verification that servers are running and responding  
**When to use:** After starting servers, before detailed testing  
**Requirements:** Both frontend and backend servers running  
**Duration:** < 10 seconds

**What it tests:**
- Backend API endpoints (health, products, search, filters, auth)
- Frontend pages (home, products, collections, login, cart)
- Dynamic routes (category pages, search)
- Error handling (404 pages)

**Usage:**
```bash
# Default (localhost)
node scripts/smoke-test.js

# Custom URLs
FRONTEND_URL=http://localhost:3000 BACKEND_URL=http://localhost:5000 node scripts/smoke-test.js
```

**Expected output:**
```
✅ All smoke tests passed!
Total: 13 passed, 0 failed
```

---

### Comprehensive Verification (`scripts/verify-fixes.js`)
**Purpose:** Detailed verification of all fixes  
**When to use:** For thorough testing before deployment  
**Requirements:** Both servers running  
**Duration:** < 30 seconds

**What it tests:**
- All API endpoints with detailed checks
- All page implementations
- Removed pages verification
- Error handling scenarios
- Configuration validation

**Usage:**
```bash
node scripts/verify-fixes.js
```

---

## Manual Testing Checklist

See `docs/MANUAL_TESTING_CHECKLIST.md` for a comprehensive step-by-step testing guide covering:

1. **Page Implementations & Navigation** (11 checks)
2. **API Integration** (12 checks)
3. **Cart Functionality** (12 checks)
4. **Authentication Flow** (15 checks)
5. **Order Detail Page** (9 checks)
6. **Search Functionality** (12 checks)
7. **Category & Filter Navigation** (15 checks)
8. **Error Handling** (15 checks)
9. **Placeholder Content** (7 checks)
10. **Cross-Browser Testing** (12 checks)
11. **Mobile Responsiveness** (8 checks)
12. **Performance** (6 checks)

**Total:** 134 manual test cases

---

## Testing Workflow

### For Developers

#### Before Committing Code
1. Run health check: `node scripts/health-check-fixes.js`
2. Fix any failed checks
3. Commit changes

#### After Starting Servers
1. Run smoke test: `node scripts/smoke-test.js`
2. If failures, check server logs
3. Fix issues and retest

#### Before Pull Request
1. Run all automated tests
2. Complete relevant sections of manual checklist
3. Document any issues found
4. Ensure all tests pass

### For QA Team

#### Initial Setup
1. Pull latest code
2. Run health check
3. Start both servers
4. Run smoke test
5. Verify environment setup

#### Testing Phase
1. Run comprehensive verification script
2. Work through manual testing checklist systematically
3. Document all findings
4. Create bug reports for failures
5. Retest after fixes

#### Sign-off
1. All automated tests passing
2. All manual tests passing
3. No critical issues
4. Performance acceptable
5. Cross-browser verified

### For Product Owner

#### Review Phase
1. Review test report (`docs/VERIFICATION_TEST_REPORT.md`)
2. Review automated test results
3. Approve manual testing phase

#### Acceptance Phase
1. Review manual test results
2. Review any issues found
3. Verify critical paths work
4. Sign off on fixes

---

## Test Data Setup

### Database Seeding
```bash
cd backend
npx prisma db seed
```

### Test User Accounts
Create test accounts for different scenarios:
- Regular user: `test@example.com` / `password123`
- Admin user: `admin@example.com` / `admin123`
- User with orders: `customer@example.com` / `password123`

### Test Products
Ensure database has:
- Products in multiple categories (Red Wine, White Wine, Champagne)
- Products from multiple regions (Bordeaux, Burgundy, Champagne)
- Products with various price ranges
- Products with images
- Featured products

---

## Common Issues & Solutions

### Issue: Health check fails
**Solution:** 
- Check if files exist in correct locations
- Verify file names match exactly
- Pull latest code changes

### Issue: Smoke test fails with "Connection refused"
**Solution:**
- Verify backend server is running on port 5000
- Verify frontend server is running on port 3000
- Check for port conflicts
- Check firewall settings

### Issue: API calls return 404
**Solution:**
- Verify backend routes are registered
- Check API endpoint paths include `/api` prefix
- Verify backend server started without errors

### Issue: Pages return 500 errors
**Solution:**
- Check server logs for errors
- Verify database connection
- Check environment variables are set
- Verify all dependencies installed

### Issue: Cart doesn't load
**Solution:**
- Check browser console for errors
- Verify cart API endpoint is accessible
- Check authentication token is valid
- Clear browser cache and localStorage

### Issue: Authentication fails
**Solution:**
- Verify JWT_SECRET is set in backend .env
- Check user exists in database
- Verify password is correct
- Check token expiration settings

---

## Performance Benchmarks

### Expected Performance
- **Page Load Time:** < 3 seconds
- **API Response Time:** < 1 second
- **Search Response:** < 500ms
- **Cart Operations:** < 300ms
- **Authentication:** < 500ms

### How to Measure
1. Open Chrome DevTools
2. Go to Network tab
3. Disable cache
4. Reload page
5. Check "Load" time at bottom
6. Check individual request times

### Performance Testing
```bash
# Using Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance"
4. Click "Generate report"
5. Review scores and recommendations
```

---

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Testing Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Navigation | ✅ | ✅ | ✅ | ✅ |
| Cart | ✅ | ✅ | ✅ | ✅ |
| Auth | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |
| Filters | ✅ | ✅ | ✅ | ✅ |

---

## Mobile Testing

### Test Devices
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- Android Phone (360x640)
- Android Tablet (800x1280)

### Using Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device from dropdown
4. Test all functionality
5. Check touch interactions
6. Verify responsive layout

---

## Reporting Issues

### Bug Report Template
```markdown
**Title:** Brief description of issue

**Severity:** Critical / High / Medium / Low

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen: 1920x1080

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Observe...

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Paste any console errors]

**Additional Notes:**
Any other relevant information
```

---

## Test Coverage Summary

### Automated Tests
- ✅ File existence checks (22 checks)
- ✅ Configuration validation (4 checks)
- ✅ API endpoint accessibility (13 checks)
- ✅ Page accessibility (13 checks)

### Manual Tests Required
- 🔄 End-to-end user flows (134 checks)
- 🔄 Cross-browser compatibility (48 checks)
- 🔄 Mobile responsiveness (40 checks)
- 🔄 Performance testing (6 checks)

### Total Test Coverage
- **Automated:** 52 checks ✅
- **Manual:** 228 checks 🔄
- **Total:** 280 test cases

---

## Next Steps

1. ✅ **Automated verification complete** - All checks passed
2. 🔄 **Manual testing** - Use checklist to verify functionality
3. ⏳ **Browser testing** - Test on all supported browsers
4. ⏳ **Mobile testing** - Test on various devices
5. ⏳ **Performance testing** - Verify load times and responsiveness
6. ⏳ **User acceptance** - Get stakeholder approval

---

## Resources

- **Manual Testing Checklist:** `docs/MANUAL_TESTING_CHECKLIST.md`
- **Verification Report:** `docs/VERIFICATION_TEST_REPORT.md`
- **Health Check Script:** `scripts/health-check-fixes.js`
- **Smoke Test Script:** `scripts/smoke-test.js`
- **Comprehensive Verification:** `scripts/verify-fixes.js`

---

**Last Updated:** November 14, 2025  
**Status:** Ready for Manual Testing  
**Contact:** Development Team
