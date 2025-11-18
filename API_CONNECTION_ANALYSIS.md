# API Connection Analysis Report

## Overview
This document analyzes the frontend-backend API connections and identifies mismatches between what the frontend expects and what the backend provides.

## Critical Issues Found

### 1. **Product API Endpoint Mismatch**
**Issue**: Frontend calls `/products` but backend expects `/api/products`
- **Frontend**: `api.get('/products')` in ProductGrid.tsx
- **Backend**: Routes registered at `/api/products`
- **Fix Required**: Update frontend API calls to include `/api` prefix

### 2. **Response Structure Inconsistency**
**Issue**: Frontend expects different response structures than backend provides
- **Frontend expects**: `response.data.products` or `response.data`
- **Backend provides**: Wrapped in `ResponseHelper.success()` format
- **Fix Required**: Standardize response format or update frontend parsing

### 3. **Product Data Structure Mismatch**
**Issue**: Frontend expects different product fields than backend provides
- **Frontend expects**: `Wine` type with specific fields
- **Backend provides**: Transformed data from `ProductService.transformWineData()`
- **Missing fields**: Some frontend components expect fields not in backend response

### 4. **Cart API Integration Issues**
**Issue**: Cart service uses mock data instead of real database
- **Backend**: `CartService` uses in-memory mock data
- **Database**: Prisma schema has proper `CartItem` model
- **Fix Required**: Update CartService to use Prisma database operations

### 5. **Authentication Token Handling**
**Issue**: Inconsistent token management between frontend and backend
- **Frontend**: Uses `localStorage.getItem("authToken")`
- **Backend**: Expects `Bearer` token in Authorization header
- **Fix Required**: Ensure consistent token format and storage

## Detailed Analysis by Module

### Products Module
#### Frontend API Calls:
```typescript
// ProductGrid.tsx
const response = await api.get(`/products?${params.toString()}`)
setWines(response.data.products || response.data)

// ProductDetail.tsx  
const data = await productApi.getById(productId)
```

#### Backend Implementation:
```typescript
// product.routes.ts
router.get('/', productController.getWines)
router.get('/:id', productController.getWineById)

// product.controller.ts
ResponseHelper.success(res, result) // Wraps response in { success: true, data: result }
```

#### Issues:
1. **URL Mismatch**: Frontend calls `/products`, backend serves `/api/products`
2. **Response Format**: Backend wraps in `ResponseHelper.success()`, frontend expects direct data
3. **Data Structure**: Frontend expects `products` array, backend returns different structure

#### Recommended Fixes:
```typescript
// Fix 1: Update frontend API calls
const response = await api.get(`/api/products?${params.toString()}`)

// Fix 2: Update response parsing
setWines(response.data || response.products || [])

// Fix 3: Ensure backend returns expected structure
// In product.controller.ts
ResponseHelper.success(res, { products: result.wines, ...result })
```

### Cart Module
#### Frontend Implementation:
```typescript
// CartContext.tsx
const cartData = await cartApi.getCart()
dispatch({ type: 'SET_CART', payload: cartData })
```

#### Backend Implementation:
```typescript
// cart.service.ts - Uses MOCK DATA!
const mockCarts: Map<string, Cart> = new Map()
const mockCartItems: Map<string, CartItem[]> = new Map()
```

#### Critical Issue:
The cart service is completely mocked and doesn't use the database. This needs immediate attention.

#### Recommended Fix:
```typescript
// Update cart.service.ts to use Prisma
async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
  const cart = await this.prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          wine: {
            include: {
              images: true,
              prices: true,
              inventory: true
            }
          }
        }
      }
    }
  })
  
  if (!cart) {
    return await this.prisma.cart.create({
      data: {
        userId,
        sessionId,
        items: []
      }
    })
  }
  
  return cart
}
```

### Authentication Module
#### Frontend Implementation:
```typescript
// auth-api.ts
private getStoredToken(): string | null {
  return localStorage.getItem('accessToken')
}

// api.ts
if (!skipAuth && this.authToken) {
  headers.Authorization = `Bearer ${this.authToken}`
}
```

#### Backend Implementation:
```typescript
// auth.middleware.ts
const token = req.headers.authorization?.replace('Bearer ', '')
const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
```

#### Issues:
1. **Token Storage**: Frontend stores as `accessToken`, API client looks for `authToken`
2. **Session Management**: Backend creates sessions but frontend doesn't handle them properly

### Database Schema vs API Types
#### Prisma Schema Fields:
```prisma
model Wine {
  id              String   @id @default(cuid())
  name            String
  producer        String   @default("Premium Producer")
  description     String
  region          String
  vintage         Int
  category        String   @default("Red Wine")
  originalPrice   Float
  currentPrice    Float
  // ... many more fields
}
```

#### Frontend Wine Type:
```typescript
interface Wine {
  id: string
  name: string
  producer: string
  description: string
  region: string
  vintage: number
  category: string
  prices: WinePrice[]
  images: WineImage[]
  // ... different structure
}
```

#### Issue:
The frontend expects arrays for `prices` and `images`, but the backend might not be populating these correctly.

## Priority Fixes Required

### High Priority (Critical)
1. **Fix Cart Service**: Replace mock data with Prisma database operations
2. **Fix API Endpoints**: Ensure all frontend calls use correct `/api/*` prefixes
3. **Standardize Response Format**: Either update backend to return expected format or update frontend parsing

### Medium Priority
1. **Update Product Data Transformation**: Ensure backend returns all fields frontend expects
2. **Fix Authentication Token Handling**: Standardize token storage and retrieval
3. **Add Error Handling**: Improve error handling for API failures

### Low Priority
1. **Optimize Database Queries**: Add proper includes for related data
2. **Add Caching**: Implement proper caching for frequently accessed data
3. **Add Validation**: Ensure all API inputs are properly validated

## Recommended Implementation Plan

### Phase 1: Critical Fixes (1-2 days)
1. Update all frontend API calls to use `/api` prefix
2. Replace cart service mock data with Prisma operations
3. Fix response format inconsistencies

### Phase 2: Data Structure Alignment (2-3 days)
1. Update backend transformers to match frontend expectations
2. Ensure all database relations are properly included
3. Fix authentication token handling

### Phase 3: Optimization (1-2 days)
1. Add proper error handling and loading states
2. Implement caching where appropriate
3. Add comprehensive testing

## Testing Recommendations

1. **API Integration Tests**: Test all frontend-backend API interactions
2. **Database Tests**: Ensure all database operations work correctly
3. **Authentication Tests**: Test login/logout and token refresh flows
4. **Cart Tests**: Test all cart operations with real database
5. **Product Tests**: Test product listing, filtering, and detail views

## Conclusion

The main issues are:
1. **URL prefix mismatch** - Easy fix
2. **Cart service using mock data** - Critical fix needed
3. **Response format inconsistencies** - Needs standardization
4. **Data structure mismatches** - Requires careful alignment

These fixes will ensure proper communication between frontend and backend, and enable the application to work with real database data instead of mock data.