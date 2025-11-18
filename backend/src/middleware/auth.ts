import { Request, Response, NextFunction } from 'express'
import { authService } from '@/services/auth.service'
import { ResponseHelper } from '@/utils/response'
import { logger } from '@/utils/logger'

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return ResponseHelper.unauthorized(res, 'Access token required')
    }

    const payload = await authService.verifyAccessToken(token)
    
    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    }
    req.sessionId = payload.sessionId

    next()
  } catch (error) {
    logger.error('Token authentication failed', { error: error instanceof Error ? error.message : 'Unknown error' })
    return ResponseHelper.unauthorized(res, 'Invalid or expired token')
  }
}

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required')
    }

    const userRole = req.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      return ResponseHelper.forbidden(res, 'Insufficient permissions')
    }

    next()
  }
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN'])

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = requireRole('SUPER_ADMIN')

/**
 * Middleware to check if user email is verified
 */
export const requireEmailVerified = (req: Request, res: Response, next: NextFunction) => {
  // This would need to be enhanced to check email verification status
  // For now, we'll assume it's handled in the token payload or separate check
  next()
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const payload = await authService.verifyAccessToken(token)
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      }
      req.sessionId = payload.sessionId
    } else {
      // Generate session ID for guest users
      if (req.session) {
        if (!req.session.id) {
          req.session.regenerate((err) => {
            if (err) {
              logger.error('Session regeneration failed', { error: err.message })
            }
          })
        }
        req.sessionId = req.session.id
      } else {
        // Fallback: generate a temporary session ID
        req.sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      }
    }

    next()
  } catch (error) {
    // Continue without authentication but still generate session ID
    if (req.session) {
      req.sessionId = req.session.id
    } else {
      req.sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }
    next()
  }
}