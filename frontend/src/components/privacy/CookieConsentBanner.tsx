'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

interface CookieConsentBannerProps {
  onAcceptAll?: () => void
  onRejectAll?: () => void
  onSavePreferences?: (preferences: CookiePreferences) => void
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onAcceptAll,
  onRejectAll,
  onSavePreferences
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem('cookie-consent')
    if (!consentGiven) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    
    setIsVisible(false)
    onAcceptAll?.()
  }

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    
    setIsVisible(false)
    onRejectAll?.()
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    
    setIsVisible(false)
    setShowPreferences(false)
    onSavePreferences?.(preferences)
  }

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }))
  }

  if (!isVisible) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We use cookies
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, 
                analyze site traffic, and provide personalized content. By clicking "Accept All", 
                you consent to our use of cookies.
              </p>
              <button
                onClick={() => setShowPreferences(true)}
                className="text-sm text-burgundy hover:text-burgundy-dark underline mt-2"
              >
                Customize preferences
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="whitespace-nowrap"
              >
                Reject All
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="whitespace-nowrap"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      <Modal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        title="Cookie Preferences"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Manage your cookie preferences below. You can enable or disable different 
            types of cookies except for necessary cookies which are required for the 
            website to function properly.
          </p>

          <div className="space-y-4">
            {/* Necessary Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
                  />
                  <span className="ml-2 text-sm text-gray-500">Always Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                These cookies are essential for the website to function and cannot be disabled. 
                They include authentication, shopping cart, and security features.
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Functional Cookies</h4>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                    className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {preferences.functional ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                These cookies enable enhanced functionality and personalization, such as 
                language preferences and user interface settings.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {preferences.analytics ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                These cookies help us understand how visitors interact with our website 
                by collecting and reporting information anonymously.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    className="w-4 h-4 text-burgundy bg-gray-100 border-gray-300 rounded focus:ring-burgundy"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {preferences.marketing ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                These cookies are used to deliver advertisements that are relevant to you 
                and your interests based on your browsing behavior.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowPreferences(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CookieConsentBanner