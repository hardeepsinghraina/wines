# CORS and Environment Configuration Fixes

## Overview
Fixed CORS issues and centralized all URL configuration in environment files to follow best practices.

## Problems Fixed

### 1. CORS Headers Missing
The backend was rejecting requests because it didn't allow the custom headers the frontend was sending.

### 2. Hardcoded URLs
Multiple components had hardcoded URLs like `http://localhost:5000` or relative URLs like `/api/products` that went to the wrong port.

### 3. No Centralized Configuration
URLs were scattered throughout the codebase, making it difficult to change environments.

## Solutions Implemented

### 1. Backend CORS Configuration (backend/src/middleware/security.ts)

Added missing headers to allowed list:
- `X-User-Agent`
- `X-Client-Version`
- `X-Client-Platform`

Added support for multiple development ports:
- `http://localhost:3000`, `3001`, `3002`
- `http://127.0.0.1:3000`, `3001`, `3002`

### 2. Centralized Frontend Configuration (frontend/src/config/api.ts)

Created a new configuration file that:
- Reads from environment variables
- Provides a `getApiUrl()` helper function
- Exports constants for all API configuration
- Serves as single source of truth for URLs

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
}
```

### 3. Updated All Components

Replaced hardcoded URLs in:
- ✅ `ProductFilters.tsx`
- ✅ `PerformanceProvider.tsx`
- ✅ `PrivacySettings.tsx` (3 instances)
- ✅ `contact/page.tsx`
- ✅ `MonitoringDashboard.tsx`
- ✅ `ProductBulkManager.tsx`
- ✅ `useAnalytics.tsx`
- ✅ `products/search/page.tsx`
- ✅ `collections/page.tsx`
- ✅ `admin-product-api.ts`
- ✅ `admin-panel-api.ts`
- ✅ `admin-api.ts`
- ✅ `api.ts`

All now use:
```typescript
import { getApiUrl } from '@/config/api';
const response = await fetch(getApiUrl('/api/endpoint'));
```

### 4. Environment Files

Created example environment files:
- `frontend/.env.example` - Documents all frontend variables
- `backend/.env.example` - Documents all backend variables

### 5. Documentation

Created comprehensive guide:
- `ENVIRONMENT_CONFIGURATION.md` - Complete setup and usage guide

## Environment Variables

### Frontend (frontend/.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false
```

### Backend (backend/.env)
```bash
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=5000
SECURITY_MONITORING_ENABLED=true
AUDIT_LOG_ENABLED=true
```

## Benefits

1. **Easy Environment Switching**
   - Change one variable to switch between dev/staging/prod
   - No code changes needed

2. **Better Security**
   - No hardcoded URLs in codebase
   - Secrets stay in environment files
   - Environment files are gitignored

3. **Maintainability**
   - Single source of truth for configuration
   - Easy to find and update URLs
   - Clear documentation

4. **Flexibility**
   - Support multiple environments
   - Easy to add new configuration
   - Team members can have different local setups

## Testing

Both servers are running:
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:3001
- ✅ CORS: Properly configured
- ✅ API calls: Using environment variables

## Next Steps

1. Test all API endpoints in the browser
2. Verify cart functionality works
3. Test authentication flows
4. Prepare production environment variables

## Migration Guide for Developers

If you're working on this codebase:

1. **Never hardcode URLs**:
   ```typescript
   // ❌ DON'T DO THIS
   fetch('http://localhost:5000/api/products')
   
   // ✅ DO THIS
   import { getApiUrl } from '@/config/api';
   fetch(getApiUrl('/api/products'))
   ```

2. **Use the API client when possible**:
   ```typescript
   // ✅ BEST - Use the API client
   import { api } from '@/lib/api';
   const data = await api.get('/api/products');
   ```

3. **Add new config to the centralized file**:
   - Edit `frontend/src/config/api.ts`
   - Add to environment files
   - Document in `ENVIRONMENT_CONFIGURATION.md`

## Files Changed

### Created
- `frontend/src/config/api.ts`
- `frontend/.env.example`
- `backend/.env.example`
- `ENVIRONMENT_CONFIGURATION.md`
- `CORS_AND_ENV_FIXES_SUMMARY.md`

### Modified
- `backend/src/middleware/security.ts`
- `frontend/src/components/product/ProductFilters.tsx`
- `frontend/src/components/providers/PerformanceProvider.tsx`
- `frontend/src/components/privacy/PrivacySettings.tsx`
- `frontend/src/app/contact/page.tsx`
- `frontend/src/components/admin/MonitoringDashboard.tsx`
- `frontend/src/components/admin/ProductBulkManager.tsx`
- `frontend/src/hooks/useAnalytics.tsx`
- `frontend/src/app/products/search/page.tsx`
- `frontend/src/app/collections/page.tsx`
- `frontend/src/lib/admin-product-api.ts`
- `frontend/src/lib/admin-panel-api.ts`
- `frontend/src/lib/admin-api.ts`
- `frontend/src/lib/api.ts`
