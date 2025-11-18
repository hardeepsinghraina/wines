'use client'

import React, { useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AdminLoginRequest } from '@/types/admin'

export function AdminLoginForm() {
  const { login, isLoading } = useAdminAuth()
  const [formData, setFormData] = useState<AdminLoginRequest>({
    email: '',
    password: '',
    mfaCode: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [showMFA, setShowMFA] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await login(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your admin account
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            {showMFA && (
              <div>
                <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700">
                  MFA Code
                </label>
                <input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  maxLength={6}
                  value={formData.mfaCode}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy focus:z-10 sm:text-sm"
                  placeholder="Enter 6-digit code"
                />
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-burgundy hover:bg-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowMFA(!showMFA)}
                className="text-sm text-burgundy hover:text-burgundy-dark"
              >
                {showMFA ? 'Hide MFA Code' : 'I have an MFA code'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}