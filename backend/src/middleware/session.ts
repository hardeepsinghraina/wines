import session from 'express-session'
import { serverConfig } from '@/config/server'

// Session configuration (Redis store disabled for now)
export const sessionConfig = session({
  secret: serverConfig.jwtSecret,
  name: 'luxury_wine_session',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: serverConfig.nodeEnv === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict', // CSRF protection
  },
})

// Session types
declare module 'express-session' {
  interface SessionData {
    userId?: string
    userRole?: string
    isAuthenticated?: boolean
    lastActivity?: number
    cartId?: string
    preferences?: {
      currency?: string
      language?: string
    }
  }
}