import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { logger } from '@/utils/logger'
import { redisService } from '@/services/redis.service'

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxLength: number
  preventCommonPasswords: boolean
  preventReuse: number // Number of previous passwords to check
}

export interface PasswordStrengthResult {
  isValid: boolean
  score: number // 0-100
  feedback: string[]
  estimatedCrackTime: string
}

export class PasswordSecurityService {
  private readonly defaultPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxLength: 128,
    preventCommonPasswords: true,
    preventReuse: 5
  }

  private readonly commonPasswords = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'welcome123', 'admin123', 'root', 'toor', 'pass',
    'test', 'guest', 'user', 'demo', 'temp', 'changeme'
  ])

  /**
   * Validate password against security policy
   */
  validatePassword(password: string, policy: Partial<PasswordPolicy> = {}): PasswordStrengthResult {
    const activePolicy = { ...this.defaultPolicy, ...policy }
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length < activePolicy.minLength) {
      feedback.push(`Password must be at least ${activePolicy.minLength} characters long`)
    } else if (password.length >= activePolicy.minLength) {
      score += 20
    }

    if (password.length > activePolicy.maxLength) {
      feedback.push(`Password must not exceed ${activePolicy.maxLength} characters`)
    }

    // Character requirements
    if (activePolicy.requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
    } else if (activePolicy.requireUppercase) {
      score += 15
    }

    if (activePolicy.requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
    } else if (activePolicy.requireLowercase) {
      score += 15
    }

    if (activePolicy.requireNumbers && !/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
    } else if (activePolicy.requireNumbers) {
      score += 15
    }

    if (activePolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character')
    } else if (activePolicy.requireSpecialChars) {
      score += 15
    }

    // Common password check
    if (activePolicy.preventCommonPasswords && this.isCommonPassword(password)) {
      feedback.push('Password is too common, please choose a more unique password')
      score = Math.max(0, score - 30)
    }

    // Pattern detection
    if (this.hasRepeatingPatterns(password)) {
      feedback.push('Password contains repeating patterns, consider making it more complex')
      score = Math.max(0, score - 10)
    }

    if (this.hasSequentialChars(password)) {
      feedback.push('Password contains sequential characters, consider making it more random')
      score = Math.max(0, score - 10)
    }

    // Bonus points for length and complexity
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10
    if (this.hasVariedCharacterTypes(password)) score += 10

    const estimatedCrackTime = this.estimateCrackTime(password)
    
    return {
      isValid: feedback.length === 0 && score >= 60,
      score: Math.min(100, score),
      feedback,
      estimatedCrackTime
    }
  }

  /**
   * Check if password was used recently
   */
  async checkPasswordReuse(userId: string, newPassword: string, policy: Partial<PasswordPolicy> = {}): Promise<boolean> {
    try {
      const activePolicy = { ...this.defaultPolicy, ...policy }
      if (activePolicy.preventReuse === 0) return false

      const historyKey = `password_history:${userId}`
      const history = await redisService.lrange(historyKey, 0, activePolicy.preventReuse - 1)

      for (const hashedPassword of history) {
        if (await bcrypt.compare(newPassword, hashedPassword)) {
          return true // Password was used recently
        }
      }

      return false
    } catch (error) {
      logger.error('Failed to check password reuse', { userId, error })
      return false
    }
  }

  /**
   * Store password in history for reuse prevention
   */
  async storePasswordHistory(userId: string, hashedPassword: string, policy: Partial<PasswordPolicy> = {}): Promise<void> {
    try {
      const activePolicy = { ...this.defaultPolicy, ...policy }
      if (activePolicy.preventReuse === 0) return

      const historyKey = `password_history:${userId}`
      
      // Add new password to front of list
      await redisService.lpush(historyKey, hashedPassword)
      
      // Trim list to keep only required number of passwords
      await redisService.ltrim(historyKey, 0, activePolicy.preventReuse - 1)
      
      // Set expiration (keep for 1 year)
      await redisService.expire(historyKey, 365 * 24 * 60 * 60)
    } catch (error) {
      logger.error('Failed to store password history', { userId, error })
    }
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = lowercase + uppercase + numbers + symbols
    let password = ''
    
    // Ensure at least one character from each category
    password += lowercase[crypto.randomInt(lowercase.length)]
    password += uppercase[crypto.randomInt(uppercase.length)]
    password += numbers[crypto.randomInt(numbers.length)]
    password += symbols[crypto.randomInt(symbols.length)]
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('')
  }

  /**
   * Generate secure reset token
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Hash password with secure settings
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Check if password is in common passwords list
   */
  private isCommonPassword(password: string): boolean {
    return this.commonPasswords.has(password.toLowerCase())
  }

  /**
   * Check for repeating patterns
   */
  private hasRepeatingPatterns(password: string): boolean {
    // Check for 3+ repeating characters
    if (/(.)\1{2,}/.test(password)) return true
    
    // Check for repeating patterns like "abcabc"
    for (let i = 2; i <= password.length / 2; i++) {
      const pattern = password.substring(0, i)
      const repeated = pattern.repeat(Math.floor(password.length / i))
      if (password.startsWith(repeated) && repeated.length >= 6) {
        return true
      }
    }
    
    return false
  }

  /**
   * Check for sequential characters
   */
  private hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      'qwertyuiopasdfghjklzxcvbnm'
    ]
    
    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 4; i++) {
        const subseq = sequence.substring(i, i + 4)
        if (password.includes(subseq) || password.includes(subseq.split('').reverse().join(''))) {
          return true
        }
      }
    }
    
    return false
  }

  /**
   * Check if password has varied character types
   */
  private hasVariedCharacterTypes(password: string): boolean {
    const types = [
      /[a-z]/.test(password), // lowercase
      /[A-Z]/.test(password), // uppercase
      /\d/.test(password),    // numbers
      /[!@#$%^&*(),.?":{}|<>]/.test(password), // special chars
    ]
    
    return types.filter(Boolean).length >= 3
  }

  /**
   * Estimate password crack time
   */
  private estimateCrackTime(password: string): string {
    let charsetSize = 0
    
    if (/[a-z]/.test(password)) charsetSize += 26
    if (/[A-Z]/.test(password)) charsetSize += 26
    if (/\d/.test(password)) charsetSize += 10
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) charsetSize += 32
    
    const combinations = Math.pow(charsetSize, password.length)
    const guessesPerSecond = 1000000000 // 1 billion guesses per second (modern hardware)
    const secondsToCrack = combinations / (2 * guessesPerSecond) // Average case
    
    if (secondsToCrack < 60) return 'Less than 1 minute'
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`
    
    return 'Centuries'
  }
}

export const passwordSecurityService = new PasswordSecurityService()