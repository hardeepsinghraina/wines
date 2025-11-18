// Admin authentication and authorization types for frontend

export interface AdminLoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface AdminAuthResponse {
  admin: {
    id: string
    email: string
    firstName: string
    lastName: string
    avatar?: string
    role: AdminRole
    permissions: AdminPermission[]
    mfaEnabled: boolean
  }
  accessToken: string
  sessionId: string
}

export interface MFAVerifyRequest {
  code: string
  sessionId: string
}

export interface MFASetupResponse {
  secret: string
  qrCodeUrl: string
  message: string
}

export interface MFASetupRequest {
  secret: string
  code: string
}

export enum AdminRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum AdminPermission {
  // Product Management
  PRODUCTS_VIEW = 'products:view',
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_EDIT = 'products:edit',
  PRODUCTS_DELETE = 'products:delete',
  PRODUCTS_BULK_IMPORT = 'products:bulk_import',
  INVENTORY_MANAGE = 'inventory:manage',

  // Order Management
  ORDERS_VIEW = 'orders:view',
  ORDERS_EDIT = 'orders:edit',
  ORDERS_CANCEL = 'orders:cancel',
  ORDERS_REFUND = 'orders:refund',
  ORDERS_FULFILL = 'orders:fulfill',

  // Customer Management
  CUSTOMERS_VIEW = 'customers:view',
  CUSTOMERS_EDIT = 'customers:edit',
  CUSTOMERS_DELETE = 'customers:delete',
  CUSTOMERS_SUPPORT = 'customers:support',

  // Analytics and Reporting
  ANALYTICS_VIEW = 'analytics:view',
  REPORTS_GENERATE = 'reports:generate',
  SALES_DATA_VIEW = 'sales_data:view',

  // System Administration
  ADMIN_USERS_MANAGE = 'admin_users:manage',
  SYSTEM_SETTINGS = 'system:settings',
  SECURITY_LOGS = 'security:logs',

  // NFT and Private Sales
  NFT_MANAGE = 'nft:manage',
  PRIVATE_SALES_MANAGE = 'private_sales:manage',

  // Financial
  PAYMENTS_VIEW = 'payments:view',
  PAYMENTS_REFUND = 'payments:refund',
  CRYPTO_TRANSACTIONS = 'crypto:transactions',

  // Content Management
  CONTENT_MANAGE = 'content:manage',
  PROMOTIONS_MANAGE = 'promotions:manage'
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: AdminRole
  permissions: AdminPermission[]
  mfaEnabled: boolean
}

export interface AdminAuthState {
  admin: AdminUser | null
  accessToken: string | null
  sessionId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresMFA: boolean
  mfaSessionId: string | null
}

export interface AdminLoginResponse {
  requiresMFA?: boolean
  sessionId?: string
  message?: string
  admin?: AdminUser
  accessToken?: string
}