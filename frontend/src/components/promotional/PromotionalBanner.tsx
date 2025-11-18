'use client'

import React, { useState, useEffect } from 'react'
import { X, Clock, Flame, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PromotionalBannerProps {
  title: string
  message: string
  ctaText?: string
  ctaUrl?: string
  backgroundColor?: string
  textColor?: string
  position?: 'top' | 'bottom' | 'floating'
  priority?: number
  endDate?: Date
  onClose?: () => void
  onCTAClick?: () => void
  className?: string
}

export function PromotionalBanner({
  title,
  message,
  ctaText,
  ctaUrl,
  backgroundColor = 'bg-burgundy',
  textColor = 'text-white',
  position = 'top',
  priority = 1,
  endDate,
  onClose,
  onCTAClick,
  className = ''
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    if (!endDate) return

    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance < 0) {
        setTimeLeft(null)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleCTAClick = () => {
    onCTAClick?.()
    if (ctaUrl) {
      window.location.href = ctaUrl
    }
  }

  if (!isVisible) return null

  const positionClasses = {
    top: 'top-0 left-0 right-0 z-50',
    bottom: 'bottom-0 left-0 right-0 z-50',
    floating: 'fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto rounded-lg shadow-lg'
  }

  return (
    <div className={`
      ${position === 'floating' ? 'fixed' : 'sticky'} 
      ${positionClasses[position]} 
      ${backgroundColor} 
      ${textColor} 
      ${className}
    `}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Flame className="w-6 h-6 text-yellow-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  {title}
                </h3>
                {priority > 1 && (
                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-xs sm:text-sm opacity-90 truncate">
                {message}
              </p>

              {/* Countdown Timer */}
              {timeLeft && (
                <div className="flex items-center gap-1 text-xs font-mono bg-black/20 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" />
                  <span>
                    {timeLeft.days > 0 && `${timeLeft.days}d `}
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {ctaText && (
            <Button
              onClick={handleCTAClick}
              variant="outline"
              size="sm"
              className="bg-white text-burgundy border-white hover:bg-gray-100 flex-shrink-0"
            >
              {ctaText}
            </Button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Default promotional banners for the 80% off campaign
export function PremiumCollectionBanner() {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7) // 7 days from now

  return (
    <PromotionalBanner
      title="🔥 80% OFF Premium Collection"
      message="Limited time offer on luxury wines - Save up to $2,000 per bottle!"
      ctaText="Shop Now"
      ctaUrl="/products"
      backgroundColor="bg-gradient-to-r from-burgundy to-red-700"
      textColor="text-white"
      position="top"
      priority={3}
      endDate={endDate}
    />
  )
}

export function FlashSaleBanner() {
  const endDate = new Date()
  endDate.setHours(endDate.getHours() + 24) // 24 hours from now

  return (
    <PromotionalBanner
      title="⚡ Flash Sale"
      message="Extra 5% off for orders over $1,500 - Use code FLASH5"
      ctaText="Apply Code"
      backgroundColor="bg-gradient-to-r from-orange-600 to-red-600"
      textColor="text-white"
      position="floating"
      priority={2}
      endDate={endDate}
    />
  )
}

export function VIPExclusiveBanner() {
  return (
    <PromotionalBanner
      title="👑 VIP Exclusive"
      message="Additional 15% off for VIP members on all premium wines"
      ctaText="Upgrade to VIP"
      ctaUrl="/account/upgrade"
      backgroundColor="bg-gradient-to-r from-purple-800 to-indigo-800"
      textColor="text-white"
      position="bottom"
      priority={1}
    />
  )
}