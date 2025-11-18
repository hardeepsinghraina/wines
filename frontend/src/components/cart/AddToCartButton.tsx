'use client'

import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/contexts/CartContext'

interface AddToCartButtonProps {
  wineId: string
  quantity?: number
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
  disabled?: boolean
}

export function AddToCartButton({
  wineId,
  quantity = 1,
  variant = 'primary',
  size = 'md',
  className = '',
  showIcon = true,
  children,
  disabled = false,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = async () => {
    try {
      await addToCart(wineId, quantity)
      setIsAdded(true)
      
      // Reset the success state after 2 seconds
      setTimeout(() => {
        setIsAdded(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const buttonContent = children || (
    <>
      {showIcon && (
        <>
          {isAdded ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
        </>
      )}
      {isAdded ? 'Added!' : 'Add to Cart'}
    </>
  )

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || disabled}
      variant={variant}
      size={size}
      className={`${className} ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {buttonContent}
    </Button>
  )
}