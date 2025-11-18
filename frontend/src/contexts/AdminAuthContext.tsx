'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import {
  AdminAuthState,
  AdminUser,
  AdminLoginRequest,
  MFAVerifyRequest,
  MFASetupRequest,
  AdminPermission
} from '@/types/admin'

interface AdminAuthContextType extends AdminAuthState {
  user: AdminUser | null // Alias for admin to match component expectations
  login: (credentials: AdminLoginRequest) => Promise<void>
  verifyMFA: (mfaData: MFAVerifyRequest) => Promise<void>
  setupMFA: () => Promise<{ secret: string; qrCodeUrl: string }>
  confirmMFASetup: (setupData: MFASetupRequest) => Promise<void>
  disableMFA: () => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  hasPermission: (permission: AdminPermission) => boolean
  hasAnyPermission: (permissions: AdminPermission[]) => boolean
}

type AdminAuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { admin: AdminUser; accessToken: string; sessionId: string } }
  | { type: 'LOGIN_MFA_REQUIRED'; payload: { sessionId: string } }
  | { type: 'MFA_VERIFY_SUCCESS'; payload: { admin: AdminUser; accessToken: string; sessionId: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { accessToken: string } }

const initialState: AdminAuthState = {
  admin: null,
  accessToken: null,
  sessionId: null,
  isAuthenticated: false,
  isLoading: false,
  requiresMFA: false,
  mfaSessionId: null
}

function adminAuthReducer(state: AdminAuthState, action: AdminAuthAction): AdminAuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        requiresMFA: false,
        mfaSessionId: null
      }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        admin: action.payload.admin,
        accessToken: action.payload.accessToken,
        sessionId: action.payload.sessionId,
        isAuthenticated: true,
        isLoading: false,
        requiresMFA: false,
        mfaSessionId: null
      }

    case 'LOGIN_MFA_REQUIRED':
      return {
        ...state,
        isLoading: false,
        requiresMFA: true,
        mfaSessionId: action.payload.sessionId
      }

    case 'MFA_VERIFY_SUCCESS':
      return {
        ...state,
        admin: action.payload.admin,
        accessToken: action.payload.accessToken,
        sessionId: action.payload.sessionId,
        isAuthenticated: true,
        isLoading: false,
        requiresMFA: false,
        mfaSessionId: null
      }

    case 'LOGOUT':
      return {
        ...initialState
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken
      }

    default:
      return state
  }
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState)

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = adminApi.getAccessToken()
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true })
          const { admin } = await adminApi.getProfile()
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              admin,
              accessToken: token,
              sessionId: '' // We don't store session ID in localStorage
            }
          })
        } catch (error) {
          // Token is invalid, clear it
          adminApi.setAccessToken(null)
          dispatch({ type: 'LOGOUT' })
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: AdminLoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await adminApi.login(credentials)

      if (response.requiresMFA && response.sessionId) {
        dispatch({
          type: 'LOGIN_MFA_REQUIRED',
          payload: { sessionId: response.sessionId }
        })
      } else if (response.admin && response.accessToken) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            admin: response.admin,
            accessToken: response.accessToken,
            sessionId: response.sessionId || ''
          }
        })
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const verifyMFA = async (mfaData: MFAVerifyRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await adminApi.verifyMFA(mfaData)

      dispatch({
        type: 'MFA_VERIFY_SUCCESS',
        payload: {
          admin: response.admin,
          accessToken: response.accessToken,
          sessionId: response.sessionId
        }
      })
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const setupMFA = async () => {
    const response = await adminApi.setupMFA()
    return {
      secret: response.secret,
      qrCodeUrl: response.qrCodeUrl
    }
  }

  const confirmMFASetup = async (setupData: MFASetupRequest) => {
    await adminApi.confirmMFASetup(setupData)
    
    // Refresh admin profile to update MFA status
    if (state.isAuthenticated) {
      const { admin } = await adminApi.getProfile()
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          admin,
          accessToken: state.accessToken!,
          sessionId: state.sessionId!
        }
      })
    }
  }

  const disableMFA = async () => {
    await adminApi.disableMFA()
    
    // Refresh admin profile to update MFA status
    if (state.isAuthenticated) {
      const { admin } = await adminApi.getProfile()
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          admin,
          accessToken: state.accessToken!,
          sessionId: state.sessionId!
        }
      })
    }
  }

  const logout = async () => {
    try {
      await adminApi.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const refreshToken = async () => {
    try {
      const response = await adminApi.refreshToken()
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: { accessToken: response.accessToken }
      })
    } catch (error) {
      // If refresh fails, logout user
      dispatch({ type: 'LOGOUT' })
      throw error
    }
  }

  const hasPermission = (permission: AdminPermission): boolean => {
    return state.admin?.permissions.includes(permission) || false
  }

  const hasAnyPermission = (permissions: AdminPermission[]): boolean => {
    if (!state.admin?.permissions) return false
    return permissions.some(permission => state.admin!.permissions.includes(permission))
  }

  const contextValue: AdminAuthContextType = {
    ...state,
    user: state.admin, // Provide user alias for admin
    login,
    verifyMFA,
    setupMFA,
    confirmMFASetup,
    disableMFA,
    logout,
    refreshToken,
    hasPermission,
    hasAnyPermission
  }

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}