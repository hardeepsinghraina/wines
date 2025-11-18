'use client'

import { useState, useEffect, useCallback } from 'react'
import { PromotionalPricingAPI } from '@/lib/promotional-pricing-api'
import {
  PromotionalPricingResponse,
  BulkPricingTier,
  ApplyDiscountResponse,
  CustomerTier
} from '../../../shared/types/promotional-pricing'

interface UsePromotionalPricingProps {
  productId: string
  originalPrice: number
  customerTier?: CustomerTier
  quantity?: number
}

export function usePromotionalPricing({
  productId,
  originalPrice,
  customerTier,
  quantity = 1
}: UsePromotionalPricingProps) {
  const [pricing, setPricing] = useState<PromotionalPricingResponse | null>(null)
  const [bulkPricing, setBulkPricing] = useState<BulkPricingTier[]>([])
  const [vipPricing, setVipPricing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch promotional pricing
  const fetchPricing = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [pricingData, bulkData, vipData] = await Promise.all([
        PromotionalPricingAPI.getPromotionalPricing(productId, customerTier, quantity),
        PromotionalPricingAPI.getBulkPricing(productId, originalPrice),
        customerTier 
          ? PromotionalPricingAPI.getVIPPricing(productId, customerTier, originalPrice)
          : Promise.resolve(null)
      ])

      setPricing(pricingData)
      setBulkPricing(bulkData)
      setVipPricing(vipData)
    } catch (err) {
      setError('Failed to fetch promotional pricing')
      console.error('Promotional pricing error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [productId, originalPrice, customerTier, quantity])

  useEffect(() => {
    fetchPricing()
  }, [fetchPricing])

  // Calculate best price based on quantity and customer tier
  const getBestPrice = useCallback((qty: number = quantity) => {
    if (!pricing) return originalPrice

    let bestPrice = pricing.currentPrice

    // Check bulk pricing
    const applicableBulkTier = bulkPricing.find(tier => 
      qty >= tier.minQuantity && (!tier.maxQuantity || qty <= tier.maxQuantity)
    )
    if (applicableBulkTier) {
      bestPrice = Math.min(bestPrice, applicableBulkTier.unitPrice)
    }

    // Check VIP pricing
    if (vipPricing && customerTier) {
      bestPrice = Math.min(bestPrice, vipPricing.vipPrice)
    }

    return bestPrice
  }, [pricing, bulkPricing, vipPricing, customerTier, quantity, originalPrice])

  // Calculate total savings
  const getTotalSavings = useCallback((qty: number = quantity) => {
    const bestPrice = getBestPrice(qty)
    return (originalPrice - bestPrice) * qty
  }, [getBestPrice, originalPrice, quantity])

  // Calculate discount percentage
  const getDiscountPercent = useCallback((qty: number = quantity) => {
    const bestPrice = getBestPrice(qty)
    return Math.round(((originalPrice - bestPrice) / originalPrice) * 100)
  }, [getBestPrice, originalPrice, quantity])

  // Get applicable bulk tier for quantity
  const getBulkTier = useCallback((qty: number = quantity) => {
    return bulkPricing.find(tier => 
      qty >= tier.minQuantity && (!tier.maxQuantity || qty <= tier.maxQuantity)
    )
  }, [bulkPricing, quantity])

  // Check if stock is scarce
  const isStockScarce = useCallback(() => {
    return pricing?.stockScarcity?.isLow || false
  }, [pricing])

  // Get urgency message
  const getUrgencyMessage = useCallback(() => {
    return pricing?.urgencyMessage || null
  }, [pricing])

  // Apply discount code
  const applyDiscountCode = useCallback(async (
    code: string,
    cartItems: Array<{ productId: string; quantity: number; price: number }>
  ): Promise<ApplyDiscountResponse> => {
    try {
      return await PromotionalPricingAPI.applyDiscount({
        code,
        cartItems,
        customerTier
      })
    } catch (error) {
      throw new Error('Failed to apply discount code')
    }
  }, [customerTier])

  return {
    // Data
    pricing,
    bulkPricing,
    vipPricing,
    
    // Loading states
    isLoading,
    error,
    
    // Computed values
    getBestPrice,
    getTotalSavings,
    getDiscountPercent,
    getBulkTier,
    isStockScarce,
    getUrgencyMessage,
    
    // Actions
    applyDiscountCode,
    refetch: fetchPricing
  }
}

// Hook for cart-level promotional pricing
interface UseCartPromotionalPricingProps {
  cartItems: Array<{
    productId: string
    quantity: number
    price: number
    originalPrice?: number
  }>
  customerTier?: CustomerTier
}

export function useCartPromotionalPricing({
  cartItems,
  customerTier
}: UseCartPromotionalPricingProps) {
  const [appliedDiscount, setAppliedDiscount] = useState<ApplyDiscountResponse | null>(null)
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const originalCartTotal = cartItems.reduce((sum, item) => 
    sum + ((item.originalPrice || item.price) * item.quantity), 0
  )

  // Apply discount code
  const applyDiscountCode = useCallback(async (code: string) => {
    try {
      setIsApplyingDiscount(true)
      const result = await PromotionalPricingAPI.applyDiscount({
        code,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        customerTier
      })
      
      if (result.success) {
        setAppliedDiscount(result)
      }
      
      return result
    } catch (error) {
      throw new Error('Failed to apply discount code')
    } finally {
      setIsApplyingDiscount(false)
    }
  }, [cartItems, customerTier])

  // Remove applied discount
  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null)
  }, [])

  // Calculate final totals with discount
  const finalTotal = appliedDiscount ? appliedDiscount.discountedTotal : cartTotal
  const totalSavings = appliedDiscount ? appliedDiscount.savings : (originalCartTotal - cartTotal)

  return {
    // Totals
    cartTotal,
    originalCartTotal,
    finalTotal,
    totalSavings,
    
    // Discount state
    appliedDiscount,
    isApplyingDiscount,
    
    // Actions
    applyDiscountCode,
    removeDiscount
  }
}