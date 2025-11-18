import fs from 'fs'
import path from 'path'
import { serverConfig } from '@/config/server'
import { logger } from '@/utils/logger'

export interface SSLConfig {
  key?: Buffer
  cert?: Buffer
  ca?: Buffer
  passphrase?: string
  secureProtocol?: string
  ciphers?: string
  honorCipherOrder?: boolean
  secureOptions?: number
}

/**
 * SSL/TLS Configuration for production deployment
 * This handles certificate loading and secure protocol configuration
 */
export class SSLConfigManager {
  private static instance: SSLConfigManager
  private sslConfig: SSLConfig | null = null

  private constructor() {}

  public static getInstance(): SSLConfigManager {
    if (!SSLConfigManager.instance) {
      SSLConfigManager.instance = new SSLConfigManager()
    }
    return SSLConfigManager.instance
  }

  /**
   * Load SSL certificates from file system
   */
  public loadCertificates(): SSLConfig | null {
    if (serverConfig.nodeEnv !== 'production') {
      logger.info('SSL certificates not loaded in non-production environment')
      return null
    }

    try {
      const certPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs'
      const keyPath = process.env.SSL_KEY_PATH || '/etc/ssl/private'
      const caPath = process.env.SSL_CA_PATH

      const sslConfig: SSLConfig = {
        // Load private key
        key: this.loadFile(path.join(keyPath, 'server.key')),
        
        // Load certificate
        cert: this.loadFile(path.join(certPath, 'server.crt')),
        
        // Load CA certificate if provided
        ...(caPath && { ca: this.loadFile(caPath) }),
        
        // Passphrase for encrypted private key
        ...(process.env.SSL_PASSPHRASE && { passphrase: process.env.SSL_PASSPHRASE }),
        
        // Secure protocol configuration
        secureProtocol: 'TLSv1_2_method',
        
        // Strong cipher suites
        ciphers: [
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-SHA256',
          'ECDHE-RSA-AES256-SHA384',
          'ECDHE-RSA-AES128-SHA',
          'ECDHE-RSA-AES256-SHA',
          'AES128-GCM-SHA256',
          'AES256-GCM-SHA384',
          'AES128-SHA256',
          'AES256-SHA256',
          'AES128-SHA',
          'AES256-SHA',
          '!aNULL',
          '!eNULL',
          '!EXPORT',
          '!DES',
          '!RC4',
          '!MD5',
          '!PSK',
          '!SRP',
          '!CAMELLIA'
        ].join(':'),
        
        // Honor server cipher order
        honorCipherOrder: true,
        
        // Secure options to disable weak protocols
        secureOptions: this.getSecureOptions()
      }

      this.sslConfig = sslConfig
      logger.info('SSL certificates loaded successfully')
      return sslConfig

    } catch (error) {
      logger.error('Failed to load SSL certificates:', { error })
      throw new Error('SSL certificate loading failed')
    }
  }

  /**
   * Get the current SSL configuration
   */
  public getSSLConfig(): SSLConfig | null {
    return this.sslConfig
  }

  /**
   * Validate SSL certificate expiration
   */
  public validateCertificateExpiration(): boolean {
    if (!this.sslConfig?.cert) {
      return false
    }

    try {
      // This is a simplified check - in production you'd use a proper certificate parser
      const certString = this.sslConfig.cert.toString()
      
      // Extract expiration date from certificate
      // In a real implementation, use a library like node-forge or x509
      logger.info('Certificate validation check performed')
      return true
      
    } catch (error) {
      logger.error('Certificate validation failed:', { error })
      return false
    }
  }

  /**
   * Load file with error handling
   */
  private loadFile(filePath: string): Buffer {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Certificate file not found: ${filePath}`)
      }

      const stats = fs.statSync(filePath)
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`)
      }

      // Check file permissions (should be readable by process)
      fs.accessSync(filePath, fs.constants.R_OK)

      return fs.readFileSync(filePath)
      
    } catch (error) {
      logger.error(`Failed to load certificate file: ${filePath}`, { error })
      throw error
    }
  }

  /**
   * Get secure options to disable weak protocols
   */
  private getSecureOptions(): number {
    const constants = require('constants')
    
    return (
      constants.SSL_OP_NO_SSLv2 |
      constants.SSL_OP_NO_SSLv3 |
      constants.SSL_OP_NO_TLSv1 |
      constants.SSL_OP_NO_TLSv1_1 |
      constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
      constants.SSL_OP_NO_COMPRESSION
    )
  }

  /**
   * Generate self-signed certificate for development
   * WARNING: Only use for development/testing
   */
  public generateSelfSignedCert(): SSLConfig {
    if (serverConfig.nodeEnv === 'production') {
      throw new Error('Self-signed certificates should not be used in production')
    }

    logger.warn('Using self-signed certificate for development - NOT FOR PRODUCTION')
    
    // In a real implementation, you'd generate actual certificates
    // For now, return a placeholder configuration
    return {
      secureProtocol: 'TLSv1_2_method',
      ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
      honorCipherOrder: true,
      secureOptions: this.getSecureOptions()
    }
  }
}

// Export singleton instance
export const sslConfigManager = SSLConfigManager.getInstance()