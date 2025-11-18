'use client'

import React, { useState, useEffect } from 'react'
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Package, 
  Clock, 
  Crown, 
  Award, 
  Eye, 
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Bookmark,
  Bell,
  Users,
  MessageCircle,
  Maximize2,
  X,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Wine } from '@/types/wine'

interface PremiumProductDetailProps {
  wine: Wine
  onAddToWishlist?: (wineId: string) => void
  onShare?: (wine: Wine) => void
  onNotifyAvailability?: (wineId: string) => void
  className?: string
}

export function PremiumProductDetail({ 
  wine,
  onAddToWishlist,
  onShare,
  onNotifyAvailability,
  className = ''
}: PremiumProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  const images = wine.images || []
  const primaryImage = images.find(img => img.isPrimary) || images[0]
  const availableStock = wine.inventory?.reduce((sum, inv) => sum + inv.quantity - inv.reservedQty, 0) || wine.stock || 0
  const isInStock = availableStock > 0
  const averageRating = wine.reviews && wine.reviews.length > 0 
    ? wine.reviews.reduce((sum, review) => sum + review.rating, 0) / wine.reviews.length 
    : 0

  // Premium features data
  const premiumFeatures = [
    { icon: Crown, label: 'Premium Selection', description: 'Curated by our master sommelier' },
    { icon: Award, label: 'Award Winning', description: 'Internationally recognized excellence' },
    { icon: Package, label: 'Luxury Packaging', description: 'Premium gift-ready presentation' },
    { icon: Clock, label: 'Limited Edition', description: 'Exclusive availability' }
  ]

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    if (onAddToWishlist) {
      onAddToWishlist(wine.id)
    }
  }

  const handleShare = (platform?: string) => {
    if (platform) {
      const url = window.location.href
      const text = `Check out this premium wine: ${wine.name}`
      
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
          break
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
          break
        case 'instagram':
          // Instagram doesn't support direct sharing, so copy to clipboard
          navigator.clipboard.writeText(`${text} ${url}`)
          setCopiedToClipboard(true)
          setTimeout(() => setCopiedToClipboard(false), 2000)
          break
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
          break
        case 'copy':
          navigator.clipboard.writeText(url)
          setCopiedToClipboard(true)
          setTimeout(() => setCopiedToClipboard(false), 2000)
          break
      }
    }
    
    if (onShare) {
      onShare(wine)
    }
    setShowShareModal(false)
  }

  const handleNotifyAvailability = () => {
    if (onNotifyAvailability) {
      onNotifyAvailability(wine.id)
    }
    setShowNotificationModal(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className={`premium-product-detail ${className}`}>
      <div className="grid lg:grid-cols-2 gap-12 mb-12">
        {/* Premium Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden group">
            <WineImage
              src={images[selectedImageIndex]?.url || primaryImage?.url || wine.imageUrl}
              alt={images[selectedImageIndex]?.altText || wine.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              priority
            />
            
            {/* Zoom Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImageZoomed(true)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Premium Badge */}
            <div className="absolute top-4 left-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PREMIUM
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'border-burgundy shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <WineImage
                    src={image.url}
                    alt={image.altText || `${wine.name} view ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Virtual Tour Button */}
          <Button
            variant="outline"
            onClick={() => setShowVideoModal(true)}
            className="w-full border-burgundy text-burgundy hover:bg-burgundy hover:text-white flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Virtual Vineyard Tour
          </Button>
        </div>

        {/* Premium Product Information */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-2 leading-tight">
                  {wine.name}
                </h1>
                <p className="text-xl text-muted-olive mb-2">
                  {wine.producer || 'Premium Producer'} • {wine.vintage}
                </p>
                <p className="text-lg text-charcoal-black">
                  {wine.region}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isWishlisted 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            {wine.reviews && wine.reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-charcoal-black">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-olive">
                  ({wine.reviews.length} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Premium Features */}
          <div className="grid grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <feature.icon className="w-5 h-5 text-burgundy mt-0.5" />
                <div>
                  <h4 className="font-medium text-charcoal-black text-sm">{feature.label}</h4>
                  <p className="text-xs text-muted-olive">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <Card className="p-6 bg-gradient-to-br from-burgundy/5 to-burgundy/10 border-burgundy/20">
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-burgundy">
                  {formatPrice(wine.price)}
                </span>
                <span className="text-lg text-muted-olive">USD</span>
              </div>
              
              {wine.prices && wine.prices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-charcoal-black">
                    💰 Cryptocurrency Prices Available
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {wine.prices.slice(0, 4).map((crypto) => (
                      <div key={crypto.currency} className="flex justify-between">
                        <span className="text-muted-olive">{crypto.currency}:</span>
                        <span className="font-medium">{formatPrice(crypto.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quantity and Variants */}
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="font-medium text-charcoal-black">
                Quantity:
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 border-0 focus:ring-0"
                />
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                  disabled={quantity >= availableStock}
                >
                  +
                </button>
              </div>
              <span className="text-sm text-muted-olive">
                {availableStock} available
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <>
                  <Package className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  {availableStock <= 5 && (
                    <span className="text-orange-600 text-sm">
                      (Only {availableStock} left!)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isInStock ? (
              <AddToCartButton
                wineId={wine.id}
                quantity={quantity}
                className="w-full"
                size="lg"
              />
            ) : (
              <Button
                onClick={() => setShowNotificationModal(true)}
                className="w-full bg-muted-olive hover:bg-muted-olive/90 text-white"
                size="lg"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify When Available
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
              >
                <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowShareModal(true)}
                className="border-sapphire text-sapphire hover:bg-sapphire hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImageZoomed(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </Button>
            <WineImage
              src={images[selectedImageIndex]?.url || primaryImage?.url || wine.imageUrl}
              alt={wine.name}
              width={800}
              height={800}
              className="object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share this wine</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('instagram')}
                className="flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('email')}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('copy')}
                className="col-span-2 flex items-center gap-2"
              >
                {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedToClipboard ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Virtual Vineyard Tour</p>
                  <p className="text-sm text-gray-300 mt-2">Experience an immersive tour of the vineyard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <Bell className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Notified</h3>
              <p className="text-gray-600 mb-4">
                We'll email you when {wine.name} is back in stock.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNotifyAvailability}
                  className="flex-1 bg-burgundy hover:bg-burgundy/90"
                >
                  Notify Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}