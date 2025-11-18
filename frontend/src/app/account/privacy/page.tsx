'use client'

// Disable SSR for this page to avoid prerendering issues
export const dynamic = 'force-dynamic'

import React from 'react'
import PrivacySettings from '@/components/privacy/PrivacySettings'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PrivacySettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PrivacySettings />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}