'use client'

import React, { useState, useEffect } from 'react'
import { 
  Crown, 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Eye, 
  Filter,
  Sparkles,
  Award,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  PremiumProductDetail,
  PremiumProductComparison,
  VirtualSommelierRecommendations,
  PremiumProductFilters,
  LuxuryBrandStorytelling,
  PremiumWishlistManager,
  PremiumAvailabilityNotifications
} from '@/components/product'
import { Wine, WineFilters } from '@/types/wine'

// Mock data for demonstration
const mockWine: Wine = {
  id: '1',
  name: 'Château Margaux 2015',
  description: 'An exceptional vintage from one of Bordeaux\'s most prestigious estates. This wine showcases the perfect harmony of power and elegance that defines great Margaux.',
  region: 'Margaux, Bordeaux',
  vintage: 2015,
  price: 899.99,
  currency: 'USD',
  stock: 12,
  isActive: true,
  isFeatured: true,
  imageUrl: undefined,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2024-01-15'),
  producer: 'Château Margaux',
  category: 'bordeaux',
  alcoholContent: 13.5,
  bottleSize: '750ml',
  tastingNotes: 'Complex aromas of blackcurrant, cedar, and violets. Full-bodied with silky tannins and a long, elegant finish.',
  isNftAvailable: true,
  images: [],
  prices: [
    { id: '1', currency: 'USD', price: 899.99 },
    { id: '2', currency: 'BTC', price: 0.025 },
    { id: '3', currency: 'ETH', price: 0.45 }
  ],
  inventory: [
    { id: '1', quantity: 12, reservedQty: 0 }
  ],
  reviews: [
    { id: '1', rating: 5, comment: 'Exceptional wine, worth every penny!' },
    { id: '2', rating: 5, comment: 'Perfect for special occasions.' },
    { id: '3', rating: 4, comment: 'Outstanding quality and presentation.' }
  ],
  specification: {
    grapeVariety: 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc',
    alcoholContent: 13.5,
    servingTemp: '16-18°C',
    tastingNotes: 'Complex aromas of blackcurrant, cedar, and violets. Full-bodied with silky tannins and a long, elegant finish.',
    foodPairing: 'Perfect with grilled lamb, aged beef, and rich game dishes.'
  }
}

const mockRecommendations: Wine[] = [
  {
    id: '2',
    name: 'Château Latour 2016',
    description: 'A powerful and structured wine from Pauillac.',
    region: 'Pauillac, Bordeaux',
    vintage: 2016,
    price: 1299.99,
    currency: 'USD',
    stock: 8,
    isActive: true,
    isFeatured: true,
    imageUrl: undefined,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2024-01-15'),
    producer: 'Château Latour',
    category: 'bordeaux',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    images: [],
    prices: [{ id: '4', currency: 'USD', price: 1299.99 }],
    inventory: [{ id: '2', quantity: 8, reservedQty: 0 }],
    reviews: [{ id: '4', rating: 5, comment: 'Magnificent structure and depth.' }]
  },
  {
    id: '3',
    name: 'Dom Pérignon 2012',
    description: 'The epitome of luxury champagne craftsmanship.',
    region: 'Champagne, France',
    vintage: 2012,
    price: 299.99,
    currency: 'USD',
    stock: 24,
    isActive: true,
    isFeatured: true,
    imageUrl: undefined,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-15'),
    producer: 'Dom Pérignon',
    category: 'champagne',
    alcoholContent: 12.5,
    bottleSize: '750ml',
    images: [],
    prices: [{ id: '5', currency: 'USD', price: 299.99 }],
    inventory: [{ id: '3', quantity: 24, reservedQty: 0 }],
    reviews: [{ id: '5', rating: 5, comment: 'Exceptional champagne for celebrations.' }]
  }
]

export default function PremiumShowcasePage() {
  const [activeDemo, setActiveDemo] = useState<string>('detail')
  const [filters, setFilters] = useState<WineFilters>({})
  const [comparisonWines, setComparisonWines] = useState<Wine[]>([mockWine, ...mockRecommendations])

  const demoSections = [
    { id: 'detail', title: 'Premium Product Detail', icon: Eye, description: 'Luxury product presentation with high-resolution galleries' },
    { id: 'comparison', title: 'Product Comparison', icon: Star, description: 'Side-by-side wine comparison with detailed analysis' },
    { id: 'sommelier', title: 'Virtual Sommelier', icon: Sparkles, description: 'AI-powered wine recommendations and expert insights' },
    { id: 'filters', title: 'Advanced Filters', icon: Filter, description: 'Premium filtering and search capabilities' },
    { id: 'storytelling', title: 'Brand Storytelling', icon: Award, description: 'Luxury brand heritage and wine journey narratives' },
    { id: 'wishlist', title: 'Wishlist Manager', icon: Heart, description: 'Premium wishlist with alerts and priority management' },
    { id: 'notifications', title: 'Smart Notifications', icon: Bell, description: 'Intelligent availability and price alerts' }
  ]

  const handleAddToWishlist = (wineId: string) => {
    console.log('Added to wishlist:', wineId)
  }

  const handleShare = (wine: Wine) => {
    console.log('Sharing wine:', wine.name)
  }

  const handleNotifyAvailability = (wineId: string) => {
    console.log('Setting availability notification for:', wineId)
  }

  const handleFiltersChange = (newFilters: WineFilters) => {
    setFilters(newFilters)
  }

  const handleSearch = (query: string) => {
    console.log('Searching for:', query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl font-bold text-charcoal-black">
                Premium Wine Experience
              </h1>
            </div>
            <p className="text-xl text-muted-olive max-w-3xl mx-auto">
              Discover our luxury wine platform features designed for discerning collectors and enthusiasts. 
              Experience the future of premium wine e-commerce.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Interactive Feature Showcase</CardTitle>
            <p className="text-center text-muted-olive">
              Explore each premium feature by clicking the sections below
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {demoSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeDemo === section.id ? 'primary' : 'outline'}
                  onClick={() => setActiveDemo(section.id)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${
                    activeDemo === section.id 
                      ? 'bg-burgundy hover:bg-burgundy/90 text-white' 
                      : 'border-burgundy text-burgundy hover:bg-burgundy hover:text-white'
                  }`}
                >
                  <section.icon className="w-6 h-6" />
                  <div>
                    <div className="font-semibold text-sm">{section.title}</div>
                    <div className="text-xs opacity-80 mt-1">{section.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Premium Product Detail Demo */}
          {activeDemo === 'detail' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Premium Product Detail Experience
                </h2>
                <p className="text-muted-olive">
                  Luxury product presentation with high-resolution image galleries, zoom functionality, and premium features
                </p>
              </div>
              <PremiumProductDetail
                wine={mockWine}
                onAddToWishlist={handleAddToWishlist}
                onShare={handleShare}
                onNotifyAvailability={handleNotifyAvailability}
              />
            </div>
          )}

          {/* Product Comparison Demo */}
          {activeDemo === 'comparison' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Premium Wine Comparison Tool
                </h2>
                <p className="text-muted-olive">
                  Compare up to 4 wines side-by-side with detailed analysis and recommendations
                </p>
              </div>
              <PremiumProductComparison
                wines={comparisonWines}
                onRemoveWine={(wineId) => setComparisonWines(prev => prev.filter(w => w.id !== wineId))}
                onAddWine={() => console.log('Add wine to comparison')}
                onAddToWishlist={handleAddToWishlist}
              />
            </div>
          )}

          {/* Virtual Sommelier Demo */}
          {activeDemo === 'sommelier' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Virtual Sommelier Experience
                </h2>
                <p className="text-muted-olive">
                  AI-powered wine recommendations with expert insights and personalized suggestions
                </p>
              </div>
              <VirtualSommelierRecommendations
                currentWine={mockWine}
                recommendations={mockRecommendations}
                onWineSelect={(wine) => console.log('Selected wine:', wine.name)}
                onAddToWishlist={handleAddToWishlist}
              />
            </div>
          )}

          {/* Advanced Filters Demo */}
          {activeDemo === 'filters' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Advanced Wine Filtering System
                </h2>
                <p className="text-muted-olive">
                  Sophisticated filtering and search capabilities for finding the perfect wine
                </p>
              </div>
              <PremiumProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                totalResults={156}
                isLoading={false}
              />
            </div>
          )}

          {/* Brand Storytelling Demo */}
          {activeDemo === 'storytelling' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Luxury Brand Storytelling
                </h2>
                <p className="text-muted-olive">
                  Immersive brand narratives and wine journey storytelling for premium engagement
                </p>
              </div>
              <LuxuryBrandStorytelling wine={mockWine} />
            </div>
          )}

          {/* Wishlist Manager Demo */}
          {activeDemo === 'wishlist' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Premium Wishlist Management
                </h2>
                <p className="text-muted-olive">
                  Advanced wishlist with priority management, price alerts, and smart notifications
                </p>
              </div>
              <PremiumWishlistManager
                wishlistItems={[
                  { ...mockWine, dateAdded: new Date(), priority: 'high' },
                  { ...mockRecommendations[0], dateAdded: new Date(Date.now() - 86400000), priority: 'medium' },
                  { ...mockRecommendations[1], dateAdded: new Date(Date.now() - 172800000), priority: 'low' }
                ]}
                onRemoveItem={(wineId) => console.log('Remove from wishlist:', wineId)}
                onUpdateItem={(wineId, updates) => console.log('Update wishlist item:', wineId, updates)}
                onAddToCart={(wineId, quantity) => console.log('Add to cart:', wineId, quantity)}
                onShare={handleShare}
                onSetPriceAlert={(wineId, price) => console.log('Set price alert:', wineId, price)}
                onToggleStockAlert={(wineId) => console.log('Toggle stock alert:', wineId)}
              />
            </div>
          )}

          {/* Smart Notifications Demo */}
          {activeDemo === 'notifications' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-charcoal-black mb-2">
                  Smart Availability Notifications
                </h2>
                <p className="text-muted-olive">
                  Intelligent alerts for stock availability, price changes, and exclusive offers
                </p>
              </div>
              <PremiumAvailabilityNotifications
                alerts={[
                  {
                    id: '1',
                    wineId: mockWine.id,
                    wine: mockWine,
                    type: 'price',
                    targetValue: 799.99,
                    currentValue: 899.99,
                    isActive: true,
                    createdAt: new Date(Date.now() - 86400000),
                    notificationsSent: 0
                  },
                  {
                    id: '2',
                    wineId: mockRecommendations[0].id,
                    wine: mockRecommendations[0],
                    type: 'stock',
                    isActive: true,
                    createdAt: new Date(Date.now() - 172800000),
                    notificationsSent: 2
                  }
                ]}
                notifications={[
                  {
                    id: '1',
                    alertId: '1',
                    type: 'price_drop',
                    title: 'Price Drop Alert',
                    message: 'Château Margaux 2015 price dropped to $849.99',
                    wine: mockWine,
                    sentAt: new Date(Date.now() - 3600000),
                    isRead: false,
                    channels: ['email', 'push']
                  },
                  {
                    id: '2',
                    alertId: '2',
                    type: 'stock_available',
                    title: 'Back in Stock',
                    message: 'Château Latour 2016 is now available',
                    wine: mockRecommendations[0],
                    sentAt: new Date(Date.now() - 7200000),
                    isRead: true,
                    channels: ['email', 'sms']
                  }
                ]}
                preferences={{
                  email: true,
                  sms: false,
                  push: true,
                  inApp: true,
                  frequency: 'immediate',
                  quietHours: {
                    enabled: true,
                    start: '22:00',
                    end: '08:00'
                  }
                }}
                onCreateAlert={(wineId, type, targetValue) => console.log('Create alert:', wineId, type, targetValue)}
                onUpdateAlert={(alertId, updates) => console.log('Update alert:', alertId, updates)}
                onDeleteAlert={(alertId) => console.log('Delete alert:', alertId)}
                onUpdatePreferences={(preferences) => console.log('Update preferences:', preferences)}
                onMarkAsRead={(notificationId) => console.log('Mark as read:', notificationId)}
                onMarkAllAsRead={() => console.log('Mark all as read')}
              />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Crown,
              title: 'Premium Experience',
              description: 'Luxury design and interactions tailored for high-end wine collectors'
            },
            {
              icon: Sparkles,
              title: 'AI-Powered Insights',
              description: 'Virtual sommelier recommendations and intelligent wine matching'
            },
            {
              icon: Award,
              title: 'Expert Curation',
              description: 'Professionally curated selections and detailed wine information'
            },
            {
              icon: Bell,
              title: 'Smart Notifications',
              description: 'Intelligent alerts for availability, pricing, and exclusive offers'
            },
            {
              icon: Heart,
              title: 'Personalization',
              description: 'Customized experiences based on preferences and purchase history'
            },
            {
              icon: ShoppingCart,
              title: 'Seamless Commerce',
              description: 'Frictionless purchasing with cryptocurrency and traditional payments'
            }
          ].map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <feature.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-olive text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}