'use client'

import dynamic from 'next/dynamic'

const ForgotPasswordForm = dynamic(
  () => import('@/components/forms/ForgotPasswordForm').then(mod => ({ default: mod.ForgotPasswordForm })),
  { ssr: false }
)

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-champagne-gold/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </div>
  )
}