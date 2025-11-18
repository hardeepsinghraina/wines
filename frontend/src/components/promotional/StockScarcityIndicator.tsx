'use client'

import React from 'react'
import { AlertTriangle, Package, TrendingUp, Clock } from 'lucide-react'

interface StockScarcityIndicatorProps {
  stock: number
  threshold?: number
  showExactCount?: boolean
  urgencyLevel?: 'low' | 'medium' | 'high'
  customMessage?: string
  className?: string
}

export function StockScarcityIndicator({
  stock,
  threshold = 10,
  showExactCount = true,
  urgencyLevel,
  customMessage,
  className = ''
}: StockScarcityIndicatorProps) {
  // Don't show if stock is above threshold
  if (stock > threshold) return null

  // Determine urgency level based on stock if not provided
  const getUrgencyLevel = (stockCount: number): 'low' | 'medium' | 'high' => {
    if (urgencyLevel) return urgencyLevel
    if (stockCount <= 2) return 'high'
    if (stockCount <= 5) return 'medium'
    return 'low'
  }

  const currentUrgencyLevel = getUrgencyLevel(stock)

  const urgencyConfig = {
    low: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: Package,
      iconColor: 'text-yellow-600',
      message: showExactCount ? `Only ${stock} left in stock` : 'Limited stock remaining'
    },
    medium: {
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      message: showExactCount ? `Hurry! Only ${stock} left` : 'Very limited stock'
    },
    high: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      message: showExactCount ? `Last ${stock} in stock!` : 'Almost sold out!'
    }
  }

  const config = urgencyConfig[currentUrgencyLevel]
  const Icon = config.icon
  const message = customMessage || config.message

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg border
      ${config.bgColor}
      ${config.textColor}
      ${config.borderColor}
      ${className}
    `}>
      <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0`} />
      <span className="text-sm font-medium">
        {message}
      </span>
      {currentUrgencyLevel === 'high' && (
        <Clock className="w-3 h-3 text-red-500 animate-pulse ml-1" />
      )}
    </div>
  )
}

// Preset scarcity indicators for different scenarios
export function LowStockAlert({ stock }: { stock: number }) {
  return (
    <StockScarcityIndicator
      stock={stock}
      threshold={10}
      urgencyLevel="low"
      showExactCount={true}
      className="mb-3"
    />
  )
}

export function CriticalStockAlert({ stock }: { stock: number }) {
  return (
    <StockScarcityIndicator
      stock={stock}
      threshold={5}
      urgencyLevel="high"
      showExactCount={true}
      customMessage={`🚨 Only ${stock} bottles left - Order now!`}
      className="mb-3 animate-pulse"
    />
  )
}

export function PremiumStockAlert({ stock }: { stock: number }) {
  return (
    <StockScarcityIndicator
      stock={stock}
      threshold={8}
      urgencyLevel="medium"
      showExactCount={true}
      customMessage={`🍷 Rare vintage - ${stock} bottles remaining`}
      className="mb-3"
    />
  )
}

export function FlashSaleStockAlert({ stock }: { stock: number }) {
  return (
    <StockScarcityIndicator
      stock={stock}
      threshold={15}
      urgencyLevel="high"
      showExactCount={true}
      customMessage={`⚡ Flash Sale: ${stock} left at this price!`}
      className="mb-3"
    />
  )
}

// Stock progress bar component
interface StockProgressBarProps {
  current: number
  total: number
  threshold?: number
  className?: string
}

export function StockProgressBar({
  current,
  total,
  threshold = 10,
  className = ''
}: StockProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100))
  const isLow = current <= threshold

  const getBarColor = () => {
    if (current <= 2) return 'bg-red-500'
    if (current <= 5) return 'bg-orange-500'
    if (current <= threshold) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Stock Level</span>
        <span className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
          {current} / {total}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isLow && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="w-3 h-3" />
          <span>Low stock alert</span>
        </div>
      )}
    </div>
  )
}