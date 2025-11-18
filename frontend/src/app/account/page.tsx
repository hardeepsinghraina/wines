'use client'

// Disable SSR for this page to avoid prerendering issues
export const dynamic = 'force-dynamic'

import { UserDashboard } from '@/components/account/UserDashboard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <UserDashboard />
      </div>
    </ProtectedRoute>
  )
}