'use client'

import React from 'react'
import { Wifi, WifiOff, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/Button'

export function CartStatusIndicator() {
  const { 
    isOnline, 
    pendingOperations, 
    error, 
    initializationStatus, 
    initializationError,
    retryInitialization,
    isLoading 
  } = useCart()

  // Show initialization error with retry button
  if (initializationStatus === 'failed' && initializationError) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-md bg-red-50 border border-red-200">
        <div className="flex items-center gap-2 flex-1">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-600">{initializationError}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={retryInitialization}
          disabled={isLoading}
          className="text-red-600 hover:text-red-700 hover:bg-red-100 px-2 py-1 h-auto text-xs flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </div>
    )
  }

  // Show loading state during initialization
  if (initializationStatus === 'pending' && isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-blue-50 border border-blue-200">
        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        <span className="text-blue-600">Loading cart...</span>
      </div>
    )
  }

  if (!isOnline || pendingOperations.length > 0 || error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-gray-50 border">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-600">Offline - Changes will sync when online</span>
          </>
        ) : pendingOperations.length > 0 ? (
          <>
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-600">
              Syncing {pendingOperations.length} change{pendingOperations.length !== 1 ? 's' : ''}...
            </span>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-600">{error}</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Cart synced</span>
          </>
        )}
      </div>
    )
  }

  return null
}