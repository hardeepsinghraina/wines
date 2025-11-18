'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'

interface PolicyContent {
  title: string
  lastUpdated: string
  version: string
  content: any
}

interface LegalPolicyDisplayProps {
  policyType: 'privacy-policy' | 'terms-of-service' | 'cookie-policy'
  className?: string
}

export const LegalPolicyDisplay: React.FC<LegalPolicyDisplayProps> = ({
  policyType,
  className = ''
}) => {
  const [policy, setPolicy] = useState<PolicyContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPolicy()
  }, [policyType])

  const loadPolicy = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use static policy content for now since backend has compilation issues
      const staticPolicies = getStaticPolicyContent(policyType)
      setPolicy(staticPolicies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policy')
    } finally {
      setLoading(false)
    }
  }

  const getStaticPolicyContent = (type: string): PolicyContent => {
    const policies = {
      'privacy-policy': {
        title: 'Privacy Policy',
        lastUpdated: '2024-01-01',
        version: '1.0',
        content: {
          introduction: 'This Privacy Policy describes how Luxury Wine Collection collects, uses, and protects your personal information.',
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
            address: 'Data Protection Officer, Luxury Wine Collection'
          }
        }
      },
      'terms-of-service': {
        title: 'Terms of Service',
        lastUpdated: '2024-01-01',
        version: '1.0',
        content: {
          introduction: 'These Terms of Service govern your use of the Luxury Wine Collection platform.',
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
            address: 'Legal Department, Luxury Wine Collection'
          }
        }
      },
      'cookie-policy': {
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
    }

    return policies[type as keyof typeof policies] || policies['privacy-policy']
  }

  const renderPolicyContent = (content: any, level: number = 0) => {
    if (!content) return null

    return Object.entries(content).map(([key, value]) => {
      if (typeof value === 'string') {
        return (
          <div key={key} className="mb-4">
            <p className="text-gray-700 leading-relaxed">{value}</p>
          </div>
        )
      }

      if (typeof value === 'object' && value !== null) {
        const obj = value as any
        
        if (obj.title && obj.content) {
          return (
            <div key={key} className="mb-6">
              <h3 className={`font-semibold text-gray-900 mb-3 ${
                level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-base'
              }`}>
                {obj.title}
              </h3>
              {typeof obj.content === 'string' ? (
                <p className="text-gray-700 leading-relaxed">{obj.content}</p>
              ) : (
                renderPolicyContent(obj.content, level + 1)
              )}
            </div>
          )
        }

        if (obj.title && obj.items && Array.isArray(obj.items)) {
          return (
            <div key={key} className="mb-6">
              <h3 className={`font-semibold text-gray-900 mb-3 ${
                level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-base'
              }`}>
                {obj.title}
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {obj.items.map((item: string, index: number) => (
                  <li key={index} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )
        }

        if (obj.title && obj.description) {
          return (
            <div key={key} className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{obj.title}</h4>
              <p className="text-gray-700 leading-relaxed">{obj.description}</p>
              {obj.examples && Array.isArray(obj.examples) && (
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-gray-600">
                  {obj.examples.map((example: string, index: number) => (
                    <li key={index} className="text-sm">{example}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        }

        if (obj.email || obj.address) {
          return (
            <div key={key} className="mb-6">
              {obj.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{obj.title}</h3>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                {obj.email && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${obj.email}`} className="text-burgundy hover:underline">
                      {obj.email}
                    </a>
                  </p>
                )}
                {obj.address && (
                  <p className="text-gray-700">
                    <span className="font-medium">Address:</span> {obj.address}
                  </p>
                )}
              </div>
            </div>
          )
        }

        return (
          <div key={key} className="mb-6">
            {renderPolicyContent(value, level + 1)}
          </div>
        )
      }

      return null
    })
  }

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <Loading />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load policy</p>
          <button
            onClick={loadPolicy}
            className="text-burgundy hover:underline"
          >
            Try again
          </button>
        </div>
      </Card>
    )
  }

  if (!policy) {
    return (
      <Card className={`p-8 ${className}`}>
        <p className="text-gray-600 text-center">Policy not found</p>
      </Card>
    )
  }

  return (
    <Card className={`p-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{policy.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
            <span>Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
            <span className="hidden sm:inline">•</span>
            <span>Version {policy.version}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          {renderPolicyContent(policy.content)}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If you have any questions about this policy, please contact us at{' '}
            <a href="mailto:legal@luxurywine.com" className="text-burgundy hover:underline">
              legal@luxurywine.com
            </a>
          </p>
        </div>
      </div>
    </Card>
  )
}

export default LegalPolicyDisplay