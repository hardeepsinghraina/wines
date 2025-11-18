// Authentication types for frontend

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: string
  emailVerified: boolean
  createdAt: string
  addresses?: import('@/types/shipping').ShippingAddress[]
  paymentMethods?: import('@/components/payment/PaymentSelector').PaymentMethod[]
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  dateOfBirth?: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}