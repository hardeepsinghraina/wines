'use client'

import React, { useState, useEffect } from 'react'
import { Package, TrendingDown, Star, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BulkPricingTier } from '../../../../shared/types/promotional-pricing'
import { PromotionalPricingAPI } from '@/lib/promotional-pricing-api'

interface BulkPricingDisplayProps {
  productId: string
  originalPrice: number
  currentQuantity?: number
  onQuantityChange?: (quantity: number) => void
  className?: string
}

export function BulkPricingDisplay({
  productId,
  originalPrice,
  currentQuantity = 1,
  onQuantityChange,
  className = ''
}: BulkPricingDisplayProps) {
  const [bulkTiers, setBulkTiers] = useState<BulkPricingTier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<BulkPricingTier | null>(null)

  useEffect(() => {
    const fetchBulkPricing = async () => {
      try {
        const tiers = await PromotionalPricingAPI.getBulkPricing(productId, originalPrice)
        setBulkTiers(tiers)
        
        // Find the tier that matches current quantity
        const matchingTier = tiers.find(tier => 
          currentQuantity >= tier.minQuantity && 
          (!tier.maxQuantity || currentQuantity <= tier.maxQuantity)
        )
        setSelectedTier(matchingTier || null)
      } catch (error) {
        console.error('Failed to fetch bulk pricing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBulkPricing()
  }, [productId, originalPrice, currentQuantity])

  const handleTierSelect = (tier: BulkPricingTier) => {
    setSelectedTier(tier)
    onQuantityChange?.(tier.minQuantity)
  }

  const calculateSavings = (tier: BulkPricingTier, quantity: number) => {
    const regularTotal = originalPrice * quantity
    const discountedTotal = tier.unitPrice * quantity
    return regularTotal - discountedTotal
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (bulkTiers.length === 0) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-burgundy" />
        <h3 className="text-lg font-semibold text-gray-900">
          Bulk Pricing
        </h3>
        <span className="text-sm text-gray-500">
          Save more when you buy more
        </span>
      </div>

      {/* Bulk Pricing Tiers */}
      <div className="grid gap-3">
        {bulkTiers.map((tier, index) => {
          const isSelected = selectedTier?.id === tier.id
          const isRecommended = index === 1 // Middle tier is recommended
          const quantity = tier.minQuantity
          const totalSavings = calculateSavings(tier, quantity)
          const savingsPercent = Math.round((totalSavings / (originalPrice * quantity)) * 100)

          return (
            <div
              key={tier.id}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-burgundy bg-burgundy/5' 
                  : 'border-gray-200 hover:border-burgundy/50 hover:bg-gray-50'
                }
                ${isRecommended ? 'ring-2 ring-green-200' : ''}
              `}
              onClick={() => handleTierSelect(tier)}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Best Value
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Tier Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {tier.tierName}
                    </h4>
                    <span className="text-sm text-gray-500">
                      ({tier.minQuantity}{tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} bottles)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Price per bottle:</span>
                      <span className="ml-1 font-semibold text-burgundy">
                        ${tier.unitPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-medium">
                        {tier.discountPercent}% off
                      </span>
                    </div>
                  </div>
                </div>

                {/* Savings Display */}
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    Save ${totalSavings.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    vs. regular price
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Total for {quantity} bottles:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through">
                      ${(originalPrice * quantity).toFixed(2)}
                    </span>
                    <span className="text-lg font-bold text-burgundy">
                      ${(tier.unitPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bulk Pricing Calculator */}
      <BulkPricingCalculator
        tiers={bulkTiers}
        originalPrice={originalPrice}
        currentQuantity={currentQuantity}
        onQuantityChange={onQuantityChange}
      />
    </div>
  )
}

// Bulk pricing calculator component
interface BulkPricingCalculatorProps {
  tiers: BulkPricingTier[]
  originalPrice: number
  currentQuantity: number
  onQuantityChange?: (quantity: number) => void
}

function BulkPricingCalculator({
  tiers,
  originalPrice,
  currentQuantity,
  onQuantityChange
}: BulkPricingCalculatorProps) {
  const [quantity, setQuantity] = useState(currentQuantity)

  const getCurrentTier = (qty: number) => {
    return tiers.find(tier => 
      qty >= tier.minQuantity && 
      (!tier.maxQuantity || qty <= tier.maxQuantity)
    )
  }

  const currentTier = getCurrentTier(quantity)
  const regularTotal = originalPrice * quantity
  const discountedTotal = currentTier ? currentTier.unitPrice * quantity : regularTotal
  const savings = regularTotal - discountedTotal
  const savingsPercent = regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    onQuantityChange?.(newQuantity)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-burgundy" />
        <h4 className="font-medium text-gray-900">
          Bulk Pricing Calculator
        </h4>
      </div>

      <div className="space-y-3">
        {/* Quantity Input */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 min-w-0">
            Quantity:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
          />
          <span className="text-sm text-gray-500">bottles</span>
        </div>

        {/* Current Tier */}
        {currentTier && (
          <div className="text-sm text-burgundy font-medium">
            🎯 {currentTier.tierName} tier ({currentTier.discountPercent}% off)
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Regular price:</span>
            <span className="line-through text-gray-400">
              ${regularTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bulk price:</span>
            <span className="font-semibold text-burgundy">
              ${discountedTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="font-medium text-green-600">You save:</span>
            <span className="font-bold text-green-600">
              ${savings.toFixed(2)} ({savingsPercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}