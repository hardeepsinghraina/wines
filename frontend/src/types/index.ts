// Re-export shared types and add frontend-specific types
export * from '@shared/types'
export type { 
  AuthState, 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData, 
  ChangePasswordFormData, 
  AuthResponse, 
  ApiError 
} from './auth'
export type { User as AuthUser } from './auth'
export * from './cart'

// Frontend-specific types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FormState {
  isLoading: boolean
  error: string | null
  success: boolean
}