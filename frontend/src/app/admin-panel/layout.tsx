'use client'

import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    </ErrorBoundary>
  )
}