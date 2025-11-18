'use client'

import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface MFASetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MFASetupModal({ isOpen, onClose, onSuccess }: MFASetupModalProps) {
  const { setupMFA, confirmMFASetup } = useAdminAuth()
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && step === 'setup') {
      initializeMFASetup()
    }
  }, [isOpen, step])

  const initializeMFASetup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await setupMFA()
      setQrCodeUrl(response.qrCodeUrl)
      setSecret(response.secret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup MFA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    try {
      setIsLoading(true)
      await confirmMFASetup({
        secret,
        code: verificationCode
      })
      onSuccess()
      onClose()
      resetModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setStep('setup')
    setQrCodeUrl('')
    setSecret('')
    setVerificationCode('')
    setError(null)
  }

  const handleClose = () => {
    onClose()
    resetModal()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(value)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Setup Multi-Factor Authentication">
      <div className="space-y-6">
        {step === 'setup' && (
          <>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy"></div>
                </div>
              ) : qrCodeUrl ? (
                <div className="flex flex-col items-center space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={qrCodeUrl} 
                    alt="MFA QR Code" 
                    className="border border-gray-300 rounded-lg"
                  />
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
                    <code className="text-xs font-mono break-all">{secret}</code>
                  </div>
                </div>
              ) : null}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('verify')}
                disabled={isLoading || !qrCodeUrl}
              >
                Next: Verify Setup
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app to complete the setup.
              </p>
              
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-burgundy focus:border-burgundy text-center text-2xl tracking-widest"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('setup')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Complete Setup'}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}