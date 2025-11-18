'use client'

import React, { useState, useEffect } from 'react'
import { Crown, Star, Gift, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CustomerTier } from '../../../../shared/types/promotional-pricing'
import { PromotionalPricingAPI } from '@/lib/promotional-pricing-api'

interface VIPPricingDisplayProps {
  productId: string
  originalPrice: number
  currentPrice: number
  customerTier?: CustomerTier
  onUpgrade?: () => void
  className?: string
}

interface VIPPricingInfo {
  tier: CustomerTier
  discountPercent: number
  vipPrice: number
}

export function VIPPricingDisplay({
  productId,
  originalPrice,
  currentPrice,
  customerTier,
  onUpgrade,
  className = ''
}: VIPPricingDisplayProps) {
  const [vipPricing, setVipPricing] = useState<VIPPricingInfo | null>(null)
  const [allTierPricing, setAllTierPricing] = useState<VIPPricingInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVIPPricing = async () => {
      try {
        // Fetch pricing for all tiers to show upgrade benefits
        const tiers: CustomerTier[] = ['bronze', 'silver', 'gold', 'platinum', 'vip']
        const pricingPromises = tiers.map(tier =>
          PromotionalPricingAPI.getVIPPricing(productId, tier, originalPrice)
        )
        
        const allPricing = await Promise.all(pricingPromises)
        setAllTierPricing(allPricing)

        // Set current tier pricing if user has a tier
        if (customerTier) {
          const currentTierPricing = allPricing.find(p => p.tier === customerTier)
          setVipPricing(currentTierPricing || null)
        }
      } catch (error) {
        console.error('Failed to fetch VIP pricing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVIPPricing()
  }, [productId, originalPrice, customerTier])

  const getTierInfo = (tier: CustomerTier) => {
    const tierConfig = {
      bronze: {
        name: 'Bronze',
        icon: '🥉',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      },
      silver: {
        name: 'Silver',
        icon: '🥈',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      },
      gold: {
        name: 'Gold',
        icon: '🥇',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      platinum: {
        name: 'Platinum',
        icon: '💎',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      vip: {
        name: 'VIP',
        icon: '👑',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      }
    }
    return tierConfig[tier]
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  // If user has VIP pricing, show their current benefits
  if (vipPricing && customerTier) {
    const tierInfo = getTierInfo(customerTier)
    const additionalSavings = currentPrice - vipPricing.vipPrice
    const totalSavings = originalPrice - vipPricing.vipPrice

    return (
      <div className={`${className}`}>
        <div className={`
          p-4 rounded-lg border-2
          ${tierInfo.bgColor}
          ${tierInfo.borderColor}
        `}>
          <div className="flex items-center gap-2 mb-3">
            <Crown className={`w-5 h-5 ${tierInfo.color}`} />
            <h3 className="font-semibold text-gray-900">
              {tierInfo.icon} {tierInfo.name} Member Benefits
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Regular Price:</span>
              <span className="text-sm line-through text-gray-400">
                ${originalPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sale Price:</span>
              <span className="text-sm line-through text-gray-400">
                ${currentPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-medium text-gray-900">Your VIP Price:</span>
              <span className={`text-lg font-bold ${tierInfo.color}`}>
                ${vipPricing.vipPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Additional VIP Savings:</span>
              <span className="text-sm font-semibold text-green-600">
                ${additionalSavings.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">Total Savings:</span>
              <span className="text-sm font-bold text-green-600">
                ${totalSavings.toFixed(2)} ({vipPricing.discountPercent}% off)
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If user is not VIP, show upgrade benefits
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Unlock VIP Pricing
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Get exclusive discounts and premium benefits
        </p>
        
        {onUpgrade && (
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to VIP
          </Button>
        )}
      </div>

      {/* VIP Tier Comparison */}
      <VIPTierComparison
        allTierPricing={allTierPricing}
        originalPrice={originalPrice}
        currentPrice={currentPrice}
        onUpgrade={onUpgrade}
      />
    </div>
  )
}

// VIP tier comparison component
interface VIPTierComparisonProps {
  allTierPricing: VIPPricingInfo[]
  originalPrice: number
  currentPrice: number
  onUpgrade?: () => void
}

function VIPTierComparison({
  allTierPricing,
  originalPrice,
  currentPrice,
  onUpgrade
}: VIPTierComparisonProps) {
  const getTierInfo = (tier: CustomerTier) => {
    const tierConfig = {
      bronze: { name: 'Bronze', icon: '🥉', color: 'text-amber-600' },
      silver: { name: 'Silver', icon: '🥈', color: 'text-gray-600' },
      gold: { name: 'Gold', icon: '🥇', color: 'text-yellow-600' },
      platinum: { name: 'Platinum', icon: '💎', color: 'text-purple-600' },
      vip: { name: 'VIP', icon: '👑', color: 'text-indigo-600' }
    }
    return tierConfig[tier]
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <Star className="w-4 h-4 text-burgundy" />
        VIP Tier Benefits
      </h4>
      
      <div className="grid gap-2">
        {allTierPricing.map((pricing) => {
          const tierInfo = getTierInfo(pricing.tier)
          const additionalSavings = currentPrice - pricing.vipPrice
          const isRecommended = pricing.tier === 'gold'

          return (
            <div
              key={pricing.tier}
              className={`
                flex items-center justify-between p-3 rounded-lg border
                ${isRecommended 
                  ? 'border-burgundy bg-burgundy/5 ring-1 ring-burgundy/20' 
                  : 'border-gray-200 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tierInfo.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${tierInfo.color}`}>
                      {tierInfo.name}
                    </span>
                    {isRecommended && (
                      <span className="text-xs bg-burgundy text-white px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pricing.discountPercent}% total discount
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-semibold ${tierInfo.color}`}>
                  ${pricing.vipPrice.toFixed(2)}
                </div>
                <div className="text-xs text-green-600">
                  +${additionalSavings.toFixed(2)} extra
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {onUpgrade && (
        <div className="text-center pt-2">
          <Button
            onClick={onUpgrade}
            variant="outline"
            size="sm"
            className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start Saving Today
          </Button>
        </div>
      )}
    </div>
  )
}

// Simplified VIP badge for product cards
export function VIPPriceBadge({
  customerTier,
  additionalDiscount
}: {
  customerTier: CustomerTier
  additionalDiscount: number
}) {
  const tierInfo = {
    bronze: { icon: '🥉', color: 'bg-amber-100 text-amber-800' },
    silver: { icon: '🥈', color: 'bg-gray-100 text-gray-800' },
    gold: { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' },
    platinum: { icon: '💎', color: 'bg-purple-100 text-purple-800' },
    vip: { icon: '👑', color: 'bg-indigo-100 text-indigo-800' }
  }

  const config = tierInfo[customerTier]

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
      ${config.color}
    `}>
      <span>{config.icon}</span>
      <span>+{additionalDiscount}% VIP</span>
    </div>
  )
}