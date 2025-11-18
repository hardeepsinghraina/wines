# Manual Testing Checklist - Website Audit Fixes

This document provides a comprehensive checklist for manually testing all fixes implemented during the website audit.

## Prerequisites

- [ ] Frontend server running on http://localhost:3000
- [ ] Backend server running on http://localhost:5000
- [ ] Database is seeded with test data
- [ ] Test user account created (email: test@example.com)
- [ ] Browser DevTools open for monitoring network requests

---

## 1. Page Implementations & Navigation

### 1.1 Missing Pages Fixed
- [ ] Navigate to `/products/red-wine` - should display filtered products
- [ ] Navigate to `/products/white-wine` - should display filtered products
- [ ] Navigate to `/products/champagne` - should display filtered products
- [ ] Navigate to `/products/bordeaux` - should display region-filtered products
- [ ] Navigate to `/products/burgundy` - should display region-filtered products
- [ ] Verify all category links in navigation work
- [ ] Verify all footer links work

### 1.2 Removed Pages
- [ ] Navigate to `/debug-api` - should return 404 or redirect
- [ ] Verify no broken links to debug-api in the application

### 1.3 Dynamic Routes
- [ ] Click on a product category from homepage
- [ ] Verify URL changes to `/products/[category]`
- [ ] Verify products are filtered correctly
- [ ] Verify page title and metadata are correct

---

## 2. API Integration

### 2.1 API Endpoint Verification
- [ ] Open DevTools Network tab
- [ ] Navigate to products page
- [ ] Verify API calls go to correct backend URL (not localhost:3000)
- [ ] Verify all endpoints include `/api` prefix
- [ ] Check for any 404 errors in network tab

### 2.2 Environment Configuration
- [ ] Verify `NEXT_PUBLIC_API_URL` is set in `.env.local`
- [ ] Verify API calls use environment variable (check network tab)
- [ ] Test with different API URL to confirm configuration works

### 2.3 Response Parsing
- [ ] Navigate to collections page
- [ ] Verify products display correctly
- [ ] Check console for any parsing errors
- [ ] Verify product images load
- [ ] Verify product prices display correctly

### 2.4 No Hardcoded URLs
- [ ] Search codebase for `localhost:5000` - should find none in src/
- [ ] Search codebase for hardcoded API URLs
- [ ] Verify all API calls use `getApiUrl()` or centralized client

---

## 3. Cart Functionality

### 3.1 Cart Initialization
- [ ] Open application in fresh browser/incognito
- [ ] Verify cart icon appears in header
- [ ] Click cart icon - should open without errors
- [ ] Check console for "failed to load cart" errors (should be none)

### 3.2 Add to Cart
- [ ] Navigate to products page
- [ ] Click "Add to Cart" on a product
- [ ] Verify cart count updates in header
- [ ] Open cart dropdown - verify product appears
- [ ] Verify product details are correct (name, price, quantity)

### 3.3 Cart Error Handling
- [ ] Stop backend server
- [ ] Try to add item to cart
- [ ] Verify user-friendly error message appears
- [ ] Verify "Retry" button is available
- [ ] Restart backend and click "Retry"
- [ ] Verify cart loads successfully

### 3.4 Cart Persistence
- [ ] Add items to cart
- [ ] Refresh page
- [ ] Verify cart items persist
- [ ] Close and reopen browser
- [ ] Verify cart items still present (for authenticated users)

---

## 4. Authentication Flow

### 4.1 Login Page
- [ ] Navigate to `/login`
- [ ] Verify login form displays correctly
- [ ] Verify email and password fields present
- [ ] Verify "Remember me" checkbox present
- [ ] Verify "Forgot password" link present

### 4.2 Login Functionality
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] Verify successful login (redirects to homepage or intended page)
- [ ] Verify user menu appears in header
- [ ] Check localStorage for auth token

### 4.3 Login Error Handling
- [ ] Enter invalid email format
- [ ] Verify validation error displays
- [ ] Enter wrong password
- [ ] Verify "Invalid credentials" error displays
- [ ] Stop backend server
- [ ] Try to login
- [ ] Verify network error message displays

### 4.4 Logout
- [ ] Click user menu in header
- [ ] Click "Logout"
- [ ] Verify redirects to homepage
- [ ] Verify user menu disappears
- [ ] Verify auth token removed from localStorage

### 4.5 Token Refresh
- [ ] Login successfully
- [ ] Wait for token to expire (or manually expire it)
- [ ] Make an API request (navigate to protected page)
- [ ] Verify token refresh happens automatically
- [ ] Verify no logout occurs

### 4.6 Protected Routes
- [ ] Logout if logged in
- [ ] Try to navigate to `/account`
- [ ] Verify redirects to login page
- [ ] Login and verify redirects back to `/account`

---

## 5. Order Detail Page

### 5.1 Order Display
- [ ] Login as user with orders
- [ ] Navigate to `/account/orders`
- [ ] Click on an order
- [ ] Verify order details display correctly
- [ ] Verify order items list displays
- [ ] Verify shipping information displays
- [ ] Verify payment information displays

### 5.2 Order Error Handling
- [ ] Navigate to `/account/orders/nonexistent-id`
- [ ] Verify "Order not found" message displays
- [ ] Verify navigation options provided
- [ ] Try to access another user's order
- [ ] Verify "Permission denied" message displays

### 5.3 Order Tracking
- [ ] View order with tracking information
- [ ] Verify tracking number displays
- [ ] Verify carrier information displays
- [ ] Verify tracking link works (if applicable)

---

## 6. Search Functionality

### 6.1 Search Input
- [ ] Click search icon in header
- [ ] Type search query (e.g., "bordeaux")
- [ ] Verify debounce works (no request until typing stops)
- [ ] Verify minimum 2 characters required
- [ ] Verify loading indicator appears

### 6.2 Search Results
- [ ] Complete search query
- [ ] Verify results display correctly
- [ ] Verify product images load
- [ ] Verify product names and prices display
- [ ] Verify "Add to Cart" buttons work from results

### 6.3 Search Suggestions
- [ ] Start typing in search box
- [ ] Verify suggestions dropdown appears
- [ ] Verify suggestions are relevant
- [ ] Click a suggestion
- [ ] Verify navigates to correct page or performs search

### 6.4 No Results
- [ ] Search for nonsense term (e.g., "xyzabc123")
- [ ] Verify "No results found" message displays
- [ ] Verify helpful suggestions provided
- [ ] Verify search box remains functional

---

## 7. Category & Filter Navigation

### 7.1 Category Filtering
- [ ] Navigate to products page
- [ ] Click "Red Wine" category filter
- [ ] Verify URL updates with category parameter
- [ ] Verify only red wines display
- [ ] Click "White Wine" category
- [ ] Verify filters update correctly

### 7.2 Region vs Category Detection
- [ ] Navigate to `/products/bordeaux`
- [ ] Verify wines from Bordeaux region display
- [ ] Navigate to `/products/red-wine`
- [ ] Verify red wines display (not region filtered)
- [ ] Verify correct filter parameter used in API call (check network tab)

### 7.3 Multiple Filters
- [ ] Select category filter (e.g., "Red Wine")
- [ ] Select region filter (e.g., "Bordeaux")
- [ ] Select price range filter
- [ ] Verify all filters applied simultaneously
- [ ] Verify URL reflects all active filters
- [ ] Verify API call includes all filter parameters

### 7.4 Filter Options
- [ ] Open filters panel
- [ ] Verify categories list displays
- [ ] Verify regions list displays
- [ ] Verify price ranges display
- [ ] Verify product counts show for each filter option

### 7.5 Clear Filters
- [ ] Apply multiple filters
- [ ] Click "Clear all filters" button
- [ ] Verify all filters removed
- [ ] Verify all products display again
- [ ] Verify URL parameters cleared

---

## 8. Error Handling

### 8.1 Network Errors
- [ ] Stop backend server
- [ ] Navigate to products page
- [ ] Verify user-friendly error message displays
- [ ] Verify "Retry" button appears
- [ ] Restart backend
- [ ] Click "Retry"
- [ ] Verify page loads successfully

### 8.2 404 Errors
- [ ] Navigate to `/nonexistent-page`
- [ ] Verify custom 404 page displays
- [ ] Verify navigation options provided
- [ ] Verify can navigate back to working pages

### 8.3 API Errors
- [ ] Trigger various API errors (invalid data, etc.)
- [ ] Verify appropriate error messages display
- [ ] Verify no technical error details exposed to user
- [ ] Verify errors logged to console for debugging

### 8.4 Validation Errors
- [ ] Try to submit forms with invalid data
- [ ] Verify field-level validation errors display
- [ ] Verify errors clear when correcting input
- [ ] Verify helpful error messages provided

### 8.5 Offline Detection
- [ ] Open DevTools Network tab
- [ ] Set to "Offline" mode
- [ ] Verify offline indicator appears
- [ ] Try to perform actions
- [ ] Verify appropriate offline messages display
- [ ] Go back online
- [ ] Verify offline indicator disappears

---

## 9. Placeholder Content

### 9.1 Images
- [ ] Browse all pages
- [ ] Verify no placeholder images (gray boxes)
- [ ] Verify all product images load or show fallback
- [ ] Verify images have proper alt text
- [ ] Verify images use Next.js Image component

### 9.2 Text Content
- [ ] Search codebase for "TODO"
- [ ] Search codebase for "Coming Soon"
- [ ] Search codebase for "Under Construction"
- [ ] Verify all found instances are either implemented or removed
- [ ] Browse all pages to verify no placeholder text visible

---

## 10. Cross-Browser Testing

### 10.1 Chrome
- [ ] Test all critical flows in Chrome
- [ ] Verify no console errors
- [ ] Verify all features work correctly

### 10.2 Firefox
- [ ] Test all critical flows in Firefox
- [ ] Verify no console errors
- [ ] Verify all features work correctly

### 10.3 Safari (if available)
- [ ] Test all critical flows in Safari
- [ ] Verify no console errors
- [ ] Verify all features work correctly

### 10.4 Edge
- [ ] Test all critical flows in Edge
- [ ] Verify no console errors
- [ ] Verify all features work correctly

---

## 11. Mobile Responsiveness

### 11.1 Mobile View (DevTools)
- [ ] Open DevTools responsive mode
- [ ] Test iPhone SE (375px)
- [ ] Test iPhone 12 Pro (390px)
- [ ] Test iPad (768px)
- [ ] Verify navigation menu works
- [ ] Verify cart works on mobile
- [ ] Verify forms work on mobile

### 11.2 Touch Interactions
- [ ] Test all buttons and links
- [ ] Verify touch targets are large enough
- [ ] Verify no hover-only interactions
- [ ] Test swipe gestures (if applicable)

---

## 12. Performance

### 12.1 Page Load Times
- [ ] Open DevTools Performance tab
- [ ] Navigate to homepage
- [ ] Verify page loads in < 3 seconds
- [ ] Check for any blocking resources
- [ ] Verify images are optimized

### 12.2 API Response Times
- [ ] Check Network tab for API calls
- [ ] Verify API responses < 1 second
- [ ] Check for any slow endpoints
- [ ] Verify no unnecessary API calls

---

## Test Results Summary

**Date Tested:** _______________
**Tested By:** _______________
**Environment:** _______________

### Overall Results
- Total Tests: _____
- Passed: _____
- Failed: _____
- Blocked: _____

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Notes
