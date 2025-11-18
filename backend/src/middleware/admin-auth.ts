import { Request, Response, NextFunction } from 'express'
import { adminAuthService } from '@/services/admin-auth.service'
import { AdminPermission, AdminRole } from '@/types/admin'
import { logger } from '@/utils/logger'

// Extend Express Request type to include admin user
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string
        email: string
        role: AdminRole
        permissions: AdminPermission[]
        sessionId: string
        mfaVerified: boolean
      }
    }
  }
}

/**
 * Middleware to authenticate admin users
 */
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      })
      return
    }

    const token = authHeader.substring(7)
    const payload = await adminAuthService.verifyAccessToken(token)

    // Attach admin info to request
    req.admin = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
      mfaVerified: payload.mfaVerified
    }

    next()
  } catch (error) {
    logger.error('Admin authentication failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path
    })

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    })
  }
}

/**
 * Middleware to check if admin has specific permission
 */
export const requirePermission = (permission: AdminPermission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
      return
    }

    const hasPermission = adminAuthService.hasPermission(req.admin.role, permission)
    if (!hasPermission) {
      logger.warn('Admin permission denied', {
        adminId: req.admin.id,
        role: req.admin.role,
        requiredPermission: permission,
        path: req.path
      })

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      })
      return
    }

    next()
  }
}

/**
 * Middleware to check if admin has any of the specified permissions
 */
export const requireAnyPermission = (permissions: AdminPermission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      })
      return
    }

    const hasAnyPermission = permissions.some(permission => 
      adminAuthService.hasPermission(req.admin!.role, permission)
    )

    if (!hasAnyPermission) {
      logger.warn('Admin permission denied', {
        adminId: req.admin.id,
        role: req.admin.role,
        requiredPermissions: permissions,
        path: req.path
      })

      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      })
      return
    }

    next()
  }
}

/**
 * Middleware to require super admin role
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    })
    return
  }

  if (req.admin.role !== AdminRole.SUPER_ADMIN) {
    logger.warn('Super admin access denied', {
      adminId: req.admin.id,
      role: req.admin.role,
      path: req.path
    })

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Super admin access required'
      }
    })
    return
  }

  next()
}

/**
 * Middleware to require MFA verification for sensitive operations
 */
export const requireMFA = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    })
    return
  }

  if (!req.admin.mfaVerified) {
    res.status(403).json({
      success: false,
      error: {
        code: 'MFA_REQUIRED',
        message: 'Multi-factor authentication required for this operation'
      }
    })
    return
  }

  next()
}

/**
 * Middleware to log admin actions
 */
export const logAdminAction = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.admin) {
      // Log the action after the request completes
      const originalSend = res.send
      res.send = function(data) {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logger.info('Admin action performed', {
            adminId: req.admin!.id,
            action,
            resource,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          })
        }
        return originalSend.call(this, data)
      }
    }
    next()
  }
}