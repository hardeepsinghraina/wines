'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { authApi } from '@/lib/auth-api'
import { AuthState, User, LoginFormData, RegisterFormData } from '@/types/auth'

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User }

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...initialState,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

// Auth context
interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshAuth: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')

        if (accessToken && refreshToken) {
          dispatch({ type: 'AUTH_START' })
          
          try {
            const { authenticated, user } = await authApi.checkAuth()
            
            if (authenticated) {
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user, accessToken, refreshToken },
              })
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              dispatch({ type: 'LOGOUT' })
            }
          } catch {
            // Try to refresh token
            try {
              const tokens = await authApi.refreshToken(refreshToken)
              localStorage.setItem('accessToken', tokens.accessToken)
              localStorage.setItem('refreshToken', tokens.refreshToken)
              
              const { authenticated, user } = await authApi.checkAuth()
              if (authenticated) {
                dispatch({
                  type: 'AUTH_SUCCESS',
                  payload: { 
                    user, 
                    accessToken: tokens.accessToken, 
                    refreshToken: tokens.refreshToken 
                  },
                })
              } else {
                throw new Error('Authentication failed')
              }
            } catch {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              dispatch({ type: 'LOGOUT' })
            }
          }
        }
      } catch (error) {
        console.error('Failed to load auth state:', error)
        dispatch({ type: 'LOGOUT' })
      }
    }

    loadAuthState()
  }, [])

  const login = async (data: LoginFormData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await authApi.login(data)
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response,
      })
    } catch (error: any) {
      let message = 'Login failed. Please try again.'
      
      // Handle different error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message = 'Unable to connect to server. Please check your internet connection.'
      } else if (error.response) {
        const status = error.response.status
        if (status === 401) {
          message = 'Invalid email or password. Please try again.'
        } else if (status === 400) {
          message = error.response.data?.error?.message || 'Please check your email and password.'
        } else if (status === 429) {
          message = 'Too many login attempts. Please try again later.'
        } else if (status >= 500) {
          message = 'Server error. Please try again later.'
        }
      } else if (error.message) {
        message = error.message
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const register = async (data: RegisterFormData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      await authApi.register(data)
      
      // Registration successful, but user needs to verify email
      dispatch({ type: 'CLEAR_ERROR' })
    } catch (error: any) {
      let message = 'Registration failed. Please try again.'
      
      // Handle different error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message = 'Unable to connect to server. Please check your internet connection.'
      } else if (error.response) {
        const status = error.response.status
        if (status === 409) {
          message = 'An account with this email already exists.'
        } else if (status === 400) {
          message = error.response.data?.error?.message || 'Please check your information and try again.'
        } else if (status === 422) {
          message = 'Please provide valid information for all fields.'
        } else if (status >= 500) {
          message = 'Server error. Please try again later.'
        }
      } else if (error.message) {
        message = error.message
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const tokens = await authApi.refreshToken(refreshToken)
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      const { authenticated, user } = await authApi.checkAuth()
      if (authenticated) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { 
            user, 
            accessToken: tokens.accessToken, 
            refreshToken: tokens.refreshToken 
          },
        })
      }
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch({ type: 'LOGOUT' })
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const updatedUser = await authApi.updateProfile(data)
      
      dispatch({ type: 'SET_USER', payload: updatedUser })
    } catch (error: any) {
      let message = 'Failed to update profile. Please try again.'
      
      // Handle different error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message = 'Unable to connect to server. Please check your internet connection.'
      } else if (error.response) {
        const status = error.response.status
        if (status === 401) {
          message = 'Your session has expired. Please log in again.'
        } else if (status === 400 || status === 422) {
          message = error.response.data?.error?.message || 'Please check your information and try again.'
        } else if (status >= 500) {
          message = 'Server error. Please try again later.'
        }
      } else if (error.message) {
        message = error.message
      }
      
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshAuth,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}