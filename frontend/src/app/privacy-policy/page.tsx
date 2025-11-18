import React from 'react'
import { Metadata } from 'next'
import LegalPolicyDisplay from '@/components/legal/LegalPolicyDisplay'

export const metadata: Metadata = {
  title: 'Privacy Policy | Luxury Wine Crypto E-commerce',
  description: 'Learn how we collect, use, and protect your personal information in compliance with GDPR and other privacy regulations.',
  keywords: 'privacy policy, data protection, GDPR, personal information, cookies',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <LegalPolicyDisplay policyType="privacy-policy" />
      </div>
    </div>
  )
}