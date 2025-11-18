'use client'

import React, { useState } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PromotionalPricingAPI } from '@/lib/promotional-pricing-api'
import { ApplyDiscountResponse } from '../../../../shared/types/promotional-pricing'

interface DiscountCodeInputProps {
  cartItems: Array<{
    productId: string
    quantity: number
    price: number
  }>
  onDiscountApplied: (discount: ApplyDiscountResponse) => void
  onDiscountRemoved: () => void
  className?: string
}

export function DiscountCodeInput({
  cartItems,
  onDiscountApplied,
  onDiscountRemoved,
  className = ''
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<ApplyDiscountResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApplyCode = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await PromotionalPricingAPI.applyDiscount({
        code: code.trim().toUpperCase(),
        cartItems
      })

      if (result.success) {
        setAppliedDiscount(result)
        onDiscountApplied(result)
        setCode('')
      } else {
        setError(result.error || 'Invalid discount code')
      }
    } catch (err) {
      setError('Failed to apply discount code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setError(null)
    onDiscountRemoved()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCode()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Applied Discount Display */}
      {appliedDiscount && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {appliedDiscount.appliedDiscountCode?.name || 'Discount Applied'}
              </p>
              <p className="text-xs text-green-600">
                You saved ${appliedDiscount.savings.toFixed(2)}!
              </p>
            </div>
          </div>
          <Button
            onClick={handleRemoveDiscount}
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Discount Code Input */}
      {!appliedDiscount && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter discount code"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleApplyCode}
              disabled={!code.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <X className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Popular Codes Suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Popular codes:</p>
            <div className="flex flex-wrap gap-2">
              {['WELCOME10', 'FLASH5', 'VIP15', 'BULK20'].map((suggestedCode) => (
                <button
                  key={suggestedCode}
                  onClick={() => setCode(suggestedCode)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
                  disabled={isLoading}
                >
                  {suggestedCode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified version for checkout page
export function CheckoutDiscountCode({
  cartItems,
  onDiscountApplied,
  onDiscountRemoved
}: DiscountCodeInputProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Have a discount code?
      </h3>
      <DiscountCodeInput
        cartItems={cartItems}
        onDiscountApplied={onDiscountApplied}
        onDiscountRemoved={onDiscountRemoved}
      />
    </div>
  )
}

// Cart page version with expanded features
export function CartDiscountCode({
  cartItems,
  onDiscountApplied,
  onDiscountRemoved
}: DiscountCodeInputProps) {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-burgundy" />
        <h3 className="text-sm font-medium text-gray-900">
          Discount Code
        </h3>
      </div>
      <DiscountCodeInput
        cartItems={cartItems}
        onDiscountApplied={onDiscountApplied}
        onDiscountRemoved={onDiscountRemoved}
      />
    </div>
  )
}