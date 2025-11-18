import React from 'react'
import { Metadata } from 'next'
import LegalPolicyDisplay from '@/components/legal/LegalPolicyDisplay'

export const metadata: Metadata = {
  title: 'Cookie Policy | Luxury Wine Collection',
  description: 'Learn about how we use cookies to enhance your luxury wine shopping experience.',
  keywords: 'cookie policy, privacy cookies, wine website cookies, luxury wine privacy',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <LegalPolicyDisplay policyType="cookie-policy" />
      </div>
    </div>
  )
}