'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/contexts/CartContext'

export function CartIcon() {
  const { summary, openCart } = useCart()
  const itemCount = summary?.itemCount || 0

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openCart}
      className="relative p-2 text-gray-700 hover:text-burgundy"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-burgundy text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  )
}