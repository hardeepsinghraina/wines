'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/ui/Loading'

const RegisterForm = dynamic(
  () => import('@/components/forms/RegisterForm').then(mod => ({ default: mod.RegisterForm })),
  { ssr: false }
)

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/account')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory to-champagne-gold/10 flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-champagne-gold/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}