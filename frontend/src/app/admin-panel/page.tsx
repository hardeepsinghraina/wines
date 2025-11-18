'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { AdminDashboard } from '@/components/admin-panel/AdminDashboard'
import { Loading } from '@/components/ui/Loading'

export default function AdminPanelPage() {
  const { user, isLoading, isAuthenticated } = useAdminAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [mounted, isLoading, isAuthenticated, router])

  if (!mounted || isLoading) {
    return <Loading />
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-black mb-4">Access Denied</h1>
          <p className="text-muted-olive">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}