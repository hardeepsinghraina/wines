// Authentication related types

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    emailVerified: boolean
  }
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
  sessionId: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface EmailVerificationToken {
  userId: string
  email: string
  type: 'email_verification' | 'password_reset'
}