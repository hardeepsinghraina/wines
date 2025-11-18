import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { redisService } from '@/services/redis.service'
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  TokenPayload,
  EmailVerificationToken,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth'

const prisma = new PrismaClient()

export class AuthService {
  private readonly JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
  private readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
  private readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m'
  private readonly JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  private readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes
  private readonly PASSWORD_RESET_EXPIRY = 60 * 60 * 1000 // 1 hour
  private readonly EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ user: any; verificationToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      })

      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, this.BCRYPT_ROUNDS)

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          emailVerified: false,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      })

      // Generate email verification token
      const verificationToken = await this.generateEmailVerificationToken(user.id, user.email)

      logger.info('User registered successfully', { userId: user.id, email: user.email })

      return { user, verificationToken }
    } catch (error) {
      logger.error('Registration failed', { error: error instanceof Error ? error.message : 'Unknown error', email: data.email })
      throw error
    }
  }

  /**
   * Login user with enhanced security
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      })

      if (!user || !user.isActive) {
        // Log failed login attempt
        await this.logFailedLoginAttempt(data.email, 'user_not_found')
        throw new Error('Invalid credentials')
      }

      // Check if account is locked
      const isLocked = await this.isAccountLocked(user.id)
      if (isLocked) {
        logger.warn('Login attempt on locked account', { userId: user.id, email: user.email })
        throw new Error('Account temporarily locked due to multiple failed login attempts')
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.incrementFailedLoginAttempts(user.id)
        await this.logFailedLoginAttempt(data.email, 'invalid_password')
        throw new Error('Invalid credentials')
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(user.id)

      // Create session
      const sessionId = await this.createUserSession(user.id)

      // Generate tokens
      const accessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      })

      const refreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
      })

      // Store refresh token in database
      await this.storeRefreshToken(user.id, sessionId, refreshToken)

      logger.info('User logged in successfully', { userId: user.id, email: user.email })

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        accessToken,
        refreshToken,
      }
    } catch (error) {
      logger.error('Login failed', { error: error instanceof Error ? error.message : 'Unknown error', email: data.email })
      throw error
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload

      // Check if session exists and is valid
      const session = await prisma.userSession.findUnique({
        where: {
          sessionToken: payload.sessionId,
          refreshToken,
        },
        include: { user: true },
      })

      if (!session || session.expiresAt < new Date() || !session.user.isActive) {
        throw new Error('Invalid refresh token')
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken({
        userId: session.userId,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.sessionToken,
      })

      const newRefreshToken = this.generateRefreshToken({
        userId: session.userId,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.sessionToken,
      })

      // Update refresh token in database
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })

      logger.info('Token refreshed successfully', { userId: session.userId })

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      logger.error('Token refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Logout user
   */
  async logout(sessionId: string): Promise<void> {
    try {
      await prisma.userSession.delete({
        where: { sessionToken: sessionId },
      })

      // Remove from Redis cache if exists
      await redisService.del(`session:${sessionId}`)

      logger.info('User logged out successfully', { sessionId })
    } catch (error) {
      logger.error('Logout failed', { error: error instanceof Error ? error.message : 'Unknown error', sessionId })
      throw error
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as EmailVerificationToken

      if (payload.type !== 'email_verification') {
        throw new Error('Invalid token type')
      }

      await prisma.user.update({
        where: { id: payload.userId },
        data: { emailVerified: true },
      })

      logger.info('Email verified successfully', { userId: payload.userId })
    } catch (error) {
      logger.error('Email verification failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Invalid or expired verification token')
    }
  }

  /**
   * Enhanced password reset with rate limiting
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<string> {
    try {
      // Check rate limiting for password reset requests
      const rateLimitKey = `password_reset_rate:${data.email}`
      const attempts = await redisService.get(rateLimitKey)

      if (attempts && parseInt(attempts) >= 3) {
        throw new Error('Too many password reset requests. Please try again later.')
      }

      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      })

      if (!user || !user.isActive) {
        // Still increment rate limit even for non-existent users to prevent enumeration
        await this.incrementPasswordResetAttempts(data.email)
        logger.info('Password reset requested for non-existent user', { email: data.email })
        return 'If an account exists, a reset link has been sent'
      }

      // Increment rate limit counter
      await this.incrementPasswordResetAttempts(data.email)

      const resetToken = await this.generatePasswordResetToken(user.id, user.email)

      // Store reset token with expiration
      const resetKey = `password_reset:${user.id}`
      await redisService.setex(
        resetKey,
        Math.ceil(this.PASSWORD_RESET_EXPIRY / 1000),
        resetToken
      )

      logger.info('Password reset token generated', { userId: user.id, email: user.email })

      return resetToken
    } catch (error) {
      logger.error('Forgot password failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  /**
   * Enhanced password reset with token validation
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const payload = jwt.verify(data.token, this.JWT_SECRET) as EmailVerificationToken

      if (payload.type !== 'password_reset') {
        throw new Error('Invalid token type')
      }

      // Verify token exists in Redis (not expired/used)
      const resetKey = `password_reset:${payload.userId}`
      const storedToken = await redisService.get(resetKey)

      if (!storedToken || storedToken !== data.token) {
        throw new Error('Invalid or expired reset token')
      }

      // Validate new password strength
      if (!this.isPasswordStrong(data.newPassword)) {
        throw new Error('Password does not meet security requirements')
      }

      const passwordHash = await bcrypt.hash(data.newPassword, this.BCRYPT_ROUNDS)

      await prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash },
      })

      // Invalidate all user sessions
      await prisma.userSession.deleteMany({
        where: { userId: payload.userId },
      })

      // Remove used reset token
      await redisService.del(resetKey)

      // Reset failed login attempts
      await this.resetFailedLoginAttempts(payload.userId)

      logger.info('Password reset successfully', { userId: payload.userId })
    } catch (error) {
      logger.error('Password reset failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error('Invalid or expired reset token')
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS)

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      })

      // Invalidate all other sessions except current one
      await prisma.userSession.deleteMany({
        where: {
          userId,
          // Keep current session active - this would need to be passed in
        },
      })

      logger.info('Password changed successfully', { userId })
    } catch (error) {
      logger.error('Password change failed', { error: error instanceof Error ? error.message : 'Unknown error', userId })
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: any) {
    try {
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { password, email, isActive, isEmailVerified, ...safeUpdateData } = updateData

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: safeUpdateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return updatedUser
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        throw new Error('User not found')
      }
      throw error
    }
  }

  /**
   * Enhanced token validation with additional security checks
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      // Verify token signature and expiration
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload

      // Check if session is still valid
      const session = await prisma.userSession.findUnique({
        where: { sessionToken: payload.sessionId },
        include: { user: true },
      })

      if (!session || session.expiresAt < new Date() || !session.user.isActive) {
        throw new Error('Session expired or invalid')
      }

      // Check if account is locked
      const isLocked = await this.isAccountLocked(session.userId)
      if (isLocked) {
        throw new Error('Account is locked')
      }

      // Update session activity
      await this.updateSessionActivity(session.sessionToken)

      return payload
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token')
      }
      throw error
    }
  }

  // Private helper methods

  /**
   * Check if account is locked due to failed login attempts
   */
  private async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const lockKey = `account_lock:${userId}`
      const lockData = await redisService.get(lockKey)

      if (!lockData) return false

      const { attempts, lockedUntil } = JSON.parse(lockData)

      if (attempts >= this.MAX_LOGIN_ATTEMPTS && Date.now() < lockedUntil) {
        return true
      }

      // Clean up expired lock
      if (Date.now() >= lockedUntil) {
        await redisService.del(lockKey)
      }

      return false
    } catch (error) {
      logger.error('Failed to check account lock status', { userId, error })
      return false
    }
  }

  /**
   * Increment failed login attempts
   */
  private async incrementFailedLoginAttempts(userId: string): Promise<void> {
    try {
      const lockKey = `account_lock:${userId}`
      const lockData = await redisService.get(lockKey)

      let attempts = 1
      let lockedUntil = 0

      if (lockData) {
        const parsed = JSON.parse(lockData)
        attempts = parsed.attempts + 1
      }

      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        lockedUntil = Date.now() + this.LOCKOUT_TIME
        logger.warn('Account locked due to failed login attempts', { userId, attempts })
      }

      await redisService.setex(
        lockKey,
        Math.ceil(this.LOCKOUT_TIME / 1000),
        JSON.stringify({ attempts, lockedUntil })
      )
    } catch (error) {
      logger.error('Failed to increment failed login attempts', { userId, error })
    }
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    try {
      const lockKey = `account_lock:${userId}`
      await redisService.del(lockKey)
    } catch (error) {
      logger.error('Failed to reset failed login attempts', { userId, error })
    }
  }

  /**
   * Log failed login attempt for security monitoring
   */
  private async logFailedLoginAttempt(email: string, reason: string): Promise<void> {
    try {
      const logKey = `failed_login:${email}:${Date.now()}`
      const logData = {
        email,
        reason,
        timestamp: new Date().toISOString(),
        ip: 'unknown' // This would be passed from the request context
      }

      await redisService.setex(logKey, 24 * 60 * 60, JSON.stringify(logData)) // Keep for 24 hours

      logger.warn('Failed login attempt', logData)
    } catch (error) {
      logger.error('Failed to log failed login attempt', { email, reason, error })
    }
  }

  /**
   * Update session activity timestamp
   */
  private async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      const activityKey = `session_activity:${sessionToken}`
      await redisService.setex(activityKey, 60 * 60, Date.now().toString()) // 1 hour TTL
    } catch (error) {
      logger.error('Failed to update session activity', { sessionToken, error })
    }
  }

  /**
   * Increment password reset attempts for rate limiting
   */
  private async incrementPasswordResetAttempts(email: string): Promise<void> {
    try {
      const rateLimitKey = `password_reset_rate:${email}`
      const current = await redisService.get(rateLimitKey)
      const attempts = current ? parseInt(current) + 1 : 1

      await redisService.setex(rateLimitKey, 60 * 60, attempts.toString()) // 1 hour TTL
    } catch (error) {
      logger.error('Failed to increment password reset attempts', { email, error })
    }
  }

  /**
   * Validate password strength
   */
  private isPasswordStrong(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strongPasswordRegex.test(password)
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: TokenPayload): string {
    return (jwt as any).sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN })
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return (jwt as any).sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: this.JWT_REFRESH_EXPIRES_IN })
  }

  /**
   * Generate email verification token
   */
  private async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    const payload: EmailVerificationToken = {
      userId,
      email,
      type: 'email_verification',
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '24h',
    })
  }

  /**
   * Generate password reset token
   */
  private async generatePasswordResetToken(userId: string, email: string): Promise<string> {
    const payload: EmailVerificationToken = {
      userId,
      email,
      type: 'password_reset',
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '1h',
    })
  }

  /**
   * Create user session
   */
  private async createUserSession(userId: string): Promise<string> {
    const sessionToken = this.generateSessionId()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        refreshToken: '', // Will be updated when refresh token is generated
        expiresAt,
      },
    })

    return sessionToken
  }

  /**
   * Store refresh token
   */
  private async storeRefreshToken(userId: string, sessionId: string, refreshToken: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: {
        userId,
        sessionToken: sessionId,
      },
      data: { refreshToken },
    })
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return (jwt as any).sign({ timestamp: Date.now(), random: Math.random() }, this.JWT_SECRET, { expiresIn: '7d' })
  }

  /**
   * Invalidate all sessions for a user (for security purposes)
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.userSession.deleteMany({
        where: { userId },
      })

      // Clear session activity from Redis
      const sessions = await prisma.userSession.findMany({
        where: { userId },
        select: { sessionToken: true },
      })

      for (const session of sessions) {
        await redisService.del(`session_activity:${session.sessionToken}`)
      }

      logger.info('All user sessions invalidated', { userId })
    } catch (error) {
      logger.error('Failed to invalidate user sessions', { userId, error })
      throw error
    }
  }
}

export const authService = new AuthService()