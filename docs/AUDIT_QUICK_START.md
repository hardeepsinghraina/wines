# Checkout Payment Flow Audit - Quick Start Guide

**Purpose**: Get the audit environment up and running quickly  
**Estimated Time**: 15-20 minutes

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Redis server running (optional but recommended)
- Backend and frontend repositories cloned

## Step 1: Set Up Test Environment (5 minutes)

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Install Dependencies (if not already done)
```bash
npm install
```

### 1.3 Run Database Migrations
```bash
npx prisma migrate dev
```

### 1.4 Create Test Data
```bash
node scripts/setup-audit-environment.js
```

**Expected Output**:
```
🚀 Starting audit environment setup...

👥 Creating test users...
   ✓ Created user: audit.guest@test.com
   ✓ Created user: audit.authenticated@test.com
   ✓ Created user: audit.vip@test.com

📍 Creating test addresses...
   ✓ Created address for audit.guest@test.com
   ✓ Created address for audit.authenticated@test.com
   ✓ Created address for audit.vip@test.com

🍷 Creating test wines...
   ✓ Created wine: Audit Test Bordeaux 2015 (Stock: 50)
   ✓ Created wine: Audit Test Champagne NV (Stock: 30)
   ✓ Created wine: Audit Test Barolo 2016 (Stock: 25)
   ✓ Created wine: Audit Test Napa Cabernet 2018 (Stock: 5)
   ✓ Created wine: Audit Test Rioja Reserva 2014 (Stock: 100)
   ✓ Created wine: Audit Test Unavailable Wine (Stock: 0)

🛒 Creating test cart...
   ✓ Created cart with 2 items for authenticated user

📦 Creating test order...
   ✓ Created test order: AUDIT-1732147200000

✅ Audit environment setup complete!

📋 Test Credentials:
   Guest User: audit.guest@test.com / AuditTest123!
   Authenticated User: audit.authenticated@test.com / AuditTest123!
   VIP User: audit.vip@test.com / AuditTest123!
```

## Step 2: Set Up Monitoring (5 minutes)

### 2.1 Run Monitoring Setup Script
```bash
node scripts/setup-audit-monitoring.js
```

**Expected Output**:
```
🚀 Setting up audit monitoring and logging...

📁 Creating audit log directory...
   ✓ Created directory: backend/logs/audit

📝 Generating monitoring files...
   ✓ Created audit logger middleware: backend/src/middleware/audit-logger.ts
   ✓ Created metrics collector: backend/src/utils/audit-metrics.ts
   ✓ Created audit configuration: backend/audit-config.json
   ✓ Created audit monitoring README: backend/AUDIT_MONITORING_README.md

✅ Audit monitoring setup complete!
```

### 2.2 Enable Audit Mode

Add to `backend/.env`:
```bash
AUDIT_MODE=true
```

### 2.3 Add Middleware (Optional - for enhanced logging)

In `backend/src/index.ts`, add:
```typescript
// Import audit middleware
import { auditLoggerMiddleware } from './middleware/audit-logger';

// Add after other middleware
if (process.env.AUDIT_MODE === 'true') {
  app.use(auditLoggerMiddleware);
}
```

## Step 3: Start Services (2 minutes)

### 3.1 Start Backend Server

In the `backend` directory:
```bash
npm run dev
```

**Expected Output**:
```
Server running on port 5000
Database connected
Redis connected (if configured)
```

### 3.2 Start Frontend Server

In a new terminal, navigate to `frontend` directory:
```bash
cd frontend
npm run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 4: Verify Setup (3 minutes)

### 4.1 Check Backend Health
```bash
curl http://localhost:5000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T..."
}
```

### 4.2 Check Test Products
```bash
curl http://localhost:5000/api/products | jq
```

You should see the 6 test wines created.

### 4.3 Check Frontend

Open browser to: `http://localhost:3000`

You should see the homepage with featured wines.

### 4.4 Test Login

1. Navigate to login page
2. Use credentials: `audit.authenticated@test.com` / `AuditTest123!`
3. Verify successful login

## Step 5: Collect Baseline Metrics (5 minutes)

### 5.1 Install Puppeteer (if not already installed)

In the root directory:
```bash
npm install puppeteer
```

### 5.2 Run Metrics Collection Script
```bash
node scripts/collect-baseline-metrics.js
```

**Expected Output**:
```
🚀 Starting baseline metrics collection...

📄 Measuring page load times...

📊 Measuring Homepage load time...
   ✓ Homepage: 1234ms ✅ Pass

📊 Measuring Product Listing load time...
   ✓ Product Listing: 1567ms ✅ Pass

📊 Measuring Cart Page load time...
   ✓ Cart Page: 890ms ✅ Pass

📊 Measuring Checkout Page load time...
   ✓ Checkout Page: 1890ms ✅ Pass

🛒 Measuring cart operations...

📊 Measuring cart operations...
   ✓ Add to Cart: 345ms ✅ Pass
   ✓ Update Quantity: 289ms ✅ Pass

🔌 Measuring API response times...

📊 Measuring API GET /api/products...
   ✓ GET /api/products: 234ms (200)

📊 Measuring API GET /api/cart...
   ✓ GET /api/cart: 156ms (200)

📊 Measuring API GET /health...
   ✓ GET /health: 45ms (200)

💾 Saving results...

   ✓ Saved JSON results to docs/audit-results/baseline-metrics.json
   ✓ Saved markdown report to docs/audit-results/baseline-metrics-report.md

✅ Metrics collection complete!
```

## Step 6: Review Documentation (2 minutes)

### 6.1 Review Audit Checklist
```bash
cat docs/AUDIT_CHECKLIST.md
```

### 6.2 Review Baseline Metrics
```bash
cat docs/AUDIT_BASELINE_METRICS.md
```

### 6.3 Review Current System State
```bash
cat docs/CURRENT_SYSTEM_STATE.md
```

## Step 7: Begin Audit

You're now ready to begin the audit! Follow the checklist in `docs/AUDIT_CHECKLIST.md`.

### Recommended Audit Order

1. **Phase 1**: Product Discovery and Browsing
   - Test homepage
   - Test category pages
   - Test product detail pages
   - Test search functionality

2. **Phase 2**: Cart Management
   - Test cart initialization
   - Test add to cart
   - Test cart updates
   - Test cart persistence

3. **Phase 3**: Checkout Flow
   - Test guest checkout
   - Test authenticated checkout
   - Test form validation
   - Test navigation

4. **Phase 4**: Payment Processing
   - Test crypto payment flow
   - Test payment confirmation
   - Test error handling

5. **Phase 5**: Order Confirmation
   - Test confirmation page
   - Test order history
   - Test email notifications

## Troubleshooting

### Backend Won't Start

**Issue**: Port 5000 already in use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Issue**: Database connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL
```

### Frontend Won't Start

**Issue**: Port 3000 already in use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Issue**: API connection failed
```bash
# Check NEXT_PUBLIC_API_URL in .env.local
cat frontend/.env.local | grep NEXT_PUBLIC_API_URL
```

### Test Data Not Created

**Issue**: Prisma schema out of sync
```bash
# Regenerate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

**Issue**: Unique constraint violation
```bash
# Clear existing test data
npx prisma studio
# Manually delete test users/products with "Audit Test" in name
```

### Metrics Collection Fails

**Issue**: Puppeteer not installed
```bash
npm install puppeteer
```

**Issue**: Frontend not running
```bash
# Make sure frontend is running on port 3000
curl http://localhost:3000
```

## Quick Reference

### Test Credentials
```
Guest User: audit.guest@test.com / AuditTest123!
Authenticated User: audit.authenticated@test.com / AuditTest123!
VIP User: audit.vip@test.com / AuditTest123!
```

### Test Products
- Audit Test Bordeaux 2015 (€89.99, Stock: 50)
- Audit Test Champagne NV (€149.99, Stock: 30)
- Audit Test Barolo 2016 (€129.99, Stock: 25)
- Audit Test Napa Cabernet 2018 (€199.99, Stock: 5) - Low stock
- Audit Test Rioja Reserva 2014 (€59.99, Stock: 100)
- Audit Test Unavailable Wine (€79.99, Stock: 0) - Out of stock

### Important URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Backend Health: http://localhost:5000/health
- Prisma Studio: http://localhost:5555 (run `npx prisma studio`)

### Log Files
- Audit Logs: `backend/logs/audit/audit-YYYY-MM-DD.log`
- Backend Logs: Console output
- Frontend Logs: Browser console

### Documentation Files
- Audit Checklist: `docs/AUDIT_CHECKLIST.md`
- Baseline Metrics: `docs/AUDIT_BASELINE_METRICS.md`
- Current System State: `docs/CURRENT_SYSTEM_STATE.md`
- Monitoring README: `backend/AUDIT_MONITORING_README.md`

## Next Steps

1. Open `docs/AUDIT_CHECKLIST.md`
2. Start with Phase 1: Product Discovery
3. Check off items as you test them
4. Document any issues found
5. Take screenshots of problems
6. Update baseline metrics document

## Support

If you encounter any issues not covered in this guide:

1. Check the troubleshooting section above
2. Review the detailed documentation files
3. Check backend/frontend logs for errors
4. Contact the development team

---

**Happy Auditing! 🎉**
