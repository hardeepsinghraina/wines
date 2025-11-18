'use client'

import React, { useState } from 'react'
import { 
  X, 
  Plus, 
  Star, 
  Award, 
  Package, 
  Clock, 
  Crown,
  ChevronDown,
  ChevronUp,
  Heart,
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Wine } from '@/types/wine'

interface PremiumProductComparisonProps {
  wines: Wine[]
  onRemoveWine?: (wineId: string) => void
  onAddWine?: () => void
  onAddToWishlist?: (wineId: string) => void
  className?: string
}

interface ComparisonAttribute {
  key: string
  label: string
  getValue: (wine: Wine) => string | number | undefined
  format?: (value: any) => string
}

export function PremiumProductComparison({
  wines,
  onRemoveWine,
  onAddWine,
  onAddToWishlist,
  className = ''
}: PremiumProductComparisonProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'pricing'])
  const [selectedWines, setSelectedWines] = useState<string[]>([])

  const comparisonAttributes: ComparisonAttribute[] = [
    {
      key: 'name',
      label: 'Wine Name',
      getValue: (wine) => wine.name
    },
    {
      key: 'producer',
      label: 'Producer',
      getValue: (wine) => wine.producer || 'N/A'
    },
    {
      key: 'region',
      label: 'Region',
      getValue: (wine) => wine.region
    },
    {
      key: 'vintage',
      label: 'Vintage',
      getValue: (wine) => wine.vintage
    },
    {
      key: 'category',
      label: 'Category',
      getValue: (wine) => wine.category || 'N/A'
    },
    {
      key: 'alcoholContent',
      label: 'Alcohol Content',
      getValue: (wine) => wine.alcoholContent || wine.specification?.alcoholContent,
      format: (value) => value ? `${value}%` : 'N/A'
    },
    {
      key: 'bottleSize',
      label: 'Bottle Size',
      getValue: (wine) => wine.bottleSize || '750ml'
    },
    {
      key: 'price',
      label: 'Price (USD)',
      getValue: (wine) => wine.price,
      format: (value) => `$${value?.toFixed(2) || 'N/A'}`
    },
    {
      key: 'stock',
      label: 'Stock',
      getValue: (wine) => wine.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reservedQty, 0) || wine.stock,
      format: (value) => `${value || 0} available`
    },
    {
      key: 'rating',
      label: 'Average Rating',
      getValue: (wine) => {
        const reviews = wine.reviews || [];
        return reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
      },
      format: (value) => value ? `${value.toFixed(1)}/5` : 'No ratings'
    },
    {
      key: 'reviews',
      label: 'Review Count',
      getValue: (wine) => wine.reviews?.length || 0,
      format: (value) => `${value} reviews`
    }
  ]

  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      attributes: comparisonAttributes.slice(0, 7)
    },
    {
      id: 'pricing',
      title: 'Pricing & Availability',
      attributes: comparisonAttributes.slice(7, 9)
    },
    {
      id: 'ratings',
      title: 'Ratings & Reviews',
      attributes: comparisonAttributes.slice(9)
    }
  ]

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const toggleWineSelection = (wineId: string) => {
    setSelectedWines(prev => 
      prev.includes(wineId)
        ? prev.filter(id => id !== wineId)
        : [...prev, wineId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getWineRating = (wine: Wine) => {
    if (!wine.reviews || wine.reviews.length === 0) return 0
    return wine.reviews.reduce((sum, review) => sum + review.rating, 0) / wine.reviews.length
  }

  if (wines.length === 0) {
    return (
      <div className={`premium-comparison-empty ${className}`}>
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No wines to compare
            </h3>
            <p className="text-gray-600 mb-6">
              Add wines to your comparison to see detailed side-by-side analysis
            </p>
            {onAddWine && (
              <Button onClick={onAddWine} className="bg-burgundy hover:bg-burgundy/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Wines to Compare
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={`premium-product-comparison ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Wine Comparison</h2>
          <p className="text-muted-olive">Compare up to 4 premium wines side by side</p>
        </div>
        {onAddWine && wines.length < 4 && (
          <Button 
            onClick={onAddWine}
            variant="outline"
            className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wine
          </Button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Wine Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border-b border-gray-200">
          {wines.map((wine, index) => (
            <div key={wine.id} className="p-6 border-r border-gray-200 last:border-r-0">
              {/* Remove Button */}
              {onRemoveWine && (
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveWine(wine.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Wine Image */}
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                <WineImage
                  src={wine.images?.find(img => img.isPrimary)?.url || wine.imageUrl}
                  alt={wine.name}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Wine Basic Info */}
              <div className="text-center">
                <h3 className="font-semibold text-charcoal-black text-sm mb-1 line-clamp-2">
                  {wine.name}
                </h3>
                <p className="text-xs text-muted-olive mb-2">
                  {wine.producer} • {wine.vintage}
                </p>
                
                {/* Rating */}
                {wine.reviews && wine.reviews.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(getWineRating(wine))
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
                  <span className="text-lg font-bold text-burgundy">
                    {formatPrice(wine.price)}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <AddToCartButton
                    wineId={wine.id}
                    size="sm"
                    className="w-full"
                  />
                  {onAddToWishlist && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddToWishlist(wine.id)}
                      className="w-full border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Wishlist
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Sections */}
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 last:border-b-0">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <h4 className="font-semibold text-charcoal-black">{section.title}</h4>
              {expandedSections.includes(section.id) ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Section Content */}
            {expandedSections.includes(section.id) && (
              <div className="divide-y divide-gray-100">
                {section.attributes.map((attribute) => (
                  <div key={attribute.key} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
                    {/* Attribute Label */}
                    <div className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-1 px-6 py-3 bg-gray-50 border-r border-gray-200">
                      <span className="font-medium text-sm text-charcoal-black">
                        {attribute.label}
                      </span>
                    </div>
                    
                    {/* Attribute Values */}
                    {wines.map((wine, index) => (
                      <div 
                        key={wine.id} 
                        className="px-6 py-3 border-r border-gray-200 last:border-r-0"
                      >
                        <span className="text-sm text-muted-olive">
                          {attribute.format 
                            ? attribute.format(attribute.getValue(wine))
                            : attribute.getValue(wine) || 'N/A'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Summary */}
      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Best Value */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Best Value
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(() => {
              const bestValue = wines.reduce((best, wine) => {
                const rating = getWineRating(wine)
                const valueScore = rating / wine.price * 1000
                const bestScore = getWineRating(best) / best.price * 1000
                return valueScore > bestScore ? wine : best
              })
              return (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <WineImage
                      src={bestValue.images?.find(img => img.isPrimary)?.url || bestValue.imageUrl}
                      alt={bestValue.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-charcoal-black line-clamp-1">
                      {bestValue.name}
                    </p>
                    <p className="text-xs text-muted-olive">
                      {formatPrice(bestValue.price)}
                    </p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Highest Rated */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Highest Rated
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(() => {
              const highestRated = wines.reduce((best, wine) => {
                const rating = getWineRating(wine)
                const bestRating = getWineRating(best)
                return rating > bestRating ? wine : best
              })
              return (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <WineImage
                      src={highestRated.images?.find(img => img.isPrimary)?.url || highestRated.imageUrl}
                      alt={highestRated.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-charcoal-black line-clamp-1">
                      {highestRated.name}
                    </p>
                    <p className="text-xs text-muted-olive">
                      {getWineRating(highestRated).toFixed(1)}/5 stars
                    </p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Most Premium */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Most Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(() => {
              const mostPremium = wines.reduce((best, wine) => 
                wine.price > best.price ? wine : best
              )
              return (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <WineImage
                      src={mostPremium.images?.find(img => img.isPrimary)?.url || mostPremium.imageUrl}
                      alt={mostPremium.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-charcoal-black line-clamp-1">
                      {mostPremium.name}
                    </p>
                    <p className="text-xs text-muted-olive">
                      {formatPrice(mostPremium.price)}
                    </p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}