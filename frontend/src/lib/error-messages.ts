/**
 * Centralized error messages for consistent user communication
 * These messages are user-friendly and provide clear guidance
 */

export const ERROR_MESSAGES = {
  // Network errors
  network: 'Unable to connect. Please check your internet connection.',
  timeout: 'The request is taking longer than expected. Please try again.',
  offline: 'You are currently offline. Please check your internet connection.',
  
  // Server errors
  server: 'Something went wrong on our end. Please try again later.',
  maintenance: 'Our wine cellar is temporarily unavailable for maintenance. Please check back soon.',
  unavailable: 'This service is temporarily unavailable. Please try again in a few moments.',
  
  // Authentication errors
  auth: 'Please log in to continue.',
  authExpired: 'Your session has expired. Please log in again.',
  authInvalid: 'Invalid credentials. Please check your email and password.',
  authRequired: 'You need to sign in to access this feature.',
  unauthorized: 'You don\'t have permission to access this feature.',
  
  // Not found errors
  notfound: 'The page or resource you\'re looking for doesn\'t exist.',
  productNotFound: 'This wine is no longer available or doesn\'t exist.',
  orderNotFound: 'We couldn\'t find this order. Please check the order number.',
  userNotFound: 'User account not found.',
  
  // Validation errors
  validation: 'Please check your input and try again.',
  invalidEmail: 'Please enter a valid email address.',
  invalidPassword: 'Password must be at least 8 characters long.',
  requiredField: 'This field is required.',
  invalidFormat: 'Please enter a valid format.',
  
  // Cart errors
  cart: 'Unable to update cart. Your changes will be saved when connection is restored.',
  cartLoad: 'Failed to load your cart. Please try again.',
  cartAdd: 'Unable to add item to cart. Please try again.',
  cartRemove: 'Unable to remove item from cart. Please try again.',
  cartUpdate: 'Unable to update cart quantity. Please try again.',
  cartEmpty: 'Your cart is empty.',
  
  // Payment errors
  payment: 'Payment processing failed. Please try again or use a different payment method.',
  paymentDeclined: 'Your payment was declined. Please check your payment details or try a different method.',
  paymentTimeout: 'Payment processing timed out. Please check your order status before trying again.',
  insufficientFunds: 'Insufficient funds. Please use a different payment method.',
  
  // Checkout errors
  checkout: 'There was a problem processing your order. Your payment has not been charged.',
  checkoutValidation: 'Please complete all required fields before proceeding.',
  shippingError: 'Unable to calculate shipping. Please try again.',
  addressError: 'Please enter a valid shipping address.',
  
  // Product errors
  productLoad: 'Unable to load product information. Please try again.',
  productUnavailable: 'This product is currently unavailable.',
  outOfStock: 'This item is out of stock.',
  insufficientStock: 'Not enough stock available for the requested quantity.',
  
  // Search errors
  searchFailed: 'Search failed. Please try again.',
  noResults: 'No results found. Try different search terms.',
  
  // Order errors
  orderLoad: 'Unable to load order details. Please try again.',
  orderCancel: 'Unable to cancel order. Please contact support.',
  orderModify: 'Unable to modify order. Please contact support.',
  
  // Account errors
  accountLoad: 'Unable to load account information. Please try again.',
  accountUpdate: 'Unable to update account. Please try again.',
  passwordChange: 'Unable to change password. Please try again.',
  
  // File upload errors
  uploadFailed: 'File upload failed. Please try again.',
  uploadTooLarge: 'File is too large. Maximum size is 5MB.',
  uploadInvalidType: 'Invalid file type. Please upload an image.',
  
  // Rate limit errors
  rateLimit: 'You\'re making requests too quickly. Please wait a moment and try again.',
  rateLimitExceeded: 'Too many attempts. Please try again later.',
  
  // Generic errors
  unknown: 'An unexpected error occurred. Please try again.',
  tryAgain: 'Something went wrong. Please try again.',
  contactSupport: 'If the problem persists, please contact support.',
} as const;

export const RECOVERY_ACTIONS = {
  // Network recovery
  network: 'Check your internet connection and try again. If you\'re on a slow connection, please wait a moment and retry.',
  timeout: 'Please try again. If you\'re on a slow connection, the request might need more time.',
  offline: 'Please check your internet connection and try again when you\'re back online.',
  
  // Server recovery
  server: 'Please try again in a few moments. If the problem persists, contact support.',
  maintenance: 'Please check back in a few minutes. We\'ll be back shortly.',
  unavailable: 'Please wait a moment and try again. If the issue continues, contact support.',
  
  // Authentication recovery
  auth: 'Please sign in to your account. If you\'re already signed in, try refreshing the page.',
  authExpired: 'Please sign in again to continue.',
  authInvalid: 'Please check your credentials and try again. If you forgot your password, use the reset option.',
  unauthorized: 'Contact support if you believe you should have access to this feature.',
  
  // Not found recovery
  notfound: 'Check the URL and try again, or go back to the previous page.',
  productNotFound: 'Browse our collection to find other exceptional wines.',
  orderNotFound: 'Check your order confirmation email for the correct order number.',
  
  // Validation recovery
  validation: 'Review the highlighted fields and correct any errors before submitting.',
  invalidEmail: 'Please enter a valid email address in the format: name@example.com',
  invalidPassword: 'Please enter a password with at least 8 characters.',
  
  // Cart recovery
  cart: 'Your cart will be updated when your connection is restored. You can continue browsing.',
  cartLoad: 'Try refreshing the page or clearing your browser cache.',
  
  // Payment recovery
  payment: 'Please check your payment details and try again. If the problem persists, try a different payment method or contact your bank.',
  paymentDeclined: 'Please verify your payment information or try a different payment method.',
  paymentTimeout: 'Check your order history to see if the order was placed before trying again.',
  
  // Checkout recovery
  checkout: 'Please review your order details and try again. Your payment information has not been charged.',
  checkoutValidation: 'Please fill in all required fields marked with an asterisk (*).',
  
  // Product recovery
  productLoad: 'Try refreshing the page or browse our collection.',
  productUnavailable: 'Check back later or browse similar products.',
  outOfStock: 'Sign up for notifications when this item is back in stock.',
  
  // Search recovery
  searchFailed: 'Try again with different search terms or browse our categories.',
  noResults: 'Try broader search terms or browse our categories to discover wines.',
  
  // Order recovery
  orderLoad: 'Try refreshing the page or check your order confirmation email.',
  orderCancel: 'Please contact our support team for assistance with order cancellation.',
  
  // Account recovery
  accountLoad: 'Try refreshing the page or signing out and back in.',
  accountUpdate: 'Please check your information and try again.',
  
  // File upload recovery
  uploadFailed: 'Please try uploading the file again.',
  uploadTooLarge: 'Please reduce the file size or choose a different image.',
  uploadInvalidType: 'Please upload a valid image file (JPG, PNG, or GIF).',
  
  // Rate limit recovery
  rateLimit: 'Please wait a moment before trying again.',
  rateLimitExceeded: 'Please wait a few minutes before making another request.',
  
  // Generic recovery
  unknown: 'Please try again. If the problem persists, contact support.',
  tryAgain: 'Refresh the page and try again. If the issue continues, please contact support.',
} as const;

export const ERROR_TITLES = {
  network: 'Connection Problem',
  timeout: 'Request Timeout',
  offline: 'You\'re Offline',
  server: 'Server Error',
  maintenance: 'Under Maintenance',
  auth: 'Authentication Required',
  authExpired: 'Session Expired',
  unauthorized: 'Access Denied',
  notfound: 'Not Found',
  validation: 'Invalid Input',
  payment: 'Payment Error',
  cart: 'Cart Error',
  checkout: 'Checkout Error',
  product: 'Product Error',
  search: 'Search Error',
  order: 'Order Error',
  account: 'Account Error',
  upload: 'Upload Error',
  rateLimit: 'Too Many Requests',
  unknown: 'Error',
} as const;

// Helper function to get error message by key
export function getErrorMessage(key: keyof typeof ERROR_MESSAGES): string {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.unknown;
}

// Helper function to get recovery action by key
export function getRecoveryAction(key: keyof typeof RECOVERY_ACTIONS): string {
  return RECOVERY_ACTIONS[key] || RECOVERY_ACTIONS.unknown;
}

// Helper function to get error title by key
export function getErrorTitle(key: keyof typeof ERROR_TITLES): string {
  return ERROR_TITLES[key] || ERROR_TITLES.unknown;
}

// Context-specific error messages
export const CONTEXT_ERROR_MESSAGES = {
  'product-loading': {
    title: 'Unable to Load Product',
    message: 'We couldn\'t load the product information. Please check your connection and try again.',
    action: 'Try refreshing the page or browse our collection.'
  },
  'checkout': {
    title: 'Checkout Error',
    message: 'There was a problem processing your order. Your payment has not been charged.',
    action: 'Please review your order details and try again.'
  },
  'user-profile': {
    title: 'Profile Error',
    message: 'We couldn\'t load your profile information. Please try refreshing the page.',
    action: 'Try signing out and back in if the problem persists.'
  },
  'cart': {
    title: 'Cart Error',
    message: 'We couldn\'t update your cart. Please try again.',
    action: 'Your cart will be updated when your connection is restored.'
  },
  'search': {
    title: 'Search Error',
    message: 'We couldn\'t complete your search. Please try again.',
    action: 'Try different search terms or browse our categories.'
  },
  'payment': {
    title: 'Payment Error',
    message: 'There was a problem with the payment process. Please try again or contact support.',
    action: 'Check your payment details or try a different payment method.'
  },
  'order': {
    title: 'Order Error',
    message: 'We couldn\'t load your order details. Please try again.',
    action: 'Check your order confirmation email or contact support.'
  },
  'authentication': {
    title: 'Authentication Error',
    message: 'There was a problem with your authentication. Please sign in again.',
    action: 'Sign out and sign back in to refresh your session.'
  }
} as const;

export function getContextErrorMessage(context: keyof typeof CONTEXT_ERROR_MESSAGES) {
  return CONTEXT_ERROR_MESSAGES[context] || {
    title: ERROR_TITLES.unknown,
    message: ERROR_MESSAGES.unknown,
    action: RECOVERY_ACTIONS.unknown
  };
}
