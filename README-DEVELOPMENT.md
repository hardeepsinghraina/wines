# Development Setup Guide

## Quick Start

### 1. Start Backend Server
```bash
cd backend
npm run start
```

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Development Features

### Backend (Port 5000)
- ✅ **Mock Redis**: No Redis server required
- ✅ **Optional Database**: Continues without PostgreSQL
- ✅ **Relaxed Security**: Input sanitization disabled in dev mode

### Frontend (Port 3000)
- ✅ **API Integration**: Configured for localhost:5000
- ✅ **Environment Variables**: Set in `.env.local`
- ✅ **Backend Health Check**: `npm run check-backend`

## API Endpoints

With backend running on http://localhost:5000:

### Public Endpoints
- `GET /health` - Server health status
- `GET /api` - API information
- `GET /api/products` - Wine products (no auth required)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Admin
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/products` - Admin product management

### E-commerce
- `GET /api/cart` - Shopping cart
- `POST /api/orders` - Create order
- `POST /api/payments/crypto/initiate` - Crypto payments

## Troubleshooting

### Backend Issues
1. **"Cannot find module" errors**: Run `npm run build` in backend
2. **Database connection errors**: Normal in development, server continues
3. **Redis errors**: Normal in development, using mock client
4. **Port 5000 in use**: Kill existing processes or change port

### Frontend Issues
1. **API connection failed**: Ensure backend is running on port 5000
2. **CORS errors**: Backend is configured for localhost:3000
3. **Environment variables**: Check `.env.local` exists

### Quick Health Check
```bash
# Check if backend is accessible
cd frontend && npm run check-backend

# Manual test
curl http://localhost:5000/health
```

## Development Database (Optional)

If you want full database functionality:

### Option 1: Docker PostgreSQL
```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=luxury_wine_db \
  -p 5432:5432 -d postgres:15
```

### Option 2: Local PostgreSQL
1. Install PostgreSQL
2. Create database: `luxury_wine_db`
3. Update `backend/.env` with your credentials
4. Run migrations: `cd backend && npx prisma migrate dev`

## Production Deployment

See individual README files in `backend/` and `frontend/` directories for production deployment instructions.