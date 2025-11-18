'use client'

import React, { useState, useEffect } from 'react'
import { 
  User, 
  Star, 
  Wine, 
  Utensils, 
  Clock, 
  ThermometerSun,
  Award,
  Heart,
  ChevronRight,
  Sparkles,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { Wine as WineType } from '@/types/wine'

interface VirtualSommelierRecommendationsProps {
  currentWine: WineType
  recommendations?: WineType[]
  onWineSelect?: (wine: WineType) => void
  onAddToWishlist?: (wineId: string) => void
  className?: string
}

interface SommelierInsight {
  id: string
  type: 'pairing' | 'serving' | 'aging' | 'occasion' | 'story' | 'technical'
  title: string
  content: string
  icon: React.ComponentType<any>
  priority: number
}

interface RecommendationReason {
  type: 'similar_style' | 'price_range' | 'region' | 'vintage' | 'rating' | 'trending'
  label: string
  confidence: number
}

export function VirtualSommelierRecommendations({
  currentWine,
  recommendations = [],
  onWineSelect,
  onAddToWishlist,
  className = ''
}: VirtualSommelierRecommendationsProps) {
  const [activeInsight, setActiveInsight] = useState<string>('pairing')
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)

  // Generate sommelier insights based on wine characteristics
  const generateInsights = (wine: WineType): SommelierInsight[] => {
    const insights: SommelierInsight[] = []

    // Food Pairing Insight
    insights.push({
      id: 'pairing',
      type: 'pairing',
      title: 'Perfect Food Pairings',
      content: wine.specification?.foodPairing || generateFoodPairing(wine),
      icon: Utensils,
      priority: 1
    })

    // Serving Insight
    insights.push({
      id: 'serving',
      type: 'serving',
      title: 'Optimal Serving',
      content: `Serve at ${wine.specification?.servingTemp || getOptimalServingTemp(wine)}. Decant for ${getDecantingTime(wine)} to fully appreciate its complexity.`,
      icon: ThermometerSun,
      priority: 2
    })

    // Aging Potential
    insights.push({
      id: 'aging',
      type: 'aging',
      title: 'Aging Potential',
      content: generateAgingAdvice(wine),
      icon: Clock,
      priority: 3
    })

    // Occasion Recommendation
    insights.push({
      id: 'occasion',
      type: 'occasion',
      title: 'Perfect Occasions',
      content: generateOccasionAdvice(wine),
      icon: Calendar,
      priority: 4
    })

    // Wine Story
    insights.push({
      id: 'story',
      type: 'story',
      title: 'The Story Behind',
      content: generateWineStory(wine),
      icon: BookOpen,
      priority: 5
    })

    // Technical Notes
    insights.push({
      id: 'technical',
      type: 'technical',
      title: 'Technical Excellence',
      content: generateTechnicalNotes(wine),
      icon: Award,
      priority: 6
    })

    return insights.sort((a, b) => a.priority - b.priority)
  }

  const generateFoodPairing = (wine: WineType): string => {
    const region = wine.region?.toLowerCase() || ''
    const category = wine.category?.toLowerCase() || ''
    
    if (region.includes('bordeaux') || category.includes('bordeaux')) {
      return 'Exceptional with grilled lamb, aged beef, and rich game dishes. The tannin structure complements protein beautifully. Try with roasted duck breast or mature cheeses like Roquefort.'
    }
    if (region.includes('burgundy') || category.includes('burgundy')) {
      return 'Divine with roasted chicken, salmon, or mushroom risotto. The elegant acidity pairs wonderfully with creamy sauces and earthy flavors. Perfect with coq au vin or truffle dishes.'
    }
    if (region.includes('champagne') || category.includes('champagne')) {
      return 'Sublime with oysters, caviar, and delicate seafood. The effervescence cleanses the palate between bites. Excellent as an aperitif or with light appetizers.'
    }
    
    return 'Versatile pairing wine that complements a wide range of dishes. Excellent with grilled meats, aged cheeses, and sophisticated cuisine. The balanced profile makes it perfect for special occasions.'
  }

  const getOptimalServingTemp = (wine: WineType): string => {
    const category = wine.category?.toLowerCase() || ''
    
    if (category.includes('champagne')) return '6-8°C (43-46°F)'
    if (category.includes('burgundy') && wine.name.toLowerCase().includes('chardonnay')) return '10-12°C (50-54°F)'
    if (category.includes('burgundy')) return '14-16°C (57-61°F)'
    if (category.includes('bordeaux')) return '16-18°C (61-64°F)'
    
    return '16-18°C (61-64°F)'
  }

  const getDecantingTime = (wine: WineType): string => {
    const age = new Date().getFullYear() - wine.vintage
    
    if (age < 5) return '30-60 minutes'
    if (age < 10) return '1-2 hours'
    if (age < 20) return '2-3 hours'
    
    return '3-4 hours'
  }

  const generateAgingAdvice = (wine: WineType): string => {
    const age = new Date().getFullYear() - wine.vintage
    const category = wine.category?.toLowerCase() || ''
    
    if (category.includes('champagne')) {
      return 'This champagne is at its peak now but can age gracefully for another 5-10 years, developing more complex brioche and honey notes.'
    }
    
    if (age < 5) {
      return 'This wine is still young and will benefit from 5-15 years of proper cellaring. Store in a cool, dark place at 12-14°C with 70% humidity.'
    }
    
    if (age < 15) {
      return 'Approaching its drinking window. Can be enjoyed now or cellared for another 5-10 years for additional complexity and integration.'
    }
    
    return 'This mature wine is ready to drink now. Its tertiary flavors have developed beautifully, offering a complex and rewarding tasting experience.'
  }

  const generateOccasionAdvice = (wine: WineType): string => {
    const price = wine.price || 0
    const category = wine.category?.toLowerCase() || ''
    
    if (price > 500) {
      return 'A wine for the most special occasions - anniversaries, milestone celebrations, or important business dinners. This is a wine that creates lasting memories.'
    }
    
    if (category.includes('champagne')) {
      return 'Perfect for celebrations, toasts, and festive gatherings. Ideal for weddings, New Year\'s Eve, or any moment worth commemorating.'
    }
    
    if (price > 200) {
      return 'Excellent for romantic dinners, important celebrations, or when entertaining distinguished guests. A wine that shows sophistication and appreciation for quality.'
    }
    
    return 'Versatile enough for both casual enjoyment and special occasions. Perfect for dinner parties, date nights, or when you want to treat yourself to something exceptional.'
  }

  const generateWineStory = (wine: WineType): string => {
    const region = wine.region || ''
    const producer = wine.producer || ''
    
    return `From the prestigious ${region} region, this wine represents generations of winemaking expertise. ${producer} has crafted this exceptional vintage with meticulous attention to detail, reflecting the unique terroir and climate of ${wine.vintage}. Each bottle tells the story of that year's harvest, capturing the essence of the vineyard in liquid form.`
  }

  const generateTechnicalNotes = (wine: WineType): string => {
    const alcohol = wine.alcoholContent || wine.specification?.alcoholContent || 13.5
    
    return `Alcohol: ${alcohol}%. The wine shows excellent balance between fruit concentration and acidity. The tannin structure is well-integrated, providing both elegance and aging potential. Fermentation and aging techniques have been carefully selected to preserve the wine's natural character while adding complexity.`
  }

  const getRecommendationReason = (wine: WineType): RecommendationReason => {
    const reasons: RecommendationReason[] = [
      { type: 'similar_style', label: 'Similar Style', confidence: 85 },
      { type: 'price_range', label: 'Similar Price Range', confidence: 78 },
      { type: 'region', label: 'Same Region', confidence: 92 },
      { type: 'vintage', label: 'Comparable Vintage', confidence: 70 },
      { type: 'rating', label: 'Highly Rated', confidence: 88 },
      { type: 'trending', label: 'Trending Choice', confidence: 65 }
    ]
    
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  const insights = generateInsights(currentWine)
  const activeInsightData = insights.find(insight => insight.id === activeInsight)
  const displayedRecommendations = showAllRecommendations ? recommendations : recommendations.slice(0, 3)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className={`virtual-sommelier-recommendations ${className}`}>
      {/* Sommelier Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-burgundy to-burgundy/80 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Virtual Sommelier
          </h2>
          <p className="text-muted-olive">Expert insights and personalized recommendations</p>
        </div>
      </div>

      {/* Sommelier Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-burgundy" />
            Expert Insights for {currentWine.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Insight Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {insights.map((insight) => (
              <Button
                key={insight.id}
                variant={activeInsight === insight.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveInsight(insight.id)}
                className={`flex items-center gap-2 ${
                  activeInsight === insight.id 
                    ? 'bg-burgundy hover:bg-burgundy/90' 
                    : 'border-burgundy text-burgundy hover:bg-burgundy hover:text-white'
                }`}
              >
                <insight.icon className="w-4 h-4" />
                {insight.title}
              </Button>
            ))}
          </div>

          {/* Active Insight Content */}
          {activeInsightData && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-burgundy/10 rounded-lg flex items-center justify-center">
                  <activeInsightData.icon className="w-6 h-6 text-burgundy" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal-black mb-2">
                    {activeInsightData.title}
                  </h3>
                  <p className="text-muted-olive leading-relaxed">
                    {activeInsightData.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wine Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-burgundy" />
              Sommelier Recommendations
            </CardTitle>
            <p className="text-sm text-muted-olive">
              Wines selected based on your current choice and preferences
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRecommendations.map((wine) => {
                const reason = getRecommendationReason(wine)
                const reviews = wine.reviews || [];
                const rating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
                
                return (
                  <div key={wine.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                    {/* Wine Image */}
                    <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                      <WineImage
                        src={wine.images?.find(img => img.isPrimary)?.url || wine.imageUrl}
                        alt={wine.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Recommendation Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-burgundy text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {reason.confidence}% Match
                        </div>
                      </div>

                      {/* Wishlist Button */}
                      {onAddToWishlist && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddToWishlist(wine.id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Wine Details */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-charcoal-black text-sm mb-1 line-clamp-2">
                          {wine.name}
                        </h3>
                        <p className="text-xs text-muted-olive">
                          {wine.producer} • {wine.vintage}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{wine.region}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      {wine.reviews && wine.reviews.length > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(rating)
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

                      {/* Recommendation Reason */}
                      <div className="mb-3">
                        <div className="bg-burgundy/10 text-burgundy px-2 py-1 rounded text-xs font-medium inline-block">
                          {reason.label}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <span className="text-lg font-bold text-burgundy">
                          {formatPrice(wine.price)}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => onWineSelect?.(wine)}
                        className="w-full bg-burgundy hover:bg-burgundy/90 text-white flex items-center justify-center gap-2"
                        size="sm"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Show More Button */}
            {recommendations.length > 3 && !showAllRecommendations && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAllRecommendations(true)}
                  className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                >
                  Show All {recommendations.length} Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}