'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/auth-api'
import { ForgotPasswordFormData } from '@/types/auth'

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authApi.forgotPassword(formData)
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-black mb-2">Check Your Email</h2>
          <p className="text-muted-olive mb-6">
            If an account exists with <strong>{formData.email}</strong>, we&apos;ve sent you a password reset link.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = '/auth/login'}
          >
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-charcoal-black mb-2">Forgot Password?</h2>
          <p className="text-muted-olive">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="text-burgundy hover:text-burgundy/80 font-medium transition-colors bg-transparent border-none cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}