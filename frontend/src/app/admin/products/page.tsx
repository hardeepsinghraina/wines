'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { AdminPermission } from '@/types/admin'
import { ProductManagement } from '@/components/admin/ProductManagement'
import { Loading } from '@/components/ui/Loading'
import { Card } from '@/components/ui/Card'

export default function AdminProductsPage() {
  const router = useRouter()
  const { admin, isAuthenticated, isLoading, hasPermission } = useAdminAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!isAuthenticated || !admin) {
    return null
  }

  if (!hasPermission(AdminPermission.PRODUCTS_VIEW)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to view product management.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator to request access.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">
                Comprehensive wine product administration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {admin.firstName} {admin.lastName}
              </div>
              {admin.avatar && (
                <img
                  src={admin.avatar}
                  alt={`${admin.firstName} ${admin.lastName}`}
                  className="h-8 w-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductManagement />
      </div>
    </div>
  )
}