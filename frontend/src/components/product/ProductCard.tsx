'use client'

import React from 'react'
import Link from 'next/link'
import { Star, Heart, Clock, Package } from 'lucide-react'
import { Wine } from '@/types/wine'
import { AddToCartButton } from '@/components/cart'
import { Button } from '@/components/ui/Button'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { usePromotionalPricing } from '@/hooks/usePromotionalPricing'
import { StockScarcityIndicator, VIPPriceBadge } from '@/components/promotional'

interface ProductCardProps {
  wine: Wine
  customerTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip'
  className?: string
}

export function ProductCard({ wine, customerTier, className = '' }: ProductCardProps) {
  const primaryImage = wine.images?.find(img => img.isPrimary) || wine.images?.[0]
  const availableQuantity = wine.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reservedQty, 0) || wine.stock || 0
  const isInStock = availableQuantity > 0

  // Use promotional pricing hook
  const {
    pricing,
    isLoading: pricingLoading,
    getBestPrice,
    getDiscountPercent,
    getTotalSavings,
    isStockScarce,
    getUrgencyMessage
  } = usePromotionalPricing({
    productId: wine.id,
    originalPrice: (wine as any).originalPrice || 0,
    customerTier,
    quantity: 1
  })

  const originalPrice = (wine as any).originalPrice || 0
  const currentPrice = pricing?.currentPrice || (wine as any).currentPrice || 0
  const bestPrice = getBestPrice()
  const discountPercent = getDiscountPercent()
  const savings = getTotalSavings()
  const urgencyMessage = getUrgencyMessage()

  return (
    <div className={`group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 ${className}`}>
      {/* Wine Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link href={`/products/${wine.id}`}>
          <WineImage
            src={primaryImage?.url || wine.imageUrl}
            alt={primaryImage?.altText || wine.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              {discountPercent}% OFF
            </span>
          )}
          {wine.isFeatured && (
            <span className="bg-burgundy text-white text-xs px-2 py-1 rounded-full font-medium">
              Featured
            </span>
          )}
          {wine.isNftAvailable && (
            <span className="bg-sapphire text-white text-xs px-2 py-1 rounded-full font-medium">
              NFT
            </span>
          )}
          {(wine as any).isLimitedEdition === true && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              Limited Edition
            </span>
          )}
          {!isInStock && (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* Wine Details */}
      <div className="p-4">
        <div className="mb-2">
          <Link href={`/products/${wine.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-burgundy transition-colors duration-200 line-clamp-2">
              {wine.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-600 mt-1">
            {wine.producer || 'Premium Producer'} • {wine.vintage}
          </p>
          <p className="text-xs text-gray-500">
            {wine.region} • {wine.bottleSize || '750ml'}
          </p>
        </div>

        {/* Rating */}
        {wine.reviews && wine.reviews.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round((wine.reviews?.reduce((sum, r) => sum + r.rating, 0) || 0) / (wine.reviews?.length || 1))
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({wine.reviews.length})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            {originalPrice > currentPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-burgundy">
              ${bestPrice.toFixed(2)}
            </span>
            {customerTier && bestPrice < currentPrice && (
              <VIPPriceBadge 
                customerTier={customerTier} 
                additionalDiscount={Math.round(((currentPrice - bestPrice) / currentPrice) * 100)} 
              />
            )}
          </div>
          
          {savings > 0 && (
            <p className="text-xs text-green-600 font-medium mt-1">
              💰 You save ${savings.toFixed(2)}!
            </p>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            💰 Crypto payments available
          </p>
          
          {urgencyMessage && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-orange-600 font-medium">
                {urgencyMessage}
              </p>
            </div>
          )}
        </div>

        {/* Stock Status and Scarcity */}
        <div className="mb-3 space-y-2">
          {isInStock ? (
            <>
              {isStockScarce() ? (
                <StockScarcityIndicator
                  stock={availableQuantity}
                  threshold={10}
                  showExactCount={true}
                  className="text-xs"
                />
              ) : (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  In stock ({availableQuantity} available)
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-red-600">
              ✗ Out of stock
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <AddToCartButton
            wineId={wine.id}
            variant="primary"
            size="sm"
            className="w-full"
            disabled={!isInStock}
          />
          
          <Link href={`/products/${wine.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}