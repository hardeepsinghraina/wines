'use client'

import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
  endDate: Date
  title?: string
  urgencyMessage?: string
  expiredMessage?: string
  showDays?: boolean
  showHours?: boolean
  showMinutes?: boolean
  showSeconds?: boolean
  theme?: 'default' | 'urgent' | 'luxury'
  size?: 'small' | 'medium' | 'large'
  onExpired?: () => void
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function CountdownTimer({
  endDate,
  title = 'Limited Time Offer',
  urgencyMessage = 'Hurry! Offer expires soon',
  expiredMessage = 'Offer has expired',
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  theme = 'default',
  size = 'medium',
  onExpired,
  className = ''
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds, total: distance }
    }

    const updateTimer = () => {
      const time = calculateTimeLeft()
      setTimeLeft(time)

      if (time.total <= 0 && !isExpired) {
        setIsExpired(true)
        onExpired?.()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [endDate, isExpired, onExpired])

  if (!timeLeft) return null

  const themeClasses = {
    default: 'bg-gray-100 text-gray-900 border-gray-300',
    urgent: 'bg-red-50 text-red-900 border-red-300',
    luxury: 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-900 border-purple-300'
  }

  const sizeClasses = {
    small: {
      container: 'p-3',
      title: 'text-sm font-medium',
      timer: 'text-lg font-bold',
      unit: 'text-xs',
      message: 'text-xs'
    },
    medium: {
      container: 'p-4',
      title: 'text-base font-semibold',
      timer: 'text-2xl font-bold',
      unit: 'text-sm',
      message: 'text-sm'
    },
    large: {
      container: 'p-6',
      title: 'text-lg font-bold',
      timer: 'text-4xl font-bold',
      unit: 'text-base',
      message: 'text-base'
    }
  }

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000 // Less than 24 hours
  const isCritical = timeLeft.total < 60 * 60 * 1000 // Less than 1 hour

  if (isExpired) {
    return (
      <div className={`
        rounded-lg border-2 text-center
        ${themeClasses.urgent}
        ${sizeClasses[size].container}
        ${className}
      `}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className={sizeClasses[size].title}>
            {expiredMessage}
          </h3>
        </div>
      </div>
    )
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Days', show: showDays && timeLeft.days > 0 },
    { value: timeLeft.hours, label: 'Hours', show: showHours },
    { value: timeLeft.minutes, label: 'Minutes', show: showMinutes },
    { value: timeLeft.seconds, label: 'Seconds', show: showSeconds }
  ].filter(unit => unit.show)

  return (
    <div className={`
      rounded-lg border-2 text-center
      ${isCritical ? themeClasses.urgent : isUrgent ? themeClasses.urgent : themeClasses[theme]}
      ${sizeClasses[size].container}
      ${className}
    `}>
      {/* Title */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className={`w-5 h-5 ${isCritical ? 'text-red-600 animate-pulse' : 'text-current'}`} />
        <h3 className={sizeClasses[size].title}>
          {title}
        </h3>
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <div className="text-center">
              <div className={`
                ${sizeClasses[size].timer}
                ${isCritical ? 'text-red-600 animate-pulse' : 'text-current'}
                font-mono
              `}>
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className={`${sizeClasses[size].unit} opacity-75 font-medium`}>
                {unit.label}
              </div>
            </div>
            {index < timeUnits.length - 1 && (
              <div className={`${sizeClasses[size].timer} opacity-50`}>:</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Urgency Message */}
      <p className={`${sizeClasses[size].message} opacity-80 font-medium`}>
        {isCritical ? '🚨 Last chance!' : isUrgent ? '⚡ Almost gone!' : urgencyMessage}
      </p>
    </div>
  )
}

// Preset countdown timers for common use cases
export function FlashSaleCountdown() {
  const endDate = new Date()
  endDate.setHours(endDate.getHours() + 6) // 6 hours from now

  return (
    <CountdownTimer
      endDate={endDate}
      title="⚡ Flash Sale Ends In"
      urgencyMessage="Don't miss out on 80% savings!"
      theme="urgent"
      size="medium"
      showDays={false}
    />
  )
}

export function WeeklyDealCountdown() {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7) // 7 days from now

  return (
    <CountdownTimer
      endDate={endDate}
      title="🍷 Weekly Deal Expires In"
      urgencyMessage="Premium wines at unbeatable prices"
      theme="luxury"
      size="large"
    />
  )
}

export function LimitedEditionCountdown() {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 3) // 3 days from now

  return (
    <CountdownTimer
      endDate={endDate}
      title="🏆 Limited Edition Sale"
      urgencyMessage="Rare wines - limited quantities available"
      theme="luxury"
      size="medium"
    />
  )
}

export function ProductPageCountdown({ endDate }: { endDate: Date }) {
  return (
    <CountdownTimer
      endDate={endDate}
      title="Special Offer Ends In"
      urgencyMessage="Save 80% on this premium wine"
      theme="urgent"
      size="small"
      className="mb-4"
    />
  )
}