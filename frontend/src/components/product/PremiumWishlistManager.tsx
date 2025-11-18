'use client'

import React, { useState, useEffect } from 'react'
import { 
  Heart, 
  Star, 
  Trash2, 
  ShoppingCart, 
  Share2, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  Calendar,
  DollarSign,
  Package,
  Bell,
  Eye,
  Plus,
  Minus,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Wine } from '@/types/wine'

interface WishlistItem extends Wine {
  dateAdded: Date
  priority: 'low' | 'medium' | 'high'
  notes?: string
  priceAlert?: {
    enabled: boolean
    targetPrice: number
  }
  stockAlert?: boolean
}

interface PremiumWishlistManagerProps {
  wishlistItems: WishlistItem[]
  onRemoveItem: (wineId: string) => void
  onUpdateItem: (wineId: string, updates: Partial<WishlistItem>) => void
  onAddToCart: (wineId: string, quantity: number) => void
  onShare: (wine: Wine) => void
  onSetPriceAlert: (wineId: string, targetPrice: number) => void
  onToggleStockAlert: (wineId: string) => void
  className?: string
}

type SortOption = 'dateAdded' | 'name' | 'price' | 'priority' | 'vintage'
type ViewMode = 'grid' | 'list'

export function PremiumWishlistManager({
  wishlistItems,
  onRemoveItem,
  onUpdateItem,
  onAddToCart,
  onShare,
  onSetPriceAlert,
  onToggleStockAlert,
  className = ''
}: PremiumWishlistManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterPriority, setFilterPriority] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showPriceAlertModal, setShowPriceAlertModal] = useState<string | null>(null)
  const [priceAlertValue, setPriceAlertValue] = useState<number>(0)

  const sortedAndFilteredItems = wishlistItems
    .filter(item => 
      filterPriority.length === 0 || filterPriority.includes(item.priority)
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'dateAdded':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'vintage':
          comparison = a.vintage - b.vintage
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleItemSelection = (wineId: string) => {
    setSelectedItems(prev => 
      prev.includes(wineId)
        ? prev.filter(id => id !== wineId)
        : [...prev, wineId]
    )
  }

  const selectAllItems = () => {
    setSelectedItems(sortedAndFilteredItems.map(item => item.id))
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  const removeSelectedItems = () => {
    selectedItems.forEach(wineId => onRemoveItem(wineId))
    setSelectedItems([])
  }

  const addSelectedToCart = () => {
    selectedItems.forEach(wineId => onAddToCart(wineId, 1))
    setSelectedItems([])
  }

  const handleSetPriceAlert = (wineId: string) => {
    if (priceAlertValue > 0) {
      onSetPriceAlert(wineId, priceAlertValue)
      setShowPriceAlertModal(null)
      setPriceAlertValue(0)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥'
      case 'medium': return '⭐'
      case 'low': return '💙'
      default: return '📌'
    }
  }

  if (wishlistItems.length === 0) {
    return (
      <div className={`premium-wishlist-empty ${className}`}>
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your dream wine collection by adding wines to your wishlist
            </p>
            <Button className="bg-burgundy hover:bg-burgundy/90">
              Explore Premium Wines
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={`premium-wishlist-manager ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            My Wishlist
          </h2>
          <p className="text-muted-olive">
            {wishlistItems.length} premium wines • {selectedItems.length} selected
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-burgundy hover:bg-burgundy/90' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-burgundy hover:bg-burgundy/90' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-charcoal-black">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-burgundy focus:border-burgundy"
              >
                <option value="dateAdded">Date Added</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="priority">Priority</option>
                <option value="vintage">Vintage</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-charcoal-black">Priority:</span>
              {['high', 'medium', 'low'].map(priority => (
                <Button
                  key={priority}
                  variant={filterPriority.includes(priority) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterPriority(prev => 
                      prev.includes(priority)
                        ? prev.filter(p => p !== priority)
                        : [...prev, priority]
                    )
                  }}
                  className={`text-xs ${
                    filterPriority.includes(priority) 
                      ? 'bg-burgundy hover:bg-burgundy/90' 
                      : 'border-gray-300'
                  }`}
                >
                  {getPriorityIcon(priority)} {priority}
                </Button>
              ))}
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSelectedToCart}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add to Cart ({selectedItems.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeSelectedItems}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove ({selectedItems.length})
                </Button>
              </div>
            )}
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAllItems}
                className="text-burgundy hover:bg-burgundy/10"
              >
                Select All
              </Button>
              {selectedItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Clear Selection
                </Button>
              )}
            </div>
            
            <span className="text-sm text-muted-olive">
              {sortedAndFilteredItems.length} of {wishlistItems.length} wines shown
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAndFilteredItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="w-4 h-4 text-burgundy focus:ring-burgundy rounded"
                />
              </div>

              {/* Priority Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  {getPriorityIcon(item.priority)} {item.priority}
                </span>
              </div>

              {/* Wine Image */}
              <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                <WineImage
                  src={item.images?.find(img => img.isPrimary)?.url || item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Wine Details */}
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-charcoal-black text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-olive">
                    {item.producer} • {item.vintage}
                  </p>
                  <p className="text-xs text-gray-500">
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>

                {/* Price and Alerts */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-burgundy">
                      {formatPrice(item.price)}
                    </span>
                    {item.priceAlert?.enabled && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Bell className="w-3 h-3" />
                        Alert: {formatPrice(item.priceAlert.targetPrice)}
                      </div>
                    )}
                  </div>
                  
                  {item.stockAlert && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Package className="w-3 h-3" />
                      Stock alerts enabled
                    </div>
                  )}
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    "{item.notes}"
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <AddToCartButton
                    wineId={item.id}
                    size="sm"
                    className="w-full"
                  />
                  
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPriceAlertModal(item.id)
                        setPriceAlertValue(item.price * 0.9) // Default to 10% off
                      }}
                      className="text-xs"
                    >
                      <Bell className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(item)}
                      className="text-xs"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-4 h-4 text-burgundy focus:ring-burgundy rounded"
                  />

                  {/* Wine Image */}
                  <div className="w-16 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <WineImage
                      src={item.images?.find(img => img.isPrimary)?.url || item.imageUrl}
                      alt={item.name}
                      width={64}
                      height={80}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Wine Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-charcoal-black mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-olive">
                          {item.producer} • {item.vintage} • {item.region}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Added {new Date(item.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-lg font-bold text-burgundy">
                          {formatPrice(item.price)}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {getPriorityIcon(item.priority)} {item.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        "{item.notes}"
                      </div>
                    )}

                    {/* Alerts */}
                    <div className="flex items-center gap-4 mt-2">
                      {item.priceAlert?.enabled && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Bell className="w-3 h-3" />
                          Price alert: {formatPrice(item.priceAlert.targetPrice)}
                        </div>
                      )}
                      {item.stockAlert && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Package className="w-3 h-3" />
                          Stock alerts enabled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <AddToCartButton
                      wineId={item.id}
                      size="sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPriceAlertModal(item.id)
                        setPriceAlertValue(item.price * 0.9)
                      }}
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(item)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Price Alert Modal */}
      {showPriceAlertModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <Bell className="w-12 h-12 text-burgundy mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Set Price Alert</h3>
              <p className="text-sm text-gray-600">
                Get notified when the price drops below your target
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price (USD)
              </label>
              <input
                type="number"
                value={priceAlertValue}
                onChange={(e) => setPriceAlertValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                placeholder="Enter target price"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPriceAlertModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSetPriceAlert(showPriceAlertModal)}
                className="flex-1 bg-burgundy hover:bg-burgundy/90"
              >
                Set Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}