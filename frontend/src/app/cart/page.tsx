'use client'

import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from '@/components/cart/ShoppingCart'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, totalItems, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-muted-olive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-charcoal-black mb-2">Your Cart is Empty</h1>
            <p className="text-muted-olive mb-6">
              Discover our exquisite wine collection and add some bottles to your cart.
            </p>
            <Link href="/products">
              <Button size="lg" className="inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-black mb-2">Shopping Cart</h1>
          <p className="text-muted-olive">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <ShoppingCart />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-charcoal-black mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-olive">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-olive">Shipping</span>
                  <span className="text-sm text-muted-olive">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-burgundy">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/products" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center text-sm text-muted-olive">
                  <span>🔒 Secure checkout with cryptocurrency and traditional payments</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}