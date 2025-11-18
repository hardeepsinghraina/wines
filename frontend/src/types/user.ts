export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  phone?: string
  dateOfBirth?: string
  preferences?: {
    currency?: string
    language?: string
    notifications?: boolean
  }
}

export interface AuthUser {
  user: User
  token: string
  refreshToken?: string
}

export interface Address {
  id?: string
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}