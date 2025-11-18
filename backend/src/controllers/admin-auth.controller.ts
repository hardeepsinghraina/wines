import { Request, Response } from 'express'
import { adminAuthService } from '@/services/admin-auth.service'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'
import {
  AdminLoginRequest,
  MFAVerifyRequest,
  MFASetupRequest
} from '@/types/admin'

export class AdminAuthController {
  /**
   * Admin login
   */
  async login(req: Request, res: Response) {
    try {
      const loginData: AdminLoginRequest = req.body
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown'
      const userAgent = req.get('User-Agent') || 'unknown'

      const result = await adminAuthService.login(loginData, ipAddress, userAgent)

      if ('requiresMFA' in result) {
        return ResponseHelper.success(res, {
          requiresMFA: true,
          sessionId: result.sessionId,
          message: 'MFA verification required'
        })
      }

      // Set secure HTTP-only cookie for refresh token
      res.cookie('admin_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000 // 4 hours
      })

      return ResponseHelper.success(res, {
        admin: result.admin,
        accessToken: result.accessToken,
        sessionId: result.sessionId
      })
    } catch (error) {
      logger.error('Admin login controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res, 
        error instanceof Error ? error.message : 'Login failed',
        401,
        'LOGIN_FAILED'
      )
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(req: Request, res: Response) {
    try {
      const mfaData: MFAVerifyRequest = req.body
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown'
      const userAgent = req.get('User-Agent') || 'unknown'

      const result = await adminAuthService.verifyMFA(mfaData, ipAddress, userAgent)

      // Set secure HTTP-only cookie for refresh token
      res.cookie('admin_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000 // 4 hours
      })

      return ResponseHelper.success(res, {
        admin: result.admin,
        accessToken: result.accessToken,
        sessionId: result.sessionId
      })
    } catch (error) {
      logger.error('MFA verification controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'MFA verification failed',
        401,
        'MFA_VERIFICATION_FAILED'
      )
    }
  }

  /**
   * Setup MFA
   */
  async setupMFA(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const result = await adminAuthService.setupMFA(req.admin.id)

      return ResponseHelper.success(res, {
        secret: result.secret,
        qrCodeUrl: result.qrCodeUrl,
        message: 'Scan the QR code with your authenticator app and verify with a code'
      })
    } catch (error) {
      logger.error('MFA setup controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'MFA setup failed',
        500,
        'MFA_SETUP_FAILED'
      )
    }
  }

  /**
   * Confirm MFA setup
   */
  async confirmMFASetup(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const setupData: MFASetupRequest = req.body
      await adminAuthService.confirmMFASetup(req.admin.id, setupData)

      return ResponseHelper.success(res, {
        message: 'MFA has been successfully enabled for your account'
      })
    } catch (error) {
      logger.error('MFA confirmation controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'MFA confirmation failed',
        400,
        'MFA_CONFIRMATION_FAILED'
      )
    }
  }

  /**
   * Disable MFA
   */
  async disableMFA(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      await adminAuthService.disableMFA(req.admin.id)

      return ResponseHelper.success(res, {
        message: 'MFA has been disabled for your account'
      })
    } catch (error) {
      logger.error('MFA disable controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'MFA disable failed',
        500,
        'MFA_DISABLE_FAILED'
      )
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.admin_refresh_token || req.body.refreshToken

      if (!refreshToken) {
        return ResponseHelper.unauthorized(res, 'Refresh token required')
      }

      const result = await adminAuthService.refreshToken(refreshToken)

      // Update refresh token cookie
      res.cookie('admin_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000 // 4 hours
      })

      return ResponseHelper.success(res, {
        accessToken: result.accessToken
      })
    } catch (error) {
      logger.error('Token refresh controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'Token refresh failed',
        401,
        'TOKEN_REFRESH_FAILED'
      )
    }
  }

  /**
   * Logout admin
   */
  async logout(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown'
      const userAgent = req.get('User-Agent') || 'unknown'

      await adminAuthService.logout(req.admin.sessionId, req.admin.id, ipAddress, userAgent)

      // Clear refresh token cookie
      res.clearCookie('admin_refresh_token')

      return ResponseHelper.success(res, {
        message: 'Successfully logged out'
      })
    } catch (error) {
      logger.error('Admin logout controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'Logout failed',
        500,
        'LOGOUT_FAILED'
      )
    }
  }

  /**
   * Get current admin profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      return ResponseHelper.success(res, {
        admin: {
          id: req.admin.id,
          email: req.admin.email,
          role: req.admin.role,
          permissions: req.admin.permissions,
          mfaEnabled: req.admin.mfaVerified
        }
      })
    } catch (error) {
      logger.error('Get admin profile controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'Failed to fetch profile',
        500,
        'PROFILE_FETCH_FAILED'
      )
    }
  }

  /**
   * Get admin permissions
   */
  async getPermissions(req: Request, res: Response) {
    try {
      if (!req.admin) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      return ResponseHelper.success(res, {
        permissions: req.admin.permissions,
        role: req.admin.role
      })
    } catch (error) {
      logger.error('Get admin permissions controller error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.error(res,
        error instanceof Error ? error.message : 'Failed to fetch permissions',
        500,
        'PERMISSIONS_FETCH_FAILED'
      )
    }
  }
}

export const adminAuthController = new AdminAuthController()