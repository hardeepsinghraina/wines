'use client'

import React from 'react'
import { X, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CartItem } from '@/components/cart/CartItem'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { CartStatusIndicator } from '@/components/cart/CartStatusIndicator'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

export function ShoppingCart() {
  const {
    cart,
    summary,
    isOpen,
    isLoading,
    error,
    initializationStatus,
    initializationError,
    closeCart,
    clearCart,
    retryInitialization,
  } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart()
    }
  }

  const isEmpty = !cart?.items.length

  return (
    <Modal isOpen={isOpen} onClose={closeCart} className="max-w-md">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-burgundy" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart
            </h2>
            {summary && (
              <span className="text-sm text-gray-500">
                ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCart}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Status Indicator */}
        <div className="px-6 pt-4">
          <CartStatusIndicator />
        </div>

        {/* Failed State with Retry */}
        {initializationStatus === 'failed' && initializationError && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Cart
              </h3>
              <p className="text-gray-500 mb-4">
                {initializationError}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={retryInitialization}
                  disabled={isLoading}
                  className="w-full bg-burgundy hover:bg-burgundy/90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Retrying...
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    closeCart()
                    router.push('/products')
                  }}
                  className="w-full text-gray-600 hover:text-gray-900"
                >
                  Browse Wines
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && isEmpty && initializationStatus !== 'failed' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading cart...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && isEmpty && initializationStatus !== 'failed' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-4">
                Add some wines to get started
              </p>
              <Button
                onClick={() => {
                  closeCart()
                  router.push('/products')
                }}
                className="bg-burgundy hover:bg-burgundy/90"
              >
                Browse Wines
              </Button>
            </div>
          </div>
        )}

        {/* Cart Items */}
        {!isEmpty && (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-0">
                {cart?.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Clear Cart Button */}
              {cart?.items.length && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary and Checkout */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {summary && <OrderSummary summary={summary} />}
              
              <div className="mt-4 space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || isEmpty}
                  className="w-full bg-burgundy hover:bg-burgundy/90 text-white"
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    closeCart()
                    router.push('/products')
                  }}
                  className="w-full text-gray-600 hover:text-gray-900"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}