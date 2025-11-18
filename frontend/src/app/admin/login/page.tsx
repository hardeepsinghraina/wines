'use client'

import React from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { MFAVerificationForm } from '@/components/admin/MFAVerificationForm'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLoginPage() {
  const { isAuthenticated, requiresMFA } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null // Will redirect
  }

  if (requiresMFA) {
    return <MFAVerificationForm />
  }

  return <AdminLoginForm />
}