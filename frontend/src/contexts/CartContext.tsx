'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { cartApi } from '@/lib/cart-api'
import { Cart, CartItem, CartSummary } from '@/types/cart'

interface CartState {
  cart: Cart | null
  summary: CartSummary | null
  isLoading: boolean
  error: string | null
  isOpen: boolean
  lastSyncTime: number
  isOnline: boolean
  pendingOperations: PendingOperation[]
  initializationStatus: 'pending' | 'success' | 'failed'
  initializationError: string | null
}

interface PendingOperation {
  id: string
  type: 'add' | 'update' | 'remove' | 'clear'
  data: any
  timestamp: number
  retryCount: number
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: { cart: Cart; summary: CartSummary } }
  | { type: 'SET_SUMMARY'; payload: CartSummary }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'SET_SYNC_TIME'; payload: number }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'ADD_PENDING_OPERATION'; payload: PendingOperation }
  | { type: 'REMOVE_PENDING_OPERATION'; payload: string }
  | { type: 'CLEAR_PENDING_OPERATIONS' }
  | { type: 'SET_INITIALIZATION_STATUS'; payload: 'pending' | 'success' | 'failed' }
  | { type: 'SET_INITIALIZATION_ERROR'; payload: string | null }

const initialState: CartState = {
  cart: null,
  summary: null,
  isLoading: false,
  error: null,
  isOpen: false,
  lastSyncTime: 0,
  isOnline: true,
  pendingOperations: [],
  initializationStatus: 'pending',
  initializationError: null,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload.cart,
        summary: action.payload.summary,
        isLoading: false,
        error: null,
      }
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload }
    case 'SET_INITIALIZATION_STATUS':
      return { ...state, initializationStatus: action.payload }
    case 'SET_INITIALIZATION_ERROR':
      return { ...state, initializationError: action.payload }
    case 'ADD_ITEM':
      if (!state.cart) return state
      const existingItemIndex = state.cart.items.findIndex(
        item => item.wineId === action.payload.wineId
      )
      let updatedItems
      if (existingItemIndex >= 0) {
        updatedItems = [...state.cart.items]
        updatedItems[existingItemIndex] = action.payload
      } else {
        updatedItems = [...state.cart.items, action.payload]
      }
      return {
        ...state,
        cart: { ...state.cart, items: updatedItems },
        summary: state.summary ? {
          ...state.summary,
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        } : null,
      }
    case 'UPDATE_ITEM':
      if (!state.cart) return state
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map(item =>
            item.wineId === action.payload.wineId ? action.payload : item
          ),
        },
      }
    case 'REMOVE_ITEM':
      if (!state.cart) return state
      const filteredItems = state.cart.items.filter(item => item.wineId !== action.payload)
      return {
        ...state,
        cart: { ...state.cart, items: filteredItems },
        summary: state.summary ? {
          ...state.summary,
          itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        } : null,
      }
    case 'CLEAR_CART':
      return {
        ...state,
        cart: state.cart ? { ...state.cart, items: [] } : null,
        summary: state.summary ? { ...state.summary, itemCount: 0, subtotal: 0 } : null,
      }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    case 'SET_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload }
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }
    case 'ADD_PENDING_OPERATION':
      return { 
        ...state, 
        pendingOperations: [...state.pendingOperations, action.payload] 
      }
    case 'REMOVE_PENDING_OPERATION':
      return { 
        ...state, 
        pendingOperations: state.pendingOperations.filter(op => op.id !== action.payload) 
      }
    case 'CLEAR_PENDING_OPERATIONS':
      return { ...state, pendingOperations: [] }
    default:
      return state
  }
}

interface CartContextType extends CartState {
  items: CartItem[] // Alias for cart.items
  totalItems: number // Total number of items
  totalPrice: number // Total price
  addToCart: (wineId: string, quantity: number) => Promise<void>
  updateCartItem: (wineId: string, quantity: number) => Promise<void>
  removeFromCart: (wineId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  validateCartItems: () => Promise<void>
  syncWithServer: () => Promise<void>
  retryPendingOperations: () => Promise<void>
  retryInitialization: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart on mount and handle visibility changes
  useEffect(() => {
    initializeCart()
    
    // Handle online/offline status
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
      retryPendingOperations()
      syncWithServer()
    }
    
    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false })
    }
    
    // Refresh cart when tab becomes visible (handles cart sync across tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncWithServer()
      }
    }
    
    // Handle storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartBackup' && e.newValue) {
        try {
          const cartData = JSON.parse(e.newValue)
          dispatch({ type: 'SET_CART', payload: cartData })
          dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
        } catch (error) {
          console.error('Failed to sync cart from storage:', error)
        }
      }
    }
    
    // Handle beforeunload to save pending operations
    const handleBeforeUnload = () => {
      if (state.pendingOperations.length > 0) {
        localStorage.setItem('pendingCartOperations', JSON.stringify(state.pendingOperations))
      }
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Refresh cart periodically to keep it in sync
    const syncInterval = setInterval(() => {
      if (!document.hidden && state.isOnline) {
        syncWithServer()
      }
    }, 30000) // Every 30 seconds
    
    // Validate cart items periodically
    const validationInterval = setInterval(() => {
      if (!document.hidden && state.isOnline) {
        validateCartItems()
      }
    }, 60000) // Every minute
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(syncInterval)
      clearInterval(validationInterval)
    }
  }, [state.isOnline, state.pendingOperations.length])

  const initializeCart = async () => {
    try {
      dispatch({ type: 'SET_INITIALIZATION_STATUS', payload: 'pending' })
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Load pending operations from localStorage
      if (typeof window !== 'undefined') {
        const pendingOps = localStorage.getItem('pendingCartOperations')
        if (pendingOps) {
          try {
            const operations = JSON.parse(pendingOps)
            operations.forEach((op: PendingOperation) => {
              dispatch({ type: 'ADD_PENDING_OPERATION', payload: op })
            })
            localStorage.removeItem('pendingCartOperations')
          } catch (error) {
            console.error('Failed to load pending operations:', error)
          }
        }
      }
      
      // Try to fetch cart from API
      try {
        await refreshCart()
        dispatch({ type: 'SET_INITIALIZATION_STATUS', payload: 'success' })
        dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: null })
      } catch (apiError) {
        console.error('Failed to fetch cart from API:', apiError)
        
        // Fallback: Try to recover from localStorage backup
        let recoveredFromBackup = false
        if (typeof window !== 'undefined') {
          const backupCart = localStorage.getItem('cartBackup')
          if (backupCart) {
            try {
              const parsedBackup = JSON.parse(backupCart)
              
              // Check if backup is not expired (7 days)
              const now = Date.now()
              if (parsedBackup.expiresAt && parsedBackup.expiresAt > now) {
                dispatch({ type: 'SET_CART', payload: {
                  cart: parsedBackup.cart,
                  summary: parsedBackup.summary
                }})
                dispatch({ type: 'SET_SYNC_TIME', payload: parsedBackup.timestamp || 0 })
                recoveredFromBackup = true
                
                // Set status as success but with a warning
                dispatch({ type: 'SET_INITIALIZATION_STATUS', payload: 'success' })
                dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: null })
                dispatch({ type: 'SET_ERROR', payload: 'Cart loaded from backup. Some items may be out of date.' })
              } else {
                // Backup expired, remove it
                localStorage.removeItem('cartBackup')
              }
            } catch (parseError) {
              console.error('Failed to parse cart backup:', parseError)
              localStorage.removeItem('cartBackup')
            }
          }
        }
        
        // If no backup recovery, set failed status
        if (!recoveredFromBackup) {
          dispatch({ type: 'SET_INITIALIZATION_STATUS', payload: 'failed' })
          dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: 'Unable to load your cart. Please check your connection and try again.' })
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart. Please try again.' })
          
          // Initialize with empty cart
          dispatch({ type: 'SET_CART', payload: {
            cart: {
              id: 'temp',
              userId: undefined,
              sessionId: undefined,
              items: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            summary: {
              itemCount: 0,
              subtotal: 0,
              tax: 0,
              shipping: 0,
              total: 0,
              currency: 'EUR',
              items: [],
            }
          }})
        }
      }
      
      // Try to retry pending operations
      try {
        await retryPendingOperations()
      } catch (retryError) {
        console.error('Failed to retry pending operations:', retryError)
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      console.error('Failed to initialize cart:', error)
      dispatch({ type: 'SET_INITIALIZATION_STATUS', payload: 'failed' })
      dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: 'An unexpected error occurred while loading your cart.' })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize cart' })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const refreshCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const cartData = await cartApi.getCart()
    dispatch({ type: 'SET_CART', payload: cartData })
    dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
    
    // Backup to localStorage and sessionStorage
    backupCart(cartData)
    dispatch({ type: 'SET_LOADING', payload: false })
  }

  const syncWithServer = async () => {
    if (!state.isOnline) return
    
    try {
      const cartData = await cartApi.getCart()
      const serverSyncTime = new Date(cartData.cart.updatedAt).getTime()
      
      // Only update if server data is newer
      if (serverSyncTime > state.lastSyncTime) {
        dispatch({ type: 'SET_CART', payload: cartData })
        dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
        backupCart(cartData)
      }
    } catch (error) {
      console.error('Failed to sync with server:', error)
    }
  }

  const validateCartItems = async () => {
    if (!state.cart?.items.length || !state.isOnline) return
    
    try {
      // This would typically call an API to validate stock levels
      // For now, we'll implement basic validation
      const summary = await cartApi.getCartSummary()
      dispatch({ type: 'SET_SUMMARY', payload: summary })
    } catch (error) {
      console.error('Failed to validate cart items:', error)
    }
  }

  const retryPendingOperations = async () => {
    if (!state.isOnline || state.pendingOperations.length === 0) return
    
    const operations = [...state.pendingOperations]
    
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'add':
            await cartApi.addToCart(operation.data)
            break
          case 'update':
            await cartApi.updateCartItem(operation.data.wineId, { quantity: operation.data.quantity })
            break
          case 'remove':
            await cartApi.removeFromCart(operation.data.wineId)
            break
          case 'clear':
            await cartApi.clearCart()
            break
        }
        
        dispatch({ type: 'REMOVE_PENDING_OPERATION', payload: operation.id })
      } catch (error) {
        console.error('Failed to retry operation:', error)
        
        // Increment retry count and remove if too many retries
        if (operation.retryCount >= 3) {
          dispatch({ type: 'REMOVE_PENDING_OPERATION', payload: operation.id })
        } else {
          operation.retryCount++
        }
      }
    }
    
    // Refresh cart after retrying operations
    if (operations.length > 0) {
      await refreshCart()
    }
  }

  // Backup cart to localStorage and sessionStorage
  const backupCart = (cartData: { cart: Cart; summary: CartSummary }) => {
    if (typeof window !== 'undefined') {
      try {
        const backupData = {
          ...cartData,
          timestamp: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        }
        
        // Backup to localStorage for persistence across sessions
        localStorage.setItem('cartBackup', JSON.stringify(backupData))
        
        // Backup to sessionStorage for current session
        sessionStorage.setItem('cartSession', JSON.stringify(backupData))
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'cartBackup',
          newValue: JSON.stringify(backupData),
        }))
      } catch (error) {
        console.error('Failed to backup cart:', error)
      }
    }
  }

  const createPendingOperation = (type: PendingOperation['type'], data: any): PendingOperation => {
    return {
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }
  }

  const addToCart = async (wineId: string, quantity: number) => {
    const operationData = { wineId, quantity }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (!state.isOnline) {
        // Add to pending operations if offline
        const pendingOp = createPendingOperation('add', operationData)
        dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
        dispatch({ type: 'SET_ERROR', payload: 'Added to cart offline. Will sync when online.' })
        return
      }
      
      const cartItem = await cartApi.addToCart(operationData)
      dispatch({ type: 'ADD_ITEM', payload: cartItem })
      
      // Refresh summary with enhanced calculations
      const summary = await cartApi.getCartSummary()
      dispatch({ type: 'SET_SUMMARY', payload: summary })
      dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
      
      // Backup updated cart
      if (state.cart) {
        backupCart({ cart: state.cart, summary })
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      console.error('Failed to add to cart:', error)
      
      // Add to pending operations for retry
      const pendingOp = createPendingOperation('add', operationData)
      dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart. Will retry automatically.' })
    }
  }

  const updateCartItem = async (wineId: string, quantity: number) => {
    const operationData = { wineId, quantity }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (!state.isOnline) {
        // Add to pending operations if offline
        const pendingOp = createPendingOperation('update', operationData)
        dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
        dispatch({ type: 'SET_ERROR', payload: 'Updated cart offline. Will sync when online.' })
        return
      }
      
      const cartItem = await cartApi.updateCartItem(wineId, { quantity })
      dispatch({ type: 'UPDATE_ITEM', payload: cartItem })
      
      // Refresh summary
      const summary = await cartApi.getCartSummary()
      dispatch({ type: 'SET_SUMMARY', payload: summary })
      dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
      
      // Backup updated cart
      if (state.cart) {
        backupCart({ cart: state.cart, summary })
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      console.error('Failed to update cart item:', error)
      
      // Add to pending operations for retry
      const pendingOp = createPendingOperation('update', operationData)
      dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item. Will retry automatically.' })
    }
  }

  const removeFromCart = async (wineId: string) => {
    const operationData = { wineId }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (!state.isOnline) {
        // Add to pending operations if offline
        const pendingOp = createPendingOperation('remove', operationData)
        dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
        dispatch({ type: 'SET_ERROR', payload: 'Removed from cart offline. Will sync when online.' })
        return
      }
      
      await cartApi.removeFromCart(wineId)
      dispatch({ type: 'REMOVE_ITEM', payload: wineId })
      
      // Refresh summary
      const summary = await cartApi.getCartSummary()
      dispatch({ type: 'SET_SUMMARY', payload: summary })
      dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
      
      // Backup updated cart
      if (state.cart) {
        backupCart({ cart: state.cart, summary })
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      
      // Add to pending operations for retry
      const pendingOp = createPendingOperation('remove', operationData)
      dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart. Will retry automatically.' })
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      if (!state.isOnline) {
        // Add to pending operations if offline
        const pendingOp = createPendingOperation('clear', {})
        dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
        dispatch({ type: 'SET_ERROR', payload: 'Cart cleared offline. Will sync when online.' })
        return
      }
      
      await cartApi.clearCart()
      dispatch({ type: 'CLEAR_CART' })
      dispatch({ type: 'CLEAR_PENDING_OPERATIONS' })
      dispatch({ type: 'SET_SYNC_TIME', payload: Date.now() })
      
      // Clear all backups
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartBackup')
        sessionStorage.removeItem('cartSession')
        localStorage.removeItem('pendingCartOperations')
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      console.error('Failed to clear cart:', error)
      
      // Add to pending operations for retry
      const pendingOp = createPendingOperation('clear', {})
      dispatch({ type: 'ADD_PENDING_OPERATION', payload: pendingOp })
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart. Will retry automatically.' })
    }
  }

  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })
  const openCart = () => dispatch({ type: 'OPEN_CART' })
  const closeCart = () => dispatch({ type: 'CLOSE_CART' })

  const retryInitialization = async () => {
    dispatch({ type: 'SET_INITIALIZATION_STATUS', payload: 'pending' })
    dispatch({ type: 'SET_INITIALIZATION_ERROR', payload: null })
    dispatch({ type: 'SET_ERROR', payload: null })
    await initializeCart()
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        items: state.cart?.items || [],
        totalItems: state.summary?.itemCount || 0,
        totalPrice: state.summary?.total || state.summary?.subtotal || 0,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        toggleCart,
        openCart,
        closeCart,
        validateCartItems,
        syncWithServer,
        retryPendingOperations,
        retryInitialization,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}