'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { LoginFormData } from '@/types/auth'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function LoginForm({ onSuccess, redirectTo = '/account' }: LoginFormProps) {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  
  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({})

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await login(formData)
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(redirectTo)
      }
    } catch (error: any) {
      // Check for field-specific validation errors from API
      if (error.response?.data?.error?.details) {
        const apiErrors: Partial<LoginFormData> = {}
        const details = error.response.data.error.details
        
        if (Array.isArray(details)) {
          details.forEach((detail: any) => {
            if (detail.path && detail.msg) {
              apiErrors[detail.path as keyof LoginFormData] = detail.msg
            }
          })
          
          if (Object.keys(apiErrors).length > 0) {
            setFormErrors(apiErrors)
          }
        }
      }
      
      // Error message is handled by the auth context
      console.error('Login failed:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof LoginFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear general error from context when user starts typing
    if (error) {
      clearError()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-charcoal-black mb-2">Welcome Back</h2>
          <p className="text-muted-olive">Sign in to your account</p>
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
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors ${
                formErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {formErrors.email && (
              <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal-black mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors ${
                formErrors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {formErrors.password && (
              <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-burgundy focus:ring-burgundy border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-olive">
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-burgundy hover:text-burgundy/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-olive">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-burgundy hover:text-burgundy/80 font-medium transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}