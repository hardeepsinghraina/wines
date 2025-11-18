'use client'

// Disable SSR for this page to avoid prerendering issues
export const dynamic = 'force-dynamic'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard'
import { Loading } from '@/components/ui/Loading'

export default function AffiliatePage() {
  const { user } = useAuth()

  if (!user) {
    return <Loading />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-black mb-2">Affiliate Program</h1>
        <p className="text-muted-olive">Earn commissions by referring wine enthusiasts</p>
      </div>

      <AffiliateDashboard />
    </div>
  )
}