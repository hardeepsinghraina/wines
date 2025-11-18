import { Response } from 'express'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
    timestamp: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// Helper functions for backward compatibility
export const successResponse = <T>(data: T, message?: string, meta?: any) => ({
  success: true,
  data,
  message,
  ...(meta && { meta }),
})

export const errorResponse = (message: string, code?: string, details?: any) => ({
  success: false,
  error: {
    code: code || 'ERROR',
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  },
})

export class ApiResponse {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    const response: any = {
      success: true
    };
    
    if (data !== undefined) {
      response.data = data;
    }
    
    if (message) {
      response.message = message;
    }
    
    return response;
  }

  static error(message: string, code?: number): ApiResponse {
    return {
      success: false,
      error: {
        code: code?.toString() || 'ERROR',
        message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export class ResponseHelper {
  static success<T>(res: Response, data: T, statusCode: number = 200, meta?: any): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(meta && { meta }),
    }

    return res.status(statusCode).json(response)
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: code || this.getErrorCode(statusCode),
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
      },
    }

    return res.status(statusCode).json(response)
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201)
  }

  static noContent(res: Response): Response {
    return res.status(204).send()
  }

  static badRequest(res: Response, message: string = 'Bad Request', details?: any): Response {
    return this.error(res, message, 400, 'BAD_REQUEST', details)
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401, 'UNAUTHORIZED')
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403, 'FORBIDDEN')
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404, 'NOT_FOUND')
  }

  static conflict(res: Response, message: string = 'Conflict'): Response {
    return this.error(res, message, 409, 'CONFLICT')
  }

  static validationError(res: Response, message: string = 'Validation Error', details?: any): Response {
    return this.error(res, message, 422, 'VALIDATION_ERROR', details)
  }

  static tooManyRequests(res: Response, message: string = 'Too Many Requests'): Response {
    return this.error(res, message, 429, 'TOO_MANY_REQUESTS')
  }

  static internalServerError(res: Response, message: string = 'Internal Server Error'): Response {
    return this.error(res, message, 500, 'INTERNAL_SERVER_ERROR')
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const totalPages = Math.ceil(total / limit)
    
    return this.success(res, data, 200, {
      page,
      limit,
      total,
      totalPages,
    })
  }

  private static getErrorCode(statusCode: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    }

    return errorCodes[statusCode] || 'UNKNOWN_ERROR'
  }
}