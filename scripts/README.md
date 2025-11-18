# Testing Scripts

This directory contains automated testing scripts for verifying the website audit fixes.

## Available Scripts

### 1. Health Check (`health-check-fixes.js`)
**Purpose:** Verify all required files exist and configuration is correct  
**Requirements:** None (no servers needed)  
**Duration:** < 5 seconds

```bash
node scripts/health-check-fixes.js
```

**What it checks:**
- All page implementations exist
- Removed pages are gone
- API configuration files exist
- Cart, auth, error handling components exist
- Warns about potential hardcoded URLs

**Expected Output:**
```
✅ All checks passed successfully!
Total: 22 passed, 0 failed, 2 warnings
```

---

### 2. Smoke Test (`smoke-test.js`)
**Purpose:** Quick verification that servers are running and responding  
**Requirements:** Both frontend and backend servers must be running  
**Duration:** < 10 seconds

```bash
node scripts/smoke-test.js
```

**What it tests:**
- Backend API endpoints (health, products, search, filters, auth)
- Frontend pages (home, products, collections, login, cart)
- Dynamic routes (category pages, search)
- Error handling (404 pages)

**Expected Output:**
```
✅ All smoke tests passed!
Total: 13 passed, 0 failed
```

---

### 3. Comprehensive Verification (`verify-fixes.js`)
**Purpose:** Detailed verification of all fixes  
**Requirements:** Both servers must be running  
**Duration:** < 30 seconds

```bash
node scripts/verify-fixes.js
```

**What it tests:**
- All API endpoints with detailed checks
- All page implementations
- Removed pages verification
- Error handling scenarios
- Configuration validation

---

## Usage Workflow

### Before Starting Servers
```bash
# 1. Run health check to verify files
node scripts/health-check-fixes.js
```

### After Starting Servers
```bash
# 2. Start backend (Terminal 1)
cd backend
npm run dev

# 3. Start frontend (Terminal 2)
cd frontend
npm run dev

# 4. Run smoke test (Terminal 3)
node scripts/smoke-test.js

# 5. Run comprehensive verification
node scripts/verify-fixes.js
```

---

## Environment Variables

All scripts support custom URLs:

```bash
# Default values
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Custom values
FRONTEND_URL=https://staging.example.com BACKEND_URL=https://api.staging.example.com node scripts/smoke-test.js
```

---

## Troubleshooting

### Health Check Fails
- Verify you're in the project root directory
- Check that all files were committed
- Pull latest changes from repository

### Smoke Test Fails
- Ensure backend server is running on port 5000
- Ensure frontend server is running on port 3000
- Check for port conflicts
- Verify no firewall blocking connections

### Connection Errors
- Check server logs for errors
- Verify database is running
- Check environment variables are set
- Ensure all dependencies are installed

---

## Other Scripts

### Backup Database (`backup-database.js`)
Creates a backup of the database.

```bash
node scripts/backup-database.js
```

### Health Check (`health-check.js`)
General health check for the application.

```bash
node scripts/health-check.js
```

### Deploy Production (`deploy-production.sh`)
Deployment script for production environment.

```bash
bash scripts/deploy-production.sh
```

### Run Checkout Tests (`run-checkout-tests.js`)
Runs checkout-specific tests.

```bash
node scripts/run-checkout-tests.js
```

---

## Documentation

For detailed testing procedures, see:
- `docs/TESTING_GUIDE.md` - Comprehensive testing guide
- `docs/MANUAL_TESTING_CHECKLIST.md` - 134-point manual testing checklist
- `docs/VERIFICATION_TEST_REPORT.md` - Complete test report
- `TESTING_COMPLETE_SUMMARY.md` - Testing summary

---

## Exit Codes

All scripts use standard exit codes:
- `0` - Success (all tests passed)
- `1` - Failure (one or more tests failed)

This allows integration with CI/CD pipelines:

```bash
# Example CI/CD usage
node scripts/health-check-fixes.js && \
node scripts/smoke-test.js && \
node scripts/verify-fixes.js
```

---

**Last Updated:** November 14, 2025
