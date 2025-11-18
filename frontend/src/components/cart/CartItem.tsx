'use client'

import React from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { CartItem as CartItemType } from '@/types/cart'
import { useCart } from '@/contexts/CartContext'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeFromCart, isLoading } = useCart()

  const wine = item.wine
  if (!wine) return null

  const primaryImage = wine.images.find(img => img.isPrimary) || wine.images[0]
  const price = wine.prices.find(p => p.currency === 'USD') || wine.prices[0]

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    await updateCartItem(item.wineId, newQuantity)
  }

  const handleRemove = async () => {
    await removeFromCart(item.wineId)
  }

  const itemTotal = price ? price.price * item.quantity : 0

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Wine Image */}
      <div className="flex-shrink-0 w-16 h-20 relative">
        <WineImage
          src={primaryImage?.url}
          alt={primaryImage?.altText || wine.name}
          width={64}
          height={80}
          className="object-cover rounded-md"
        />
      </div>

      {/* Wine Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {wine.name}
        </h4>
        <p className="text-xs text-gray-600 mt-1">
          {wine.producer} • {wine.vintage} • {wine.region}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {wine.bottleSize}
        </p>
        
        {/* Price */}
        <div className="mt-2">
          <span className="text-sm font-semibold text-burgundy">
            ${price?.price.toFixed(2) || '0.00'}
          </span>
          {item.quantity > 1 && (
            <span className="text-xs text-gray-500 ml-2">
              Total: ${itemTotal.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isLoading}
          className="p-1 h-auto text-gray-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 border border-gray-300 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isLoading || item.quantity <= 1}
            className="p-1 h-8 w-8 text-gray-600 hover:text-gray-900"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isLoading}
            className="p-1 h-8 w-8 text-gray-600 hover:text-gray-900"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}