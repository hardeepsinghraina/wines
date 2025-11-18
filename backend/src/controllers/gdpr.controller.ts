import { Request, Response } from 'express'
import { gdprService } from '@/services/gdpr.service'
import { ResponseHelper } from '@/utils/response'
import { logger } from '@/utils/logger'
import { AuthenticatedRequest } from '@/types/express'

/**
 * GDPR Controller
 * Handles data protection and privacy compliance endpoints
 */
class GDPRController {
  /**
   * Export user's personal data
   */
  async exportUserData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id
      const format = (req.query.format as 'json' | 'csv') || 'json'

      const exportData = await gdprService.exportUserData(userId, format)

      // Set appropriate headers for file download
      const filename = `user-data-export-${userId}-${Date.now()}.${format}`
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv')

      if (format === 'json') {
        ResponseHelper.success(res, exportData, 200)
      } else {
        // Convert to CSV format
        const csvData = this.convertToCSV(exportData)
        res.send(csvData)
      }

    } catch (error) {
      logger.error('Data export failed:', { error, userId: req.user.id })
      ResponseHelper.error(res, 'Failed to export user data', 500)
    }
  }

  /**
   * Request deletion of user's personal data
   */
  async requestDataDeletion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id
      const { reason } = req.body

      const deletionRequest = await gdprService.requestDataDeletion(userId, reason)

      ResponseHelper.success(res, deletionRequest, 200)

    } catch (error) {
      logger.error('Data deletion request failed:', { error, userId: req.user.id })
      
      if (error instanceof Error && error.message.includes('active orders')) {
        ResponseHelper.error(res, 'Cannot delete data while you have active orders', 400)
      } else {
        ResponseHelper.error(res, 'Failed to process deletion request', 500)
      }
    }
  }

  /**
   * Get user's current consent status
   */
  async getUserConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id
      const consents = await gdprService.getUserConsent(userId)

      ResponseHelper.success(res, consents, 200)

    } catch (error) {
      logger.error('Failed to retrieve user consent:', { error, userId: req.user.id })
      ResponseHelper.error(res, 'Failed to retrieve consent information', 500)
    }
  }

  /**
   * Update user's consent preferences
   */
  async updateConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id
      const { consentType, granted } = req.body
      const ipAddress = this.getClientIP(req)
      const userAgent = req.get('User-Agent') || 'unknown'

      await gdprService.recordConsent({
        userId,
        consentType,
        granted,
        ipAddress,
        userAgent
      })

      ResponseHelper.success(res, null, 200)

    } catch (error) {
      logger.error('Failed to update consent:', { error, userId: req.user.id })
      ResponseHelper.error(res, 'Failed to update consent preferences', 500)
    }
  }

  /**
   * Get current privacy policy
   */
  async getPrivacyPolicy(req: Request, res: Response): Promise<void> {
    try {
      const privacyPolicy = {
        title: 'Privacy Policy',
        lastUpdated: '2024-01-01',
        version: '1.0',
        content: {
          introduction: 'This Privacy Policy describes how Luxury Wine Crypto E-commerce collects, uses, and protects your personal information.',
          dataCollection: {
            title: 'Data We Collect',
            items: [
              'Personal identification information (name, email, address)',
              'Payment information (processed securely through third-party providers)',
              'Order history and preferences',
              'Website usage data and cookies',
              'Communication preferences'
            ]
          },
          dataUsage: {
            title: 'How We Use Your Data',
            items: [
              'Process and fulfill your orders',
              'Provide customer support',
              'Send order updates and notifications',
              'Improve our services and user experience',
              'Comply with legal obligations'
            ]
          },
          dataSharing: {
            title: 'Data Sharing',
            content: 'We do not sell your personal data. We may share data with trusted service providers for order fulfillment, payment processing, and shipping.'
          },
          userRights: {
            title: 'Your Rights Under GDPR',
            items: [
              'Right to access your personal data',
              'Right to rectify inaccurate data',
              'Right to erase your data (right to be forgotten)',
              'Right to restrict processing',
              'Right to data portability',
              'Right to object to processing',
              'Right to withdraw consent'
            ]
          },
          cookies: {
            title: 'Cookies and Tracking',
            content: 'We use cookies to enhance your browsing experience. You can manage cookie preferences through our cookie consent banner.'
          },
          contact: {
            title: 'Contact Information',
            email: 'privacy@luxurywine.com',
            address: 'Data Protection Officer, Luxury Wine Crypto E-commerce'
          }
        }
      }

      ResponseHelper.success(res, privacyPolicy, 200)

    } catch (error) {
      logger.error('Failed to retrieve privacy policy:', { error })
      ResponseHelper.error(res, 'Failed to retrieve privacy policy', 500)
    }
  }

  /**
   * Get current terms of service
   */
  async getTermsOfService(req: Request, res: Response): Promise<void> {
    try {
      const termsOfService = {
        title: 'Terms of Service',
        lastUpdated: '2024-01-01',
        version: '1.0',
        content: {
          introduction: 'These Terms of Service govern your use of the Luxury Wine Crypto E-commerce platform.',
          acceptance: 'By using our service, you agree to these terms and conditions.',
          services: {
            title: 'Our Services',
            content: 'We provide a platform for purchasing premium wines using cryptocurrency and traditional payment methods.'
          },
          userResponsibilities: {
            title: 'User Responsibilities',
            items: [
              'Provide accurate and complete information',
              'Maintain the security of your account',
              'Comply with applicable laws and regulations',
              'Use the service only for lawful purposes'
            ]
          },
          payments: {
            title: 'Payments and Refunds',
            content: 'We accept various cryptocurrencies and traditional payment methods. Refund policy applies as per our refund terms.'
          },
          shipping: {
            title: 'Shipping and Delivery',
            content: 'We ship globally with various delivery options. Shipping costs and delivery times vary by location.'
          },
          liability: {
            title: 'Limitation of Liability',
            content: 'Our liability is limited to the maximum extent permitted by law.'
          },
          termination: {
            title: 'Account Termination',
            content: 'We reserve the right to terminate accounts that violate these terms.'
          },
          changes: {
            title: 'Changes to Terms',
            content: 'We may update these terms from time to time. Continued use constitutes acceptance of updated terms.'
          },
          contact: {
            title: 'Contact Information',
            email: 'legal@luxurywine.com',
            address: 'Legal Department, Luxury Wine Crypto E-commerce'
          }
        }
      }

      ResponseHelper.success(res, termsOfService, 200)

    } catch (error) {
      logger.error('Failed to retrieve terms of service:', { error })
      ResponseHelper.error(res, 'Failed to retrieve terms of service', 500)
    }
  }

  /**
   * Get current cookie policy
   */
  async getCookiePolicy(req: Request, res: Response): Promise<void> {
    try {
      const cookiePolicy = {
        title: 'Cookie Policy',
        lastUpdated: '2024-01-01',
        version: '1.0',
        content: {
          introduction: 'This Cookie Policy explains how we use cookies and similar technologies.',
          whatAreCookies: {
            title: 'What Are Cookies',
            content: 'Cookies are small text files stored on your device when you visit our website.'
          },
          cookieTypes: {
            title: 'Types of Cookies We Use',
            necessary: {
              title: 'Necessary Cookies',
              description: 'Essential for the website to function properly',
              examples: ['Authentication', 'Shopping cart', 'Security']
            },
            functional: {
              title: 'Functional Cookies',
              description: 'Enhance your experience with personalized features',
              examples: ['Language preferences', 'User interface settings']
            },
            analytics: {
              title: 'Analytics Cookies',
              description: 'Help us understand how visitors use our website',
              examples: ['Google Analytics', 'Performance monitoring']
            },
            marketing: {
              title: 'Marketing Cookies',
              description: 'Used to deliver relevant advertisements',
              examples: ['Advertising networks', 'Social media integration']
            }
          },
          cookieManagement: {
            title: 'Managing Cookies',
            content: 'You can control cookies through your browser settings or our cookie consent banner.'
          },
          thirdParty: {
            title: 'Third-Party Cookies',
            content: 'Some cookies are set by third-party services we use, such as payment processors and analytics providers.'
          },
          contact: {
            title: 'Contact Information',
            email: 'privacy@luxurywine.com'
          }
        }
      }

      ResponseHelper.success(res, cookiePolicy, 200)

    } catch (error) {
      logger.error('Failed to retrieve cookie policy:', { error })
      ResponseHelper.error(res, 'Failed to retrieve cookie policy', 500)
    }
  }

  /**
   * Helper methods
   */
  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const headers = Object.keys(data.personalData)
    const csvRows = [headers.join(',')]

    // Add data rows (simplified implementation)
    csvRows.push(`"${data.userId}","${data.exportedAt}","${JSON.stringify(data.personalData).replace(/"/g, '""')}"`)

    return csvRows.join('\n')
  }

  private getClientIP(req: Request): string {
    const ip = (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    )
    const ipString = String(ip || 'unknown')
    return ipString.split(',')[0]?.trim() || 'unknown'
  }
}

export const gdprController = new GDPRController()