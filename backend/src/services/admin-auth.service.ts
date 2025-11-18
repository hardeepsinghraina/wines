import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { redisService } from '@/services/redis.service'
import {
  AdminLoginRequest,
  AdminAuthResponse,
  AdminTokenPayload,
  MFASetupRequest,
  MFAVerifyRequest,
  AdminRole,
  AdminPermission,
  ROLE_PERMISSIONS,
  AdminSession,
  AdminActivityLog
} from '@/types/admin'

const prisma = new PrismaClient()

export class AdminAuthService {
  private readonly JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
  private readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
  private readonly JWT_EXPIRES_IN = '30m' // Shorter for admin sessions
  private readonly JWT_REFRESH_EXPIRES_IN = '4h' // Shorter refresh for admin
  private readonly MFA_WINDOW = 2 // Allow 2 time windows for MFA codes

  /**
   * Admin login with optional MFA
   */
  async login(data: AdminLoginRequest, ipAddress: string, userAgent: string): Promise<AdminAuthResponse | { requiresMFA: true; sessionId: string }> {
    try {
      // Find admin user
      const user = await prisma.user.findUnique({
        where: { 
          email: data.email.toLowerCase(),
          role: { in: ['ADMIN', 'SUPER_ADMIN'] }
        },
      })

      if (!user || !user.isActive) {
        await this.logActivity('LOGIN_FAILED', 'auth', undefined, { email: data.email, reason: 'invalid_credentials' }, ipAddress, userAgent)
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)
      if (!isPasswordValid) {
        await this.logActivity('LOGIN_FAILED', 'auth', user.id, { reason: 'invalid_password' }, ipAddress, userAgent)
        throw new Error('Invalid credentials')
      }

      // Check if MFA is enabled
      const mfaSecret = await this.getMFASecret(user.id)
      if (mfaSecret && !data.mfaCode) {
        // Create temporary session for MFA verification
        const tempSessionId = await this.createTempSession(user.id, ipAddress, userAgent)
        return { requiresMFA: true, sessionId: tempSessionId }
      }

      // Verify MFA if provided
      if (mfaSecret && data.mfaCode) {
        const isMFAValid = speakeasy.totp.verify({
          secret: mfaSecret,
          encoding: 'base32',
          token: data.mfaCode,
          window: this.MFA_WINDOW
        })

        if (!isMFAValid) {
          await this.logActivity('MFA_FAILED', 'auth', user.id, { reason: 'invalid_mfa_code' }, ipAddress, userAgent)
          throw new Error('Invalid MFA code')
        }
      }

      // Create admin session
      const sessionId = await this.createAdminSession(user.id, true, ipAddress, userAgent)
      const permissions = this.getUserPermissions(user.role as AdminRole)

      // Generate tokens
      const accessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role as AdminRole,
        permissions,
        sessionId,
        mfaVerified: !!mfaSecret
      })

      const refreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role as AdminRole,
        permissions,
        sessionId,
        mfaVerified: !!mfaSecret
      })

      // Store refresh token
      await this.storeRefreshToken(sessionId, refreshToken)

      await this.logActivity('LOGIN_SUCCESS', 'auth', user.id, { mfa_used: !!mfaSecret }, ipAddress, userAgent)

      logger.info('Admin logged in successfully', { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        mfaUsed: !!mfaSecret 
      })

      return {
        admin: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as AdminRole,
          permissions,
          mfaEnabled: !!mfaSecret
        },
        accessToken,
        refreshToken,
        sessionId
      }
    } catch (error) {
      logger.error('Admin login failed', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        email: data.email 
      })
      throw error
    }
  }

  /**
   * Verify MFA for temporary session
   */
  async verifyMFA(data: MFAVerifyRequest, ipAddress: string, userAgent: string): Promise<AdminAuthResponse> {
    try {
      // Get temporary session
      const tempSession = await redisService.get(`temp_session:${data.sessionId}`)
      if (!tempSession) {
        throw new Error('Invalid or expired session')
      }

      const sessionData = JSON.parse(tempSession)
      const user = await prisma.user.findUnique({
        where: { id: sessionData.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify MFA
      const mfaSecret = await this.getMFASecret(user.id)
      if (!mfaSecret) {
        throw new Error('MFA not enabled')
      }

      const isMFAValid = speakeasy.totp.verify({
        secret: mfaSecret,
        encoding: 'base32',
        token: data.code,
        window: this.MFA_WINDOW
      })

      if (!isMFAValid) {
        await this.logActivity('MFA_FAILED', 'auth', user.id, { reason: 'invalid_mfa_code' }, ipAddress, userAgent)
        throw new Error('Invalid MFA code')
      }

      // Remove temporary session
      await redisService.del(`temp_session:${data.sessionId}`)

      // Create full admin session
      const sessionId = await this.createAdminSession(user.id, true, ipAddress, userAgent)
      const permissions = this.getUserPermissions(user.role as AdminRole)

      // Generate tokens
      const accessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role as AdminRole,
        permissions,
        sessionId,
        mfaVerified: true
      })

      const refreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role as AdminRole,
        permissions,
        sessionId,
        mfaVerified: true
      })

      await this.storeRefreshToken(sessionId, refreshToken)
      await this.logActivity('MFA_SUCCESS', 'auth', user.id, {}, ipAddress, userAgent)

      return {
        admin: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as AdminRole,
          permissions,
          mfaEnabled: true
        },
        accessToken,
        refreshToken,
        sessionId
      }
    } catch (error) {
      logger.error('MFA verification failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: data.sessionId
      })
      throw error
    }
  }

  /**
   * Setup MFA for admin user
   */
  async setupMFA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Generate MFA secret
      const secret = speakeasy.generateSecret({
        name: `Wine Admin (${user.email})`,
        issuer: 'Luxury Wine Platform'
      })

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!)

      // Store secret temporarily (will be confirmed when user verifies)
      await redisService.setex(`mfa_setup:${userId}`, 300, secret.base32) // 5 minutes

      await this.logActivity('MFA_SETUP_INITIATED', 'security', userId, {}, '', '')

      return {
        secret: secret.base32,
        qrCodeUrl
      }
    } catch (error) {
      logger.error('MFA setup failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      throw error
    }
  }

  /**
   * Confirm MFA setup
   */
  async confirmMFASetup(userId: string, data: MFASetupRequest): Promise<void> {
    try {
      // Get temporary secret
      const tempSecret = await redisService.get(`mfa_setup:${userId}`)
      if (!tempSecret || tempSecret !== data.secret) {
        throw new Error('Invalid setup session')
      }

      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: data.secret,
        encoding: 'base32',
        token: data.code,
        window: this.MFA_WINDOW
      })

      if (!isValid) {
        throw new Error('Invalid MFA code')
      }

      // Store MFA secret permanently
      await redisService.set(`mfa_secret:${userId}`, data.secret)
      await redisService.del(`mfa_setup:${userId}`)

      await this.logActivity('MFA_ENABLED', 'security', userId, {}, '', '')

      logger.info('MFA enabled for admin user', { userId })
    } catch (error) {
      logger.error('MFA confirmation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      throw error
    }
  }

  /**
   * Disable MFA
   */
  async disableMFA(userId: string): Promise<void> {
    try {
      await redisService.del(`mfa_secret:${userId}`)
      await this.logActivity('MFA_DISABLED', 'security', userId, {}, '', '')
      
      logger.info('MFA disabled for admin user', { userId })
    } catch (error) {
      logger.error('MFA disable failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      throw error
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(userRole: AdminRole, permission: AdminPermission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || []
    return permissions.includes(permission)
  }

  /**
   * Get all permissions for a role
   */
  getUserPermissions(role: AdminRole): AdminPermission[] {
    return ROLE_PERMISSIONS[role] || []
  }

  /**
   * Verify admin access token
   */
  async verifyAccessToken(token: string): Promise<AdminTokenPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as AdminTokenPayload
      
      // Check if session is still valid
      const session = await redisService.get(`admin_session:${payload.sessionId}`)
      if (!session) {
        throw new Error('Session expired')
      }

      const sessionData: AdminSession = JSON.parse(session)
      if (sessionData.expiresAt < new Date()) {
        throw new Error('Session expired')
      }

      // Update last activity
      sessionData.lastActivity = new Date()
      await redisService.setex(`admin_session:${payload.sessionId}`, 4 * 60 * 60, JSON.stringify(sessionData)) // 4 hours

      return payload
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  /**
   * Refresh admin tokens
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as AdminTokenPayload

      // Check if session exists
      const session = await redisService.get(`admin_session:${payload.sessionId}`)
      if (!session) {
        throw new Error('Invalid session')
      }

      const sessionData: AdminSession = JSON.parse(session)
      if (sessionData.expiresAt < new Date()) {
        throw new Error('Session expired')
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(payload)
      const newRefreshToken = this.generateRefreshToken(payload)

      // Update session with new refresh token
      await this.storeRefreshToken(payload.sessionId, newRefreshToken)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Logout admin
   */
  async logout(sessionId: string, userId: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      await redisService.del(`admin_session:${sessionId}`)
      await this.logActivity('LOGOUT', 'auth', userId, {}, ipAddress, userAgent)
      
      logger.info('Admin logged out', { sessionId, userId })
    } catch (error) {
      logger.error('Admin logout failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId
      })
      throw error
    }
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: AdminTokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    })
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: AdminTokenPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    })
  }

  /**
   * Create admin session
   */
  private async createAdminSession(userId: string, mfaVerified: boolean, ipAddress: string, userAgent: string): Promise<string> {
    const sessionId = this.generateSessionId()
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    const session: AdminSession = {
      id: sessionId,
      userId,
      sessionToken: sessionId,
      mfaVerified,
      permissions: this.getUserPermissions(user!.role as AdminRole),
      expiresAt,
      lastActivity: new Date()
    }

    await redisService.setex(`admin_session:${sessionId}`, 4 * 60 * 60, JSON.stringify(session))

    return sessionId
  }

  /**
   * Create temporary session for MFA
   */
  private async createTempSession(userId: string, ipAddress: string, userAgent: string): Promise<string> {
    const sessionId = this.generateSessionId()
    const sessionData = {
      userId,
      ipAddress,
      userAgent,
      createdAt: new Date()
    }

    await redisService.setex(`temp_session:${sessionId}`, 300, JSON.stringify(sessionData)) // 5 minutes

    return sessionId
  }

  /**
   * Store refresh token
   */
  private async storeRefreshToken(sessionId: string, refreshToken: string): Promise<void> {
    await redisService.setex(`refresh_token:${sessionId}`, 4 * 60 * 60, refreshToken) // 4 hours
  }

  /**
   * Get MFA secret
   */
  private async getMFASecret(userId: string): Promise<string | null> {
    return await redisService.get(`mfa_secret:${userId}`)
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return jwt.sign({ 
      timestamp: Date.now(), 
      random: Math.random(),
      type: 'admin_session'
    }, this.JWT_SECRET, { expiresIn: '4h' })
  }

  /**
   * Log admin activity
   */
  private async logActivity(
    action: string, 
    resource: string, 
    adminId?: string, 
    details: Record<string, any> = {}, 
    ipAddress: string = '', 
    userAgent: string = ''
  ): Promise<void> {
    try {
      const logEntry: AdminActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        adminId: adminId || 'unknown',
        action,
        resource,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date()
      }

      // Store in Redis for recent activity (last 24 hours)
      await redisService.lpush('admin_activity_logs', JSON.stringify(logEntry))
      await redisService.ltrim('admin_activity_logs', 0, 999) // Keep last 1000 entries
      await redisService.expire('admin_activity_logs', 24 * 60 * 60) // 24 hours

      logger.info('Admin activity logged', { action, resource, adminId })
    } catch (error) {
      logger.error('Failed to log admin activity', { error })
    }
  }
}

export const adminAuthService = new AdminAuthService()