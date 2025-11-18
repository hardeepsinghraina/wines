'use client'

import React, { useState, useEffect } from 'react'
import { usePromotionalPricing } from '@/hooks/usePromotionalPricing'
import { PromotionalBanner, PremiumCollectionBanner } from './PromotionalBanner'
import { CountdownTimer, FlashSaleCountdown } from './CountdownTimer'
import { StockScarcityIndicator } from './StockScarcityIndicator'
import { BulkPricingDisplay } from './BulkPricingDisplay'
import { VIPPricingDisplay } from './VIPPricingDisplay'
import { DiscountCodeInput } from './DiscountCodeInput'
import { CustomerTier } from '../../../../shared/types/promotional-pricing'

interface PromotionalPricingIntegrationProps {
  productId: string
  originalPrice: number
  currentPrice: number
  stock: number
  customerTier?: CustomerTier
  quantity?: number
  onQuantityChange?: (quantity: number) => void
  onPriceChange?: (newPrice: number) => void
  showBanner?: boolean
  showCountdown?: boolean
  showStockScarcity?: boolean
  showBulkPricing?: boolean
  showVIPPricing?: boolean
  className?: string
}

export function PromotionalPricingIntegration({
  productId,
  originalPrice,
  currentPrice,
  stock,
  customerTier,
  quantity = 1,
  onQuantityChange,
  onPriceChange,
  showBanner = true,
  showCountdown = true,
  showStockScarcity = true,
  showBulkPricing = true,
  showVIPPricing = true,
  className = ''
}: PromotionalPricingIntegrationProps) {
  const {
    pricing,
    bulkPricing,
    vipPricing,
    isLoading,
    getBestPrice,
    getTotalSavings,
    getDiscountPercent,
    getBulkTier,
    isStockScarce,
    getUrgencyMessage
  } = usePromotionalPricing({
    productId,
    originalPrice,
    customerTier,
    quantity
  })

  const [displayPrice, setDisplayPrice] = useState(currentPrice)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)

  // Track promotional impression
  useEffect(() => {
    if (pricing && !hasTrackedImpression) {
      trackPromotionalEvent('impression')
      setHasTrackedImpression(true)
    }
  }, [pricing, hasTrackedImpression])

  // Update display price when promotional pricing changes
  useEffect(() => {
    const bestPrice = getBestPrice(quantity)
    setDisplayPrice(bestPrice)
    onPriceChange?.(bestPrice)
  }, [getBestPrice, quantity, onPriceChange])

  const trackPromotionalEvent = async (eventType: 'impression' | 'click' | 'conversion', revenue?: number) => {
    try {
      // Track the event for analytics
      const { getApiUrl } = await import('@/config/api');
      await fetch(getApiUrl('/api/promotional-pricing/promotions/promo-1/track'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          productId,
          revenue
        })
      })
    } catch (error) {
      console.error('Failed to track promotional event:', error)
    }
  }

  const handlePromotionalClick = () => {
    trackPromotionalEvent('click')
  }

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange?.(newQuantity)
    
    // Track bulk pricing engagement
    const bulkTier = getBulkTier(newQuantity)
    if (bulkTier) {
      trackPromotionalEvent('click') // Track as engagement with bulk pricing
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const discountPercent = getDiscountPercent(quantity)
  const totalSavings = getTotalSavings(quantity)
  const urgencyMessage = getUrgencyMessage()
  const stockScarce = isStockScarce()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Promotional Banner */}
      {showBanner && (
        <div onClick={handlePromotionalClick}>
          <PremiumCollectionBanner />
        </div>
      )}

      {/* Price Display with Promotional Pricing */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl line-through text-gray-400">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-3xl font-bold text-burgundy">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {discountPercent}% OFF
              </span>
            </div>
            <p className="text-green-600 font-medium mt-1">
              You save ${totalSavings.toFixed(2)}!
            </p>
          </div>
          
          {urgencyMessage && (
            <div className="text-right">
              <p className="text-sm text-orange-600 font-medium">
                {urgencyMessage}
              </p>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        {showCountdown && (
          <div className="mb-4">
            <FlashSaleCountdown />
          </div>
        )}

        {/* Stock Scarcity Indicator */}
        {showStockScarcity && stockScarce && (
          <StockScarcityIndicator
            stock={stock}
            threshold={10}
            className="mb-4"
          />
        )}
      </div>

      {/* VIP Pricing Display */}
      {showVIPPricing && (
        <VIPPricingDisplay
          productId={productId}
          originalPrice={originalPrice}
          currentPrice={displayPrice}
          customerTier={customerTier}
          onUpgrade={() => {
            trackPromotionalEvent('click')
            // Handle VIP upgrade
          }}
        />
      )}

      {/* Bulk Pricing Display */}
      {showBulkPricing && (
        <BulkPricingDisplay
          productId={productId}
          originalPrice={originalPrice}
          currentQuantity={quantity}
          onQuantityChange={handleQuantityChange}
        />
      )}

      {/* Promotional Insights */}
      <PromotionalInsights
        originalPrice={originalPrice}
        currentPrice={displayPrice}
        discountPercent={discountPercent}
        totalSavings={totalSavings}
        stock={stock}
        customerTier={customerTier}
      />
    </div>
  )
}

// Promotional insights component
interface PromotionalInsightsProps {
  originalPrice: number
  currentPrice: number
  discountPercent: number
  totalSavings: number
  stock: number
  customerTier?: CustomerTier
}

function PromotionalInsights({
  originalPrice,
  currentPrice,
  discountPercent,
  totalSavings,
  stock,
  customerTier
}: PromotionalInsightsProps) {
  const insights = []

  // Price comparison insight
  if (discountPercent >= 70) {
    insights.push({
      icon: '🔥',
      title: 'Exceptional Value',
      description: `This ${discountPercent}% discount is one of our best offers this year!`
    })
  }

  // Stock insight
  if (stock <= 5) {
    insights.push({
      icon: '⚠️',
      title: 'Limited Availability',
      description: `Only ${stock} bottles left at this price. This wine typically sells out within hours.`
    })
  }

  // VIP insight
  if (customerTier === 'vip') {
    insights.push({
      icon: '👑',
      title: 'VIP Exclusive',
      description: 'As a VIP member, you\'re getting an additional discount on top of the sale price.'
    })
  }

  // Investment insight
  if (originalPrice > 1000) {
    insights.push({
      icon: '📈',
      title: 'Investment Opportunity',
      description: `Premium wines like this have historically appreciated 8-12% annually.`
    })
  }

  if (insights.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💡 Promotional Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-lg">{insight.icon}</span>
            <div>
              <h4 className="font-medium text-gray-900">{insight.title}</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Cart-level promotional pricing integration
interface CartPromotionalPricingProps {
  cartItems: Array<{
    productId: string
    quantity: number
    price: number
    originalPrice?: number
  }>
  customerTier?: CustomerTier
  onDiscountApplied?: (discount: any) => void
  className?: string
}

export function CartPromotionalPricing({
  cartItems,
  customerTier,
  onDiscountApplied,
  className = ''
}: CartPromotionalPricingProps) {
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const originalCartTotal = cartItems.reduce((sum, item) => 
    sum + ((item.originalPrice || item.price) * item.quantity), 0
  )
  const totalSavings = originalCartTotal - cartTotal

  const handleDiscountApplied = (discount: any) => {
    setAppliedDiscount(discount)
    onDiscountApplied?.(discount)
  }

  const handleDiscountRemoved = () => {
    setAppliedDiscount(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cart Savings Summary */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">
          🎉 You're Already Saving Big!
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-green-700">Total Promotional Savings:</span>
          <span className="font-bold text-green-800">
            ${totalSavings.toFixed(2)}
          </span>
        </div>
        {appliedDiscount && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-green-700">Additional Discount:</span>
            <span className="font-bold text-green-800">
              ${appliedDiscount.savings.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Discount Code Input */}
      <DiscountCodeInput
        cartItems={cartItems}
        onDiscountApplied={handleDiscountApplied}
        onDiscountRemoved={handleDiscountRemoved}
      />

      {/* Bulk Purchase Incentive */}
      {cartItems.length >= 3 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            📦 Bulk Purchase Bonus
          </h4>
          <p className="text-blue-700 text-sm">
            You're buying {cartItems.length} bottles! Consider adding more to unlock additional bulk discounts.
          </p>
        </div>
      )}

      {/* VIP Upgrade Prompt */}
      {customerTier !== 'vip' && cartTotal > 500 && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">
            👑 VIP Upgrade Available
          </h4>
          <p className="text-purple-700 text-sm mb-3">
            Upgrade to VIP and save an additional 15% on this order!
          </p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors">
            Upgrade to VIP
          </button>
        </div>
      )}
    </div>
  )
}