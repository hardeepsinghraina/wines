// Admin authentication and authorization types

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
    role: AdminRole
    permissions: AdminPermission[]
    mfaEnabled: boolean
  }
  accessToken: string
  refreshToken: string
  sessionId: string
}

export interface AdminTokenPayload {
  userId: string
  email: string
  role: AdminRole
  permissions: AdminPermission[]
  sessionId: string
  mfaVerified: boolean
}

export interface MFASetupRequest {
  secret: string
  code: string
}

export interface MFAVerifyRequest {
  code: string
  sessionId: string
}

export interface AdminPermissionCheck {
  userId: string
  permission: AdminPermission
  resource?: string
}

export interface AdminSession {
  id: string
  userId: string
  sessionToken: string
  mfaVerified: boolean
  permissions: AdminPermission[]
  expiresAt: Date
  lastActivity: Date
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

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.ADMIN]: [
    AdminPermission.PRODUCTS_VIEW,
    AdminPermission.PRODUCTS_CREATE,
    AdminPermission.PRODUCTS_EDIT,
    AdminPermission.INVENTORY_MANAGE,
    AdminPermission.ORDERS_VIEW,
    AdminPermission.ORDERS_EDIT,
    AdminPermission.ORDERS_FULFILL,
    AdminPermission.CUSTOMERS_VIEW,
    AdminPermission.CUSTOMERS_SUPPORT,
    AdminPermission.ANALYTICS_VIEW,
    AdminPermission.REPORTS_GENERATE,
    AdminPermission.SALES_DATA_VIEW,
    AdminPermission.PAYMENTS_VIEW,
    AdminPermission.CONTENT_MANAGE,
    AdminPermission.PROMOTIONS_MANAGE
  ],
  [AdminRole.SUPER_ADMIN]: [
    ...Object.values(AdminPermission)
  ]
}

export interface AdminActivityLog {
  id: string
  adminId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
}