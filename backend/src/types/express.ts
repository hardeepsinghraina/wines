import { Request } from 'express'

// Extend Express Request interface for custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
      sessionId?: string
      requestId?: string
      apiKey?: any
      apiVersion?: string
      apiVersionInfo?: any
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    role: string
  }
}