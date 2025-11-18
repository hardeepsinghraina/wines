import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { authService } from '@/services/auth.service'
import { ResponseHelper } from '@/utils/response'
import { logger } from '@/utils/logger'
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ChangePasswordRequest,
} from '@/types/auth'

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const data: RegisterRequest = req.body

      const { user, verificationToken } = await authService.register(data)

      // In a real application, you would send the verification email here
      // For now, we'll return the token in the response (development only)
      const isDevelopment = process.env.NODE_ENV === 'development'

      return ResponseHelper.created(res, {
        message: 'User registered successfully. Please check your email to verify your account.',
        user,
        ...(isDevelopment && { verificationToken }), // Only include in development
      })
    } catch (error) {
      logger.error('Registration failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      
      if (error instanceof Error && error.message === 'User already exists with this email') {
        return ResponseHelper.conflict(res, error.message)
      }
      
      return ResponseHelper.internalServerError(res, 'Registration failed')
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const data: LoginRequest = req.body

      const authResponse = await authService.login(data)

      return ResponseHelper.success(res, {
        message: 'Login successful',
        ...authResponse,
      })
    } catch (error) {
      logger.error('Login failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return ResponseHelper.unauthorized(res, 'Invalid email or password')
      }
      
      return ResponseHelper.internalServerError(res, 'Login failed')
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const { refreshToken }: RefreshTokenRequest = req.body

      const tokens = await authService.refreshToken(refreshToken)

      return ResponseHelper.success(res, {
        message: 'Token refreshed successfully',
        ...tokens,
      })
    } catch (error) {
      logger.error('Token refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.unauthorized(res, 'Invalid refresh token')
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const sessionId = req.sessionId

      if (!sessionId) {
        return ResponseHelper.badRequest(res, 'No active session found')
      }

      await authService.logout(sessionId)

      return ResponseHelper.success(res, {
        message: 'Logout successful',
      })
    } catch (error) {
      logger.error('Logout failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.internalServerError(res, 'Logout failed')
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const { token }: VerifyEmailRequest = req.body

      await authService.verifyEmail(token)

      return ResponseHelper.success(res, {
        message: 'Email verified successfully',
      })
    } catch (error) {
      logger.error('Email verification failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.badRequest(res, 'Invalid or expired verification token')
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const data: ForgotPasswordRequest = req.body

      const resetToken = await authService.forgotPassword(data)

      // In a real application, you would send the reset email here
      // For now, we'll return the token in the response (development only)
      const isDevelopment = process.env.NODE_ENV === 'development'

      return ResponseHelper.success(res, {
        message: 'If an account exists with this email, a password reset link has been sent.',
        ...(isDevelopment && { resetToken }), // Only include in development
      })
    } catch (error) {
      logger.error('Forgot password failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.internalServerError(res, 'Failed to process password reset request')
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const data: ResetPasswordRequest = req.body

      await authService.resetPassword(data)

      return ResponseHelper.success(res, {
        message: 'Password reset successfully',
      })
    } catch (error) {
      logger.error('Password reset failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.badRequest(res, 'Invalid or expired reset token')
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return ResponseHelper.badRequest(res, 'Validation failed', errors.array())
      }

      const userId = req.user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      const { currentPassword, newPassword }: ChangePasswordRequest = req.body

      await authService.changePassword(userId, currentPassword, newPassword)

      return ResponseHelper.success(res, {
        message: 'Password changed successfully',
      })
    } catch (error) {
      const userId = req.user?.id
      logger.error('Password change failed', { error: error instanceof Error ? error.message : 'Unknown error', userId })
      
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        return ResponseHelper.badRequest(res, error.message)
      }
      
      return ResponseHelper.internalServerError(res, 'Failed to change password')
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Authentication required')
      }

      // This would typically fetch full user profile from database
      // For now, return the user info from the token
      return ResponseHelper.success(res, {
        user: req.user,
      })
    } catch (error) {
      logger.error('Get profile failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.internalServerError(res, 'Failed to get user profile')
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.user

      if (!user) {
        return ResponseHelper.unauthorized(res, 'Not authenticated')
      }

      return ResponseHelper.success(res, {
        authenticated: true,
        user,
      })
    } catch (error) {
      logger.error('Auth check failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      return ResponseHelper.internalServerError(res, 'Failed to check authentication status')
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id
      if (!userId) {
        return ResponseHelper.unauthorized(res, 'Not authenticated')
      }

      const updateData = req.body
      const updatedUser = await authService.updateProfile(userId, updateData)

      return ResponseHelper.success(res, {
        message: 'Profile updated successfully',
        user: updatedUser,
      })
    } catch (error) {
      logger.error('Profile update failed', { 
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      
      if (error instanceof Error && error.message === 'User not found') {
        return ResponseHelper.notFound(res, error.message)
      }
      
      return ResponseHelper.internalServerError(res, 'Failed to update profile')
    }
  }
}

export const authController = new AuthController()