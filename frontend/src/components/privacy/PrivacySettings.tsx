'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'

interface ConsentPreferences {
  marketing: boolean
  analytics: boolean
  functional: boolean
  necessary: boolean
}

interface PrivacySettingsProps {
  userId?: string
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    marketing: false,
    analytics: false,
    functional: true,
    necessary: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDataExport, setShowDataExport] = useState(false)
  const [showDataDeletion, setShowDataDeletion] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')

  useEffect(() => {
    if (userId) {
      loadUserConsent()
    }
  }, [userId])

  const loadUserConsent = async () => {
    setLoading(true)
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl('/api/gdpr/consent'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Convert consent array to preferences object
        const consentMap = data.data.reduce((acc: any, consent: any) => {
          acc[consent.consentType] = consent.granted
          return acc
        }, {})
        
        setPreferences(prev => ({ ...prev, ...consentMap }))
      }
    } catch (error) {
      console.error('Failed to load consent preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConsent = async (consentType: keyof ConsentPreferences, granted: boolean) => {
    if (consentType === 'necessary') return // Cannot change necessary cookies

    setSaving(true)
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl('/api/gdpr/consent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ consentType, granted })
      })

      if (response.ok) {
        setPreferences(prev => ({ ...prev, [consentType]: granted }))
      } else {
        throw new Error('Failed to update consent')
      }
    } catch (error) {
      console.error('Failed to update consent:', error)
      alert('Failed to update consent preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const exportUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/gdpr/export?format=${exportFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `user-data-export.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setShowDataExport(false)
        alert('Your data export has been downloaded successfully.')
      } else {
        throw new Error('Failed to export data')
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export your data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const requestDataDeletion = async () => {
    setLoading(true)
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl('/api/gdpr/delete-request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: deletionReason })
      })

      if (response.ok) {
        setShowDataDeletion(false)
        setDeletionReason('')
        alert('Your data deletion request has been submitted. You will receive a confirmation email shortly.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to request data deletion')
      }
    } catch (error: any) {
      console.error('Failed to request data deletion:', error)
      alert(error?.message || 'Failed to submit deletion request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !preferences.necessary) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
        <p className="text-gray-600">
          Manage your privacy preferences and data protection settings.
        </p>
      </div>

      {/* Consent Preferences */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cookie and Data Processing Consent
        </h3>
        <div className="space-y-4">
          {/* Necessary */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Necessary</h4>
              <p className="text-sm text-gray-600 mt-1">
                Essential cookies required for the website to function properly.
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-3">Always Active</span>
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Functional */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Functional</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cookies that enable enhanced functionality and personalization.
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => updateConsent('functional', e.target.checked)}
                disabled={saving}
                className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
              />
            </label>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cookies that help us understand how you use our website.
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => updateConsent('analytics', e.target.checked)}
                disabled={saving}
                className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
              />
            </label>
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Marketing</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cookies used to deliver relevant advertisements and marketing content.
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => updateConsent('marketing', e.target.checked)}
                disabled={saving}
                className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Data Rights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Data Rights
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Export Your Data</h4>
              <p className="text-sm text-gray-600 mt-1">
                Download a copy of all your personal data in a portable format.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataExport(true)}
            >
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Delete Your Account</h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataDeletion(true)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Export Modal */}
      <Modal
        isOpen={showDataExport}
        onClose={() => setShowDataExport(false)}
        title="Export Your Data"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Choose the format for your data export. This will include your profile information, 
            order history, and other personal data we have on file.
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value as 'json')}
                className="w-4 h-4 text-burgundy"
              />
              <span className="ml-2">JSON Format (machine-readable)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value as 'csv')}
                className="w-4 h-4 text-burgundy"
              />
              <span className="ml-2">CSV Format (spreadsheet-friendly)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowDataExport(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={exportUserData}
              disabled={loading}
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Data Deletion Modal */}
      <Modal
        isOpen={showDataDeletion}
        onClose={() => setShowDataDeletion(false)}
        title="Delete Your Account"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">⚠️ Warning</h4>
            <p className="text-sm text-red-700">
              This action cannot be undone. Deleting your account will permanently remove 
              all your personal data, order history, and preferences.
            </p>
          </div>
          
          <div>
            <label htmlFor="deletion-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for deletion (optional)
            </label>
            <textarea
              id="deletion-reason"
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
              placeholder="Please let us know why you're deleting your account..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowDataDeletion(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={requestDataDeletion}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Submitting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PrivacySettings