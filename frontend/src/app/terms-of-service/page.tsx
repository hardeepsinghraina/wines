import React from 'react'
import { Metadata } from 'next'
import LegalPolicyDisplay from '@/components/legal/LegalPolicyDisplay'

export const metadata: Metadata = {
  title: 'Terms of Service | Luxury Wine Collection',
  description: 'Read our terms of service for luxury wine purchases with cryptocurrency and traditional payments.',
  keywords: 'terms of service, wine terms, luxury wine legal, cryptocurrency wine terms',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <LegalPolicyDisplay policyType="terms-of-service" />
      </div>
    </div>
  )
}