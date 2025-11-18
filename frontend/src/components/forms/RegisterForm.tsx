'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterFormData } from '@/types/auth'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  })
  
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {}

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }

    // Age validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old to register'
      }
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
      await register(formData)
      setShowSuccess(true)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof RegisterFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (showSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-charcoal-black mb-2">Registration Successful!</h2>
            <p className="text-muted-olive mb-6">
              We&apos;ve sent a verification email to <strong>{formData.email}</strong>. 
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/auth/login')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Go to Login
            </Button>
            
            <Button
              onClick={() => setShowSuccess(false)}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Register Another Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-charcoal-black mb-2">Create Account</h2>
          <p className="text-muted-olive">Join our exclusive wine community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-charcoal-black mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors ${
                  formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="First name"
                disabled={isLoading}
              />
              {formErrors.firstName && (
                <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-charcoal-black mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors ${
                  formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Last name"
                disabled={isLoading}
              />
              {formErrors.lastName && (
                <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

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
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-charcoal-black mb-2">
              Date of Birth <span className="text-muted-olive">(Optional)</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors ${
                formErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {formErrors.dateOfBirth && (
              <p className="text-red-600 text-sm mt-1">{formErrors.dateOfBirth}</p>
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
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            {formErrors.password && (
              <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal-black mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors ${
                formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {formErrors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-burgundy focus:ring-burgundy border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-muted-olive">
              I agree to the{' '}
              <Link href="/terms" className="text-burgundy hover:text-burgundy/80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-burgundy hover:text-burgundy/80">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-olive">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-burgundy hover:text-burgundy/80 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}