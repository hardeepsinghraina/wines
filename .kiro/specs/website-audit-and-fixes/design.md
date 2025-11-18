# Design Document

## Overview

This design addresses the comprehensive audit and fix of the luxury wine e-commerce platform. The solution focuses on identifying and resolving missing page implementations, broken links, incorrect data fetching patterns, and placeholder content. The design follows a systematic approach to audit all pages, fix API integration issues, and ensure consistent data flow throughout the application.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │ Components │  │  Contexts  │            │
│  │  (Routes)  │  │    (UI)    │  │  (State)   │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │               │               │                    │
│         └───────────────┴───────────────┘                    │
│                         │                                    │
│         ┌───────────────┴───────────────┐                    │
│         │                               │                    │
│  ┌──────▼──────┐              ┌────────▼────────┐           │
│  │  API Client │              │  Config/Utils   │           │
│  │  (lib/api)  │              │  (config/api)   │           │
│  └──────┬──────┘              └─────────────────┘           │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ HTTP/HTTPS
          │
┌─────────▼────────────────────────────────────────────────────┐
│                    Backend (Express/Node.js)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Routes   │  │Controllers │  │  Services  │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │               │               │                    │
│         └───────────────┴───────────────┘                    │
│                         │                                    │
│                  ┌──────▼──────┐                             │
│                  │   Prisma    │                             │
│                  │   (ORM)     │                             │
│                  └──────┬──────┘                             │
└─────────────────────────┼────────────────────────────────────┘
                          │
                  ┌───────▼────────┐
                  │   PostgreSQL   │
                  │   Database     │
                  └────────────────┘
```

### Audit Strategy

The audit will be conducted in phases:

1. **Page Discovery Phase**: Identify all routes and their implementation status
2. **API Integration Phase**: Verify all API endpoints are correctly called
3. **Data Flow Phase**: Ensure data is properly fetched, transformed, and displayed
4. **Error Handling Phase**: Implement consistent error handling across all pages
5. **Validation Phase**: Test all fixes and verify functionality

## Components and Interfaces

### 1. Page Audit System

#### Missing Page Detector
```typescript
interface PageAuditResult {
  route: string;
  exists: boolean;
  hasImplementation: boolean;
  hasPlaceholder: boolean;
  issues: string[];
  apiCalls: ApiCallInfo[];
}

interface ApiCallInfo {
  endpoint: string;
  method: string;
  isCorrect: boolean;
  expectedEndpoint?: string;
  usesEnvironmentConfig: boolean;
}
```

**Implementation Strategy**:
- Scan all route directories in `frontend/src/app`
- Check for missing `page.tsx` files in dynamic routes
- Identify placeholder content using regex patterns
- Verify API calls use centralized configuration

### 2. Dynamic Route Implementations

#### Products by Category Page
**Location**: `frontend/src/app/products/[category]/page.tsx`

**Current State**: Missing implementation

**Design**:
```typescript
interface CategoryPageProps {
  params: { category: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Page Component
- Fetch products filtered by category from `/api/products?category={category}`
- Display product grid with filters
- Handle loading and error states
- Implement pagination
- Use ProductGrid component for consistency
```

**Data Flow**:
1. Extract category from URL params
2. Call `/api/products` with category filter
3. Transform response data to match Wine interface
4. Render ProductGrid with filtered wines
5. Handle empty results with helpful message

#### Debug API Page
**Location**: `frontend/src/app/debug-api/page.tsx`

**Current State**: Directory exists but no page file

**Design Decision**: Remove the route entirely as it's not needed in production

**Action**: Delete the `debug-api` directory

### 3. API Client Enhancements

#### Centralized URL Configuration
**Current Implementation**: Already exists in `frontend/src/config/api.ts`

**Enhancement Needed**: Ensure all components use `getApiUrl()` helper

**Audit Pattern**:
```typescript
// Find all instances of:
// ❌ fetch('http://localhost:5000/api/...')
// ❌ fetch('/api/...')  // Wrong - goes to frontend port
// ✅ fetch(getApiUrl('/api/...'))
// ✅ api.get('/api/...')  // Uses centralized client
```

### 4. Cart Context Fixes

**Current Issue**: Cart initialization may fail silently

**Design Solution**:
```typescript
// Enhanced error handling in CartContext
interface CartInitializationStrategy {
  1. Try to fetch from API
  2. If fails, check localStorage backup
  3. If no backup, initialize empty cart
  4. Display user-friendly error message
  5. Provide retry mechanism
}

// Add initialization status tracking
interface CartState {
  // ... existing fields
  initializationStatus: 'pending' | 'success' | 'failed';
  initializationError: string | null;
}
```

**Implementation**:
- Add try-catch in `initializeCart()` with fallback logic
- Display toast notification on cart load failure
- Add "Retry" button in cart dropdown when failed
- Log detailed errors for debugging

### 5. Authentication Flow Completion

**Current Issue**: Login page may return 404 or auth fails

**Design Solution**:

#### Login Page Verification
- Ensure `/login` route exists and is properly configured
- Verify auth route group `(auth)` is correctly set up
- Check middleware doesn't block auth pages

#### API Endpoint Verification
```typescript
// Backend: /api/auth/login
POST /api/auth/login
Body: { email: string, password: string }
Response: { 
  user: User, 
  accessToken: string, 
  refreshToken: string 
}

// Frontend: AuthContext.login()
- Call authApi.login() with credentials
- Store tokens in localStorage
- Update auth state
- Redirect to intended page or home
```

#### Error Handling
```typescript
interface AuthError {
  type: 'network' | 'validation' | 'credentials' | 'server';
  message: string;
  field?: string;  // For validation errors
}

// Display appropriate error messages:
- Network error: "Unable to connect. Please check your internet."
- Invalid credentials: "Email or password is incorrect."
- Validation error: "Please enter a valid email address."
- Server error: "Something went wrong. Please try again later."
```

### 6. Order Detail Page Enhancement

**Current Issue**: Uses TODO comment for API call

**Design Solution**:
```typescript
// Replace TODO with actual implementation
const fetchOrder = async () => {
  try {
    setLoading(true);
    // Use centralized API client
    const response = await api.get(`/api/orders/${orderId}`);
    setOrder(response.data || response);
  } catch (err) {
    // Enhanced error handling
    if (err.status === 404) {
      setError('Order not found');
    } else if (err.status === 403) {
      setError('You do not have permission to view this order');
    } else {
      setError('Failed to load order details');
    }
  } finally {
    setLoading(false);
  }
};
```

### 7. Search Functionality Verification

**Current State**: Backend endpoints working, frontend needs verification

**Design**:
```typescript
// Search Page Component
interface SearchPageState {
  query: string;
  results: Wine[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  filters: FilterOptions;
}

// Debounced search implementation
const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const results = await api.get(`/api/products/search?q=${encodeURIComponent(query)}`);
      setResults(results.data || results);
    } catch (error) {
      setError('Search failed. Please try again.');
    }
  }, 300),
  []
);

// Suggestions for autocomplete
const fetchSuggestions = async (query: string) => {
  if (query.length < 2) return;
  
  try {
    const suggestions = await api.get(
      `/api/products/search/suggestions?q=${encodeURIComponent(query)}`
    );
    setSuggestions(suggestions.data || suggestions);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
  }
};
```

### 8. Category and Filter Navigation

**Current Issue**: Category pages filter by wrong field

**Design Solution**:
```typescript
// Category Page Implementation
const CategoryPage = ({ params }: { params: { category: string } }) => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWines = async () => {
      try {
        setLoading(true);
        
        // Determine if category is a region or actual category
        const isRegion = isRegionName(params.category);
        const filterParam = isRegion ? 'region' : 'category';
        
        const response = await api.get(
          `/api/products?${filterParam}=${encodeURIComponent(params.category)}`
        );
        
        setWines(response.data?.wines || response.data || []);
      } catch (error) {
        console.error('Failed to fetch wines:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWines();
  }, [params.category]);
  
  // ... render logic
};

// Helper function to determine if it's a region
const isRegionName = (name: string): boolean => {
  const regions = ['bordeaux', 'burgundy', 'champagne', 'rhone', 'loire'];
  return regions.includes(name.toLowerCase());
};
```

## Data Models

### Wine Product Model
```typescript
interface Wine {
  id: string;
  name: string;
  producer: string;
  vintage: number;
  region: string;
  category: string;
  description: string;
  alcoholContent: number;
  bottleSize: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  images: WineImage[];
  prices: WinePrice[];
  inventory: WineInventory[];
  createdAt: Date;
  updatedAt: Date;
}

interface WineImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

interface WinePrice {
  id: string;
  currency: string;
  price: number;
}

interface WineInventory {
  id: string;
  quantity: number;
  reservedQty: number;
}
```

### API Response Formats
```typescript
// Standardized response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Product list response
interface ProductListResponse {
  wines?: Wine[];
  products?: Wine[];  // Alternative key
  total: number;
  page: number;
  limit: number;
}

// Handle multiple response formats
const normalizeProductResponse = (response: any): Wine[] => {
  return response.data?.wines || 
         response.data?.products || 
         response.data || 
         response.wines || 
         response.products || 
         [];
};
```

## Error Handling

### Error Hierarchy
```typescript
interface AppError {
  type: 'network' | 'api' | 'validation' | 'auth' | 'notfound';
  message: string;
  statusCode?: number;
  details?: any;
  retryable: boolean;
}

// Error handling strategy
class ErrorHandler {
  static handle(error: any): AppError {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Unable to connect to server',
        retryable: true
      };
    }
    
    // API errors
    if (error.response) {
      return {
        type: 'api',
        message: error.response.data?.message || 'Request failed',
        statusCode: error.response.status,
        retryable: error.response.status >= 500
      };
    }
    
    // Default error
    return {
      type: 'api',
      message: 'An unexpected error occurred',
      retryable: false
    };
  }
}
```

### User-Friendly Error Messages
```typescript
const ERROR_MESSAGES = {
  network: 'Unable to connect. Please check your internet connection.',
  notfound: 'The page or resource you're looking for doesn't exist.',
  auth: 'Please log in to continue.',
  server: 'Something went wrong on our end. Please try again later.',
  validation: 'Please check your input and try again.',
  cart: 'Unable to update cart. Your changes will be saved when connection is restored.',
  payment: 'Payment processing failed. Please try again or use a different payment method.',
};

// Error display component
interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

## Testing Strategy

### 1. Page Audit Tests
```typescript
describe('Page Audit', () => {
  test('All routes have page implementations', () => {
    const routes = getAllRoutes();
    routes.forEach(route => {
      expect(pageExists(route)).toBe(true);
    });
  });
  
  test('No placeholder content in production pages', () => {
    const pages = getAllPages();
    pages.forEach(page => {
      expect(hasPlaceholderContent(page)).toBe(false);
    });
  });
  
  test('All API calls use centralized configuration', () => {
    const components = getAllComponents();
    components.forEach(component => {
      expect(usesHardcodedUrls(component)).toBe(false);
    });
  });
});
```

### 2. API Integration Tests
```typescript
describe('API Integration', () => {
  test('Product listing fetches from correct endpoint', async () => {
    const response = await api.get('/api/products');
    expect(response).toHaveProperty('data');
    expect(Array.isArray(response.data)).toBe(true);
  });
  
  test('Category filtering works correctly', async () => {
    const response = await api.get('/api/products?category=Red Wine');
    const wines = response.data?.wines || response.data;
    wines.forEach(wine => {
      expect(wine.category).toBe('Red Wine');
    });
  });
  
  test('Search returns relevant results', async () => {
    const response = await api.get('/api/products/search?q=bordeaux');
    expect(response.data).toBeDefined();
  });
});
```

### 3. Cart Functionality Tests
```typescript
describe('Cart Functionality', () => {
  test('Cart initializes successfully', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => {
      expect(result.current.initializationStatus).toBe('success');
    });
  });
  
  test('Cart handles initialization failure gracefully', async () => {
    mockApiFailure();
    const { result } = renderHook(() => useCart());
    await waitFor(() => {
      expect(result.current.initializationStatus).toBe('failed');
      expect(result.current.initializationError).toBeDefined();
    });
  });
  
  test('Add to cart updates state correctly', async () => {
    const { result } = renderHook(() => useCart());
    await act(async () => {
      await result.current.addToCart('wine-123', 2);
    });
    expect(result.current.items).toHaveLength(1);
  });
});
```

### 4. Authentication Tests
```typescript
describe('Authentication Flow', () => {
  test('Login page renders correctly', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  
  test('Login with valid credentials succeeds', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });
    expect(result.current.isAuthenticated).toBe(true);
  });
  
  test('Login with invalid credentials shows error', async () => {
    mockApiError(401, 'Invalid credentials');
    const { result } = renderHook(() => useAuth());
    await expect(
      result.current.login({
        email: 'test@example.com',
        password: 'wrong'
      })
    ).rejects.toThrow();
    expect(result.current.error).toBeDefined();
  });
});
```

### 5. Error Handling Tests
```typescript
describe('Error Handling', () => {
  test('Network errors display user-friendly message', async () => {
    mockNetworkError();
    render(<ProductPage />);
    await waitFor(() => {
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });
  });
  
  test('404 errors show not found page', async () => {
    mockApiError(404);
    render(<ProductDetailPage params={{ id: 'nonexistent' }} />);
    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
  
  test('Retry button works after error', async () => {
    const { rerender } = render(<ProductPage />);
    mockApiError(500);
    await waitFor(() => {
      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });
    
    mockApiSuccess();
    fireEvent.click(screen.getByText(/try again/i));
    await waitFor(() => {
      expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
    });
  });
});
```

## Implementation Phases

### Phase 1: Page Discovery and Audit (Priority: High)
- Scan all route directories
- Identify missing page implementations
- Document placeholder content
- Create audit report

### Phase 2: Missing Page Implementations (Priority: High)
- Implement `/products/[category]/page.tsx`
- Remove `/debug-api` directory
- Fix any other missing pages discovered in audit

### Phase 3: API Integration Fixes (Priority: High)
- Verify all API calls use centralized configuration
- Fix hardcoded URLs
- Ensure correct endpoint paths with `/api` prefix
- Update response parsing to handle multiple formats

### Phase 4: Cart and Auth Fixes (Priority: High)
- Enhance cart initialization error handling
- Add retry mechanism for cart loading
- Verify login page routing
- Test authentication flow end-to-end

### Phase 5: Data Fetching Corrections (Priority: Medium)
- Fix category filtering logic
- Implement proper region vs category detection
- Update search functionality
- Verify all data transformations

### Phase 6: Error Handling Enhancement (Priority: Medium)
- Implement consistent error handling across all pages
- Add user-friendly error messages
- Implement retry mechanisms
- Add error logging

### Phase 7: Testing and Validation (Priority: Medium)
- Write unit tests for critical components
- Perform integration testing
- Manual testing of all pages
- Fix any issues discovered

### Phase 8: Placeholder Content Removal (Priority: Low)
- Replace placeholder images with real images or consistent fallbacks
- Remove "Coming Soon" and "TODO" markers
- Ensure all content is production-ready

## Performance Considerations

### Caching Strategy
- Use React Query or SWR for data caching
- Implement stale-while-revalidate pattern
- Cache product listings for 5 minutes
- Cache categories and filters for 1 hour

### Lazy Loading
- Implement lazy loading for product images
- Use Next.js Image component for optimization
- Lazy load non-critical components

### Code Splitting
- Split large components into smaller chunks
- Use dynamic imports for heavy components
- Implement route-based code splitting

## Security Considerations

### API Security
- Always use HTTPS in production
- Validate all user inputs
- Sanitize data before display
- Implement rate limiting

### Authentication Security
- Store tokens securely
- Implement token refresh mechanism
- Clear tokens on logout
- Validate tokens on each request

### Data Privacy
- Don't log sensitive information
- Implement proper CORS configuration
- Use secure cookies for session management
- Follow GDPR compliance requirements

## Monitoring and Logging

### Error Tracking
- Log all API errors with context
- Track error rates by endpoint
- Monitor cart initialization failures
- Alert on critical errors

### Performance Monitoring
- Track page load times
- Monitor API response times
- Track cart operations performance
- Monitor authentication flow timing

### User Analytics
- Track page views
- Monitor user flows
- Track conversion rates
- Identify drop-off points
