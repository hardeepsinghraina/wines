'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterRedirect() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/account')
      } else {
        router.replace('/auth/register')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return null
}
