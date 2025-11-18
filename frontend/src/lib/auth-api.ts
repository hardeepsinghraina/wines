// Authentication API service

import { api } from './api'
import {
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  User,
} from '@/types/auth'

class AuthApiService {
  private getAuthHeaders(token?: string): Record<string, string> {
    const accessToken = token || this.getStoredToken()
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  async register(data: RegisterFormData): Promise<{ user: User; verificationToken?: string }> {
    const response = await api.post<{
      success: boolean
      data: {
        message?: string
        user: User
        verificationToken?: string
      }
    }>('/api/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
    })

    // Extract user and verification token from response
    const { user, verificationToken } = response.data
    return { user, verificationToken }
  }

  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<{
      success: boolean
      data: {
        message?: string
        user: User
        accessToken: string
        refreshToken: string
      }
    }>('/api/auth/login', data)

    // Extract the auth data from the response
    const { user, accessToken, refreshToken } = response.data
    return { user, accessToken, refreshToken }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post<{
      success: boolean
      data: {
        message?: string
        accessToken: string
        refreshToken: string
      }
    }>('/api/auth/refresh', { refreshToken })

    // Extract tokens from response
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async logout(): Promise<void> {
    await api.request('/api/auth/logout', {
      method: 'POST',
      headers: this.getAuthHeaders(),
    })
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/api/auth/verify-email', { token })
  }

  async forgotPassword(data: ForgotPasswordFormData): Promise<{ resetToken?: string }> {
    const response = await api.post<{
      success: boolean
      data: {
        message?: string
        resetToken?: string
      }
    }>('/api/auth/forgot-password', data)

    // Extract reset token from response
    const { resetToken } = response.data
    return { resetToken }
  }

  async resetPassword(data: ResetPasswordFormData): Promise<void> {
    await api.post('/api/auth/reset-password', {
      token: data.token,
      newPassword: data.newPassword,
    })
  }

  async changePassword(data: ChangePasswordFormData): Promise<void> {
    await api.request('/api/auth/change-password', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    })
  }

  async getProfile(): Promise<User> {
    const response = await api.request<{
      success: boolean
      data: {
        user: User
      }
    }>('/api/auth/profile', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    // Extract user from response
    return response.data.user
  }

  async checkAuth(): Promise<{ authenticated: boolean; user: User }> {
    const response = await api.request<{
      success: boolean
      data: {
        authenticated: boolean
        user: User
      }
    }>('/api/auth/check', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    // Extract auth status and user from response
    const { authenticated, user } = response.data
    return { authenticated, user }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.request<{
      success: boolean
      data: {
        message?: string
        user: User
      }
    }>('/api/auth/profile', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    // Extract user from response
    return response.data.user
  }
}

export const authApi = new AuthApiService()