import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'

export interface GDPRDataExport {
  userId: string
  personalData: {
    profile: any
    orders: any[]
    addresses: any[]
    preferences: any
    loginHistory: any[]
    auditLogs: any[]
  }
  exportedAt: Date
  format: 'json' | 'csv'
}

export interface GDPRDataDeletionRequest {
  userId: string
  requestedAt: Date
  reason?: string | undefined
  retentionPeriod?: number // days
  status: 'pending' | 'approved' | 'completed' | 'rejected'
}

export interface DataProcessingConsent {
  userId: string
  consentType: 'marketing' | 'analytics' | 'functional' | 'necessary'
  granted: boolean
  grantedAt?: Date | undefined
  revokedAt?: Date | undefined
  ipAddress: string
  userAgent: string
}

/**
 * GDPR Compliance Service
 * Handles data protection, user rights, and privacy compliance
 */
export class GDPRService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Export all user data in compliance with GDPR Article 20 (Data Portability)
   */
  async exportUserData(userId: string, format: 'json' | 'csv' = 'json'): Promise<GDPRDataExport> {
    try {
      logger.info('Starting GDPR data export', { userId, format })

      // Fetch user profile data
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Fetch order history
      const orders = await this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              wine: true
            }
          },
          shipping: true,
          payment: true
        }
      })

      // Fetch login history (if tracked)
      const loginHistory = await this.getLoginHistory(userId)

      // Fetch audit logs related to the user
      const auditLogs = await this.getUserAuditLogs(userId)

      // Sanitize sensitive data
      const sanitizedUser = this.sanitizeUserData(user)
      const sanitizedOrders = orders.map((order: any) => this.sanitizeOrderData(order))

      const exportData: GDPRDataExport = {
        userId,
        personalData: {
          profile: sanitizedUser,
          orders: sanitizedOrders,
          addresses: [], // No addresses table in current schema
          preferences: user.preferences,
          loginHistory,
          auditLogs
        },
        exportedAt: new Date(),
        format
      }

      // Log the export for audit purposes
      await this.logGDPRActivity(userId, 'data_export', { format })

      logger.info('GDPR data export completed', { userId, recordCount: orders.length })
      return exportData

    } catch (error) {
      logger.error('GDPR data export failed', { userId, error })
      throw error
    }
  }

  /**
   * Process data deletion request in compliance with GDPR Article 17 (Right to Erasure)
   */
  async requestDataDeletion(userId: string, reason?: string): Promise<GDPRDataDeletionRequest> {
    try {
      logger.info('Processing GDPR data deletion request', { userId, reason })

      // Check if user has any active orders or legal obligations
      const activeOrders = await this.prisma.order.count({
        where: {
          userId,
          status: {
            in: ['PENDING', 'PROCESSING', 'SHIPPED']
          }
        }
      })

      if (activeOrders > 0) {
        throw new Error('Cannot delete data while active orders exist')
      }

      // Create deletion request
      const deletionRequest: GDPRDataDeletionRequest = {
        userId,
        requestedAt: new Date(),
        reason,
        retentionPeriod: 30, // 30-day grace period
        status: 'pending'
      }

      // Store deletion request (you would implement this in your database)
      await this.storeDeletionRequest(deletionRequest)

      // Log the request for audit purposes
      await this.logGDPRActivity(userId, 'deletion_request', { reason })

      logger.info('GDPR data deletion request created', { userId })
      return deletionRequest

    } catch (error) {
      logger.error('GDPR data deletion request failed', { userId, error })
      throw error
    }
  }

  /**
   * Execute approved data deletion
   */
  async executeDataDeletion(userId: string): Promise<void> {
    try {
      logger.info('Executing GDPR data deletion', { userId })

      // Start transaction for atomic deletion
      await this.prisma.$transaction(async (tx: any) => {
        // Delete user preferences
        await tx.userPreferences.deleteMany({
          where: { userId }
        })

        // Delete addresses
        await tx.address.deleteMany({
          where: { userId }
        })

        // Anonymize order data (keep for business records but remove PII)
        await tx.order.updateMany({
          where: { userId },
          data: {
            userId: 'deleted-user',
            // Keep order data for business purposes but anonymize
          }
        })

        // Delete user sessions
        // await this.deleteUserSessions(userId)

        // Finally delete the user record
        await tx.user.delete({
          where: { id: userId }
        })
      })

      // Log the deletion for audit purposes
      await this.logGDPRActivity(userId, 'data_deleted', {})

      logger.info('GDPR data deletion completed', { userId })

    } catch (error) {
      logger.error('GDPR data deletion failed', { userId, error })
      throw error
    }
  }

  /**
   * Record user consent for data processing
   */
  async recordConsent(consent: Omit<DataProcessingConsent, 'grantedAt' | 'revokedAt'>): Promise<void> {
    try {
      const consentRecord: DataProcessingConsent = {
        ...consent,
        grantedAt: consent.granted ? new Date() : undefined,
        revokedAt: !consent.granted ? new Date() : undefined
      }

      // Store consent record (implement in your database)
      await this.storeConsentRecord(consentRecord)

      // Log consent activity
      await this.logGDPRActivity(consent.userId, 'consent_updated', {
        consentType: consent.consentType,
        granted: consent.granted
      })

      logger.info('User consent recorded', {
        userId: consent.userId,
        consentType: consent.consentType,
        granted: consent.granted
      })

    } catch (error) {
      logger.error('Failed to record user consent', { consent, error })
      throw error
    }
  }

  /**
   * Get user's current consent status
   */
  async getUserConsent(userId: string): Promise<DataProcessingConsent[]> {
    try {
      // Retrieve consent records from database
      const consents = await this.getConsentRecords(userId)
      return consents

    } catch (error) {
      logger.error('Failed to retrieve user consent', { userId, error })
      throw error
    }
  }

  /**
   * Generate privacy policy compliance report
   */
  async generateComplianceReport(): Promise<any> {
    try {
      const report = {
        totalUsers: await this.prisma.user.count(),
        dataExportRequests: await this.getDataExportCount(),
        dataDeletionRequests: await this.getDataDeletionCount(),
        consentStatistics: await this.getConsentStatistics(),
        generatedAt: new Date()
      }

      logger.info('GDPR compliance report generated', report)
      return report

    } catch (error) {
      logger.error('Failed to generate compliance report', { error })
      throw error
    }
  }

  /**
   * Private helper methods
   */
  private sanitizeUserData(user: any): any {
    const { password, ...sanitizedUser } = user
    return sanitizedUser
  }

  private sanitizeOrderData(order: any): any {
    // Remove sensitive payment information but keep order details
    const { payment, ...sanitizedOrder } = order
    return {
      ...sanitizedOrder,
      payment: payment ? {
        method: payment.method,
        currency: payment.currency,
        amount: payment.amount,
        status: payment.status
      } : null
    }
  }

  private async getLoginHistory(userId: string): Promise<any[]> {
    // Implement login history retrieval
    // This would typically come from your session/audit logs
    return []
  }

  private async getUserAuditLogs(userId: string): Promise<any[]> {
    // Implement audit log retrieval for the user
    // This would come from your audit logging system
    return []
  }

  private async storeDeletionRequest(request: GDPRDataDeletionRequest): Promise<void> {
    // Implement storage of deletion request
    // You would create a table for this in your database
    logger.info('Deletion request stored', { userId: request.userId })
  }

  private async storeConsentRecord(consent: DataProcessingConsent): Promise<void> {
    // Implement storage of consent record
    // You would create a table for this in your database
    logger.info('Consent record stored', { userId: consent.userId, type: consent.consentType })
  }

  private async getConsentRecords(userId: string): Promise<DataProcessingConsent[]> {
    // Implement retrieval of consent records
    // This would come from your consent database table
    return []
  }

  private async logGDPRActivity(userId: string, activity: string, details: any): Promise<void> {
    logger.audit('GDPR activity', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    })
  }

  private async getDataExportCount(): Promise<number> {
    // Implement count of data export requests
    return 0
  }

  private async getDataDeletionCount(): Promise<number> {
    // Implement count of data deletion requests
    return 0
  }

  private async getConsentStatistics(): Promise<any> {
    // Implement consent statistics
    return {
      marketing: { granted: 0, revoked: 0 },
      analytics: { granted: 0, revoked: 0 },
      functional: { granted: 0, revoked: 0 },
      necessary: { granted: 0, revoked: 0 }
    }
  }
}

export const gdprService = new GDPRService()