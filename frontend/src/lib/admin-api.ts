import { 
  AdminLoginRequest, 
  AdminLoginResponse, 
  MFAVerifyRequest, 
  MFASetupRequest, 
  MFASetupResponse,
  AdminAuthResponse,
  AdminUser
} from '@/types/admin'

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class AdminApiClient {
  private baseURL: string
  private accessToken: string | null = null

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/admin/auth`
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('admin_access_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for refresh token
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('admin_access_token', token)
      } else {
        localStorage.removeItem('admin_access_token')
      }
    }
  }

  /**
   * Admin login
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await this.request<AdminLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    // If login successful and no MFA required, store token
    if (response.accessToken) {
      this.setAccessToken(response.accessToken)
    }

    return response
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(mfaData: MFAVerifyRequest): Promise<AdminAuthResponse> {
    const response = await this.request<AdminAuthResponse>('/verify-mfa', {
      method: 'POST',
      body: JSON.stringify(mfaData),
    })

    // Store access token after successful MFA verification
    if (response.accessToken) {
      this.setAccessToken(response.accessToken)
    }

    return response
  }

  /**
   * Setup MFA
   */
  async setupMFA(): Promise<MFASetupResponse> {
    return this.request<MFASetupResponse>('/mfa/setup', {
      method: 'POST',
    })
  }

  /**
   * Confirm MFA setup
   */
  async confirmMFASetup(setupData: MFASetupRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/mfa/confirm', {
      method: 'POST',
      body: JSON.stringify(setupData),
    })
  }

  /**
   * Disable MFA
   */
  async disableMFA(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/mfa', {
      method: 'DELETE',
    })
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await this.request<{ accessToken: string }>('/refresh-token', {
      method: 'POST',
    })

    if (response.accessToken) {
      this.setAccessToken(response.accessToken)
    }

    return response
  }

  /**
   * Logout admin
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.request<{ message: string }>('/logout', {
        method: 'POST',
      })
      
      this.setAccessToken(null)
      return response
    } catch (error) {
      // Clear token even if logout request fails
      this.setAccessToken(null)
      throw error
    }
  }

  /**
   * Get admin profile
   */
  async getProfile(): Promise<{ admin: AdminUser }> {
    return this.request<{ admin: AdminUser }>('/profile')
  }

  /**
   * Get admin permissions
   */
  async getPermissions(): Promise<{ permissions: string[]; role: string }> {
    return this.request<{ permissions: string[]; role: string }>('/permissions')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }
}

export const adminApi = new AdminApiClient()