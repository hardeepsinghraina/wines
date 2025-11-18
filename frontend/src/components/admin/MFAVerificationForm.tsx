'use client'

import React, { useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function MFAVerificationForm() {
  const { verifyMFA, mfaSessionId, isLoading } = useAdminAuth()
  const [mfaCode, setMfaCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!mfaSessionId) {
      setError('Invalid session. Please try logging in again.')
      return
    }

    if (mfaCode.length !== 6) {
      setError('Please enter a 6-digit MFA code')
      return
    }

    try {
      await verifyMFA({
        code: mfaCode,
        sessionId: mfaSessionId
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setMfaCode(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Multi-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700">
                Authentication Code
              </label>
              <input
                id="mfaCode"
                name="mfaCode"
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading || mfaCode.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-burgundy hover:bg-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Having trouble? Contact your system administrator
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}