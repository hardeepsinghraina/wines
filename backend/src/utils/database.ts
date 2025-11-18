import { Prisma } from '@prisma/client'
import { PaginationParams, PaginationMeta, SortParams } from '@/types/common'

// Database utility functions

export function createPaginationParams(
  page: number = 1,
  limit: number = 20
): PaginationParams {
  const normalizedPage = Math.max(1, page)
  const normalizedLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  }
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export function createSortParams(
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): SortParams {
  return {
    sortBy,
    sortOrder,
  }
}

// Generic repository base class
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected abstract model: any

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
    })
  }

  async findMany(params?: {
    where?: any
    orderBy?: any
    skip?: number
    take?: number
    include?: any
  }): Promise<T[]> {
    return await this.model.findMany(params)
  }

  async create(data: CreateInput): Promise<T> {
    return await this.model.create({
      data,
    })
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({
      where: { id },
    })
  }

  async count(where?: any): Promise<number> {
    return await this.model.count({ where })
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where })
    return count > 0
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  const { databaseService } = await import('@/services/database.service')
  return await databaseService.transaction(callback)
}

// Database error handling
export function handleDatabaseError(error: any): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new Error('A record with this information already exists')
      case 'P2025':
        throw new Error('Record not found')
      case 'P2003':
        throw new Error('Foreign key constraint failed')
      case 'P2014':
        throw new Error('Invalid ID provided')
      default:
        throw new Error(`Database error: ${error.message}`)
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new Error('Unknown database error occurred')
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new Error('Database connection error')
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new Error('Database initialization error')
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new Error('Database validation error')
  }

  throw error
}

// Query builders
export class QueryBuilder {
  static buildWhereClause(filters: Record<string, any>): any {
    const where: any = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && key.includes('search')) {
          where[key.replace('search', '')] = {
            contains: value,
            mode: 'insensitive',
          }
        } else if (Array.isArray(value)) {
          where[key] = {
            in: value,
          }
        } else {
          where[key] = value
        }
      }
    })

    return where
  }

  static buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc'): any {
    return {
      [sortBy]: sortOrder,
    }
  }
}