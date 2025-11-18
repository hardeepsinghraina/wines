# Environment Configuration Guide

This document explains how to configure environment variables for both the frontend and backend applications.

## Overview

All URLs and configuration values are now centralized in environment files. This makes it easy to:
- Switch between development and production environments
- Configure different API endpoints
- Manage feature flags
- Keep sensitive data out of the codebase

## Frontend Configuration

### Location
- Development: `frontend/.env.local`
- Example: `frontend/.env.example`

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false
```

### Usage in Code

All frontend code should use the centralized API configuration:

```typescript
import { API_CONFIG, getApiUrl } from '@/config/api';

// Get the base URL
const baseUrl = API_CONFIG.BASE_URL;

// Get a full API URL
const url = getApiUrl('/api/products');
```

**DO NOT** hardcode URLs in components:
```typescript
// ❌ BAD - Hardcoded URL
fetch('http://localhost:5000/api/products')

// ✅ GOOD - Using config
import { getApiUrl } from '@/config/api';
fetch(getApiUrl('/api/products'))
```

## Backend Configuration

### Location
- Development: `backend/.env`
- Example: `backend/.env.example`

### Required Variables

```bash
# Database
DATABASE_URL="file:./dev.db"

# Server
NODE_ENV=development
PORT=5000

# CORS - Frontend URLs that can access the API
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=5000

# Security
SECURITY_MONITORING_ENABLED=true
AUDIT_LOG_ENABLED=true
```

### CORS Configuration

The backend automatically allows these origins in development:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `http://127.0.0.1:3002`

For production, set the `CORS_ORIGIN` environment variable to your frontend URL.

## Production Configuration

### Frontend (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### Backend (.env)

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/wine_db
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-key
REDIS_URL=redis://localhost:6379
```

## Environment Variable Naming Conventions

### Frontend (Next.js)
- All public variables must start with `NEXT_PUBLIC_`
- These are exposed to the browser
- Never put secrets in `NEXT_PUBLIC_` variables

### Backend (Node.js)
- No prefix required
- All variables are server-side only
- Safe for secrets and API keys

## Setup Instructions

### First Time Setup

1. **Frontend**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

### Verifying Configuration

1. **Check Frontend Config**:
   ```bash
   cd frontend
   npm run dev
   # Should start on http://localhost:3000 or 3001
   ```

2. **Check Backend Config**:
   ```bash
   cd backend
   npm run dev
   # Should start on http://localhost:5000
   ```

3. **Test CORS**:
   - Open frontend in browser
   - Check browser console for CORS errors
   - All API calls should work without errors

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `NEXT_PUBLIC_API_URL` in frontend matches backend URL
2. Check that backend `CORS_ORIGIN` includes frontend URL
3. Restart both servers after changing environment variables

### API Connection Errors

If API calls fail:
1. Verify backend is running on the correct port
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Check browser network tab for actual URLs being called
4. Ensure no hardcoded URLs in components

### Environment Variables Not Loading

If changes don't take effect:
1. Restart the development server
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

## Best Practices

1. **Never commit `.env` or `.env.local` files**
   - These are in `.gitignore`
   - Only commit `.env.example` files

2. **Use environment-specific files**
   - `.env.local` for local development
   - `.env.production` for production builds
   - `.env.test` for testing

3. **Document all variables**
   - Add comments in `.env.example`
   - Update this guide when adding new variables

4. **Validate environment variables**
   - Check for required variables on startup
   - Provide clear error messages if missing

5. **Use the centralized config**
   - Always import from `@/config/api`
   - Never hardcode URLs in components
   - Keep all configuration in one place
