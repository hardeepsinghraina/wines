// Cart API service

import { api } from './api'
import {

  CartItem,
  CartSummary,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CreateOrderFromCartRequest,
  MergeGuestCartRequest,
} from '@/types/cart'

class CartApiService {
  private getAuthHeaders(token?: string): Record<string, string> {
    const accessToken = token || this.getStoredToken()
    const headers: Record<string, string> = {}
    
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    } else {
      // For guest users, send session ID
      const sessionId = this.getOrCreateSessionId()
      headers['x-session-id'] = sessionId
    }
    
    return headers
  }

  private getOrCreateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('guestSessionId')
      if (!sessionId) {
        sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        localStorage.setItem('guestSessionId', sessionId)
      }
      return sessionId
    }
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  async getCart(): Promise<CartResponse> {
    const response = await api.request<{
      success: boolean
      data: CartResponse
    }>('/api/cart', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    return response.data
  }

  async getCartSummary(currency: string = 'USD'): Promise<CartSummary> {
    const response = await api.request<{
      success: boolean
      data: CartSummary
    }>(`/api/cart/summary?currency=${currency}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    return response.data
  }

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    const response = await api.request<{
      success: boolean
      data: CartItem
    }>('/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    return response.data
  }

  async updateCartItem(wineId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    const response = await api.request<{
      success: boolean
      data: CartItem
    }>(`/api/cart/items/${wineId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    return response.data
  }

  async removeFromCart(wineId: string): Promise<void> {
    await api.request('/api/cart/items/' + wineId, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
  }

  async clearCart(): Promise<void> {
    await api.request('/api/cart', {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
  }

  async createOrderFromCart(data: CreateOrderFromCartRequest): Promise<any> {
    const response = await api.request<{
      success: boolean
      data: any
    }>('/api/cart/checkout', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    return response.data
  }

  async mergeGuestCart(data: MergeGuestCartRequest): Promise<CartResponse> {
    const response = await api.request<{
      success: boolean
      data: CartResponse
    }>('/api/cart/merge', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    return response.data
  }
}

export const cartApi = new CartApiService()