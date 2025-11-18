import { Request, Response, NextFunction } from 'express'
import { ApiResponseHelper } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export interface ApiVersion {
  version: string
  deprecated?: boolean
  deprecationDate?: string
  sunsetDate?: string
  supportedUntil?: string
}

export const API_VERSIONS: Record<string, ApiVersion> = {
  'v1': {
    version: '1.0.0',
    deprecated: false
  },
  'v2': {
    version: '2.0.0',
    deprecated: false
  }
}

export const CURRENT_VERSION = 'v1'
export const SUPPORTED_VERSIONS = Object.keys(API_VERSIONS)

/**
 * API versioning middleware
 */
export const apiVersioning = (req: Request, res: Response, next: NextFunction): Response | void => {
  // Extract version from URL path (e.g., /api/v1/products)
  const pathVersion = extractVersionFromPath(req.path)
  
  // Extract version from Accept header (e.g., application/vnd.api+json;version=1)
  const headerVersion = extractVersionFromHeader(req.get('Accept'))
  
  // Extract version from custom header
  const customHeaderVersion = req.get('API-Version')
  
  // Determine the version to use (priority: custom header > path > accept header > default)
  const requestedVersion = customHeaderVersion || pathVersion || headerVersion || CURRENT_VERSION
  
  // Validate version
  if (!isVersionSupported(requestedVersion)) {
    return ApiResponseHelper.badRequest(
      res,
      `Unsupported API version: ${requestedVersion}`,
      {
        supportedVersions: SUPPORTED_VERSIONS,
        currentVersion: CURRENT_VERSION
      },
      req.requestId
    )
  }

  // Add version info to request
  req.apiVersion = requestedVersion || CURRENT_VERSION
  req.apiVersionInfo = API_VERSIONS[requestedVersion || CURRENT_VERSION] || API_VERSIONS[CURRENT_VERSION]

  // Add version headers to response
  res.set('API-Version', requestedVersion || CURRENT_VERSION)
  res.set('API-Supported-Versions', SUPPORTED_VERSIONS.join(', '))

  // Check for deprecated version
  const versionInfo = API_VERSIONS[requestedVersion || CURRENT_VERSION]
  if (versionInfo && versionInfo.deprecated) {
    res.set('API-Deprecated', 'true')
    
    if (versionInfo.deprecationDate) {
      res.set('API-Deprecation-Date', versionInfo.deprecationDate)
    }
    
    if (versionInfo.sunsetDate) {
      res.set('API-Sunset-Date', versionInfo.sunsetDate)
    }

    // Log deprecated version usage
    logger.warn('Deprecated API version used', {
      version: requestedVersion,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      deprecationDate: versionInfo.deprecationDate,
      sunsetDate: versionInfo.sunsetDate
    })
  }

  next()
}

/**
 * Version-specific route handler
 */
export const versionHandler = (handlers: Record<string, Function>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = req.apiVersion || CURRENT_VERSION
    const handler = handlers[version] || handlers[CURRENT_VERSION]
    
    if (!handler) {
      return ApiResponseHelper.badRequest(
        res,
        `No handler available for API version: ${version}`,
        { availableVersions: Object.keys(handlers) },
        req.requestId
      )
    }

    return handler(req, res, next)
  }
}

/**
 * Deprecation warning middleware
 */
export const deprecationWarning = (
  version: string,
  message?: string,
  sunsetDate?: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('API-Deprecated', 'true')
    res.set('API-Deprecation-Warning', message || `API version ${version} is deprecated`)
    
    if (sunsetDate) {
      res.set('API-Sunset-Date', sunsetDate)
    }

    logger.warn('Deprecated API endpoint accessed', {
      version,
      path: req.path,
      method: req.method,
      message,
      sunsetDate,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })

    next()
  }
}

/**
 * Extract version from URL path
 */
function extractVersionFromPath(path: string): string | null {
  const versionMatch = path.match(/\/api\/v(\d+)/)
  return versionMatch ? `v${versionMatch[1]}` : null
}

/**
 * Extract version from Accept header
 */
function extractVersionFromHeader(acceptHeader?: string): string | null {
  if (!acceptHeader) return null
  
  const versionMatch = acceptHeader.match(/version=(\d+)/)
  return versionMatch ? `v${versionMatch[1]}` : null
}

/**
 * Check if version is supported
 */
function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version)
}

/**
 * Get version compatibility info
 */
export const getVersionCompatibility = (req: Request, res: Response): Response => {
  const compatibility = {
    currentVersion: CURRENT_VERSION,
    supportedVersions: SUPPORTED_VERSIONS,
    versions: Object.entries(API_VERSIONS).map(([key, info]) => ({
      versionKey: key,
      ...info,
      status: info.deprecated ? 'deprecated' : 'active'
    })),
    requestedVersion: req.apiVersion,
    timestamp: new Date().toISOString()
  }

  return ApiResponseHelper.success(res, compatibility, 'API version compatibility information')
}

/**
 * Middleware to enforce minimum API version
 */
export const requireMinVersion = (minVersion: string) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const currentVersion = req.apiVersion || CURRENT_VERSION || ''
    
    if (!isVersionGreaterOrEqual(currentVersion, minVersion)) {
      return ApiResponseHelper.badRequest(
        res,
        `This endpoint requires API version ${minVersion} or higher`,
        {
          currentVersion,
          requiredVersion: minVersion,
          upgradeInstructions: 'Please update your API version in the request headers or URL path'
        },
        req.requestId
      )
    }

    next()
  }
}

/**
 * Compare version strings
 */
function isVersionGreaterOrEqual(version1: string, version2: string): boolean {
  const v1 = parseInt(version1.replace('v', ''))
  const v2 = parseInt(version2.replace('v', ''))
  return v1 >= v2
}

/**
 * Content negotiation based on API version
 */
export const contentNegotiation = (req: Request, res: Response, next: NextFunction) => {
  const version = req.apiVersion || CURRENT_VERSION
  const acceptHeader = req.get('Accept') || 'application/json'

  // Set appropriate content type based on version and accept header
  if (acceptHeader.includes('application/vnd.api+json')) {
    res.set('Content-Type', `application/vnd.api+json;version=${version}`)
  } else {
    res.set('Content-Type', 'application/json')
  }

  // Add version-specific response transformations here if needed
  next()
}

// Extend Express Request interface
