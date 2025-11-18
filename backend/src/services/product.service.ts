import { PrismaClient } from '@prisma/client'
import {
  Wine,
  CreateWineRequest,
  UpdateWineRequest,
  WineFilters,
  WineSearchParams,
  WineListResponse,
  WineDetailResponse,
  WineCategory
} from '../types/product'
import { AppError } from '../middleware/joi-validation'
import { logger } from '../utils/logger'

export class ProductService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Get all wines with filtering and pagination
   */
  async getWines(params: WineSearchParams): Promise<WineListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...filters
      } = params

      logger.info('getWines service called with filters:', filters)

      const skip = (page - 1) * limit
      const where = this.buildWhereClause(filters)
      logger.info('Built where clause:', JSON.stringify(where, null, 2))
      const orderBy = this.buildOrderByClause(sortBy, sortOrder)

      const [wines, total] = await Promise.all([
        this.prisma.wine.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            specification: true
          }
        }),
        this.prisma.wine.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        wines: wines.map(this.transformWineData),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    } catch (error) {
      logger.error('Error fetching wines:', error)
      throw new AppError('Failed to fetch wines', 500)
    }
  }

  /**
   * Get wine by ID with detailed information
   */
  async getWineById(id: string): Promise<WineDetailResponse> {
    try {
      const wine = await this.prisma.wine.findUnique({
        where: { id },
        include: {
          specification: true,
          nftCollection: true
        }
      })

      if (!wine) {
        throw new AppError('Wine not found', 404)
      }

      // Get related wines (same category, different wines)
      const relatedWines = await this.prisma.wine.findMany({
        where: {
          category: wine.category,
          id: { not: wine.id },
          isActive: true
        },
        take: 4,
        include: {
          specification: true
        }
      })

      return {
        ...this.transformWineData(wine),
        relatedWines: relatedWines.map(this.transformWineData),
        averageRating: 0,
        reviewCount: 0
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error fetching wine by ID:', error)
      throw new AppError('Failed to fetch wine', 500)
    }
  }

  /**
   * Create a new wine product
   */
  async createWine(data: CreateWineRequest): Promise<Wine> {
    try {
      const wine = await this.prisma.wine.create({
        data: {
          sku: `WINE-${Date.now()}`,
          name: data.name,
          producer: data.producer,
          region: data.region,
          vintage: data.vintage,
          category: data.category,
          description: data.description,
          tastingNotes: data.tastingNotes || null,
          alcoholContent: data.alcoholContent,
          bottleSize: data.bottleSize,
          originalPrice: data.prices.find(p => p.currency === 'EUR')?.price || 0,
          currentPrice: data.prices.find(p => p.currency === 'EUR')?.price || 0,
          price: data.prices.find(p => p.currency === 'EUR')?.price || 0,
          currency: 'EUR',
          stock: 0
        },
        include: {
          specification: true
        }
      })

      return this.transformWineData(wine)
    } catch (error) {
      logger.error('Error creating wine:', error)
      throw new AppError('Failed to create wine', 500)
    }
  }

  /**
   * Update wine product
   */
  async updateWine(id: string, data: UpdateWineRequest): Promise<Wine> {
    try {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.producer !== undefined) updateData.producer = data.producer
      if (data.region !== undefined) updateData.region = data.region
      if (data.vintage !== undefined) updateData.vintage = data.vintage
      if (data.category !== undefined) updateData.category = data.category
      if (data.description !== undefined) updateData.description = data.description
      if (data.tastingNotes !== undefined) updateData.tastingNotes = data.tastingNotes
      if (data.alcoholContent !== undefined) updateData.alcoholContent = data.alcoholContent
      if (data.bottleSize !== undefined) updateData.bottleSize = data.bottleSize
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
      if (data.isNftAvailable !== undefined) updateData.isNftAvailable = data.isNftAvailable

      const wine = await this.prisma.wine.update({
        where: { id },
        data: updateData,
        include: {
          specification: true
        }
      })

      return this.transformWineData(wine)
    } catch (error) {
      logger.error('Error updating wine:', error)
      throw new AppError('Failed to update wine', 500)
    }
  }

  /**
   * Delete wine product
   */
  async deleteWine(id: string): Promise<void> {
    try {
      await this.prisma.wine.delete({
        where: { id }
      })
    } catch (error) {
      logger.error('Error deleting wine:', error)
      throw new AppError('Failed to delete wine', 500)
    }
  }

  /**
   * Search wines with text query
   */
  async searchWines(query: string, params: WineSearchParams): Promise<WineListResponse> {
    try {
      const searchFilters: WineFilters = {
        ...params,
        search: query
      }

      return this.getWines({ ...params, ...searchFilters })
    } catch (error) {
      logger.error('Error searching wines:', error)
      throw new AppError('Failed to search wines', 500)
    }
  }

  /**
   * Get featured wines
   */
  async getFeaturedWines(limit: number = 8): Promise<Wine[]> {
    try {
      const wines = await this.prisma.wine.findMany({
        where: {
          isFeatured: true,
          isActive: true
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          specification: true
        }
      })

      return wines.map(this.transformWineData)
    } catch (error) {
      logger.error('Error fetching featured wines:', error)
      throw new AppError('Failed to fetch featured wines', 500)
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<{
    wines: Array<{ id: string; name: string; producer: string; region: string }>;
    producers: string[];
    regions: string[];
  }> {
    try {
      if (!query.trim()) {
        return { wines: [], producers: [], regions: [] }
      }

      const searchQuery = query.trim()

      const [wines, producers, regions] = await Promise.all([
        this.prisma.wine.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: searchQuery } },
              { producer: { contains: searchQuery } },
              { region: { contains: searchQuery } }
            ]
          },
          select: {
            id: true,
            name: true,
            producer: true,
            region: true
          },
          take: limit,
          orderBy: { name: 'asc' }
        }),
        this.prisma.wine.findMany({
          where: {
            isActive: true,
            producer: { contains: searchQuery }
          },
          select: { producer: true },
          distinct: ['producer'],
          take: 5,
          orderBy: { producer: 'asc' }
        }),
        this.prisma.wine.findMany({
          where: {
            isActive: true,
            region: { contains: searchQuery }
          },
          select: { region: true },
          distinct: ['region'],
          take: 5,
          orderBy: { region: 'asc' }
        })
      ])

      return {
        wines,
        producers: producers.map((p: any) => p.producer),
        regions: regions.map((r: any) => r.region)
      }
    } catch (error) {
      logger.error('Error getting search suggestions:', error)
      throw new AppError('Failed to get search suggestions', 500)
    }
  }

  /**
   * Get filter options with counts
   */
  async getFilterOptions(): Promise<{
    regions: Array<{ name: string; count: number }>;
    producers: Array<{ name: string; count: number }>;
    vintages: { min: number; max: number };
    priceRanges: Array<{ currency: string; min: number; max: number }>;
    categories: Array<{ name: string; count: number }>;
  }> {
    try {
      const [regionGroups, producerGroups, vintageStats, categoryGroups] = await Promise.all([
        this.prisma.wine.groupBy({
          by: ['region'],
          where: { isActive: true },
          _count: { id: true },
          orderBy: { region: 'asc' }
        }),
        this.prisma.wine.groupBy({
          by: ['producer'],
          where: { isActive: true },
          _count: { id: true },
          orderBy: { producer: 'asc' }
        }),
        this.prisma.wine.aggregate({
          where: { isActive: true },
          _min: { vintage: true },
          _max: { vintage: true }
        }),
        this.prisma.wine.groupBy({
          by: ['category'],
          where: { isActive: true },
          _count: { id: true },
          orderBy: { category: 'asc' }
        })
      ])

      return {
        regions: regionGroups.map((r: any) => ({
          name: r.region,
          count: r._count.id
        })),
        producers: producerGroups.map((p: any) => ({
          name: p.producer,
          count: p._count.id
        })),
        vintages: {
          min: vintageStats._min.vintage || new Date().getFullYear() - 50,
          max: vintageStats._max.vintage || new Date().getFullYear()
        },
        priceRanges: [],
        categories: categoryGroups.map((c: any) => ({
          name: c.category,
          count: c._count.id
        }))
      }
    } catch (error) {
      logger.error('Error getting filter options:', error)
      throw new AppError('Failed to get filter options', 500)
    }
  }

  /**
   * Get categories with counts
   */
  async getCategories(): Promise<Array<{ category: WineCategory; count: number }>> {
    try {
      const categories = await this.prisma.wine.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: {
          id: true
        }
      })

      return categories.map((cat: any) => ({
        category: cat.category as WineCategory,
        count: cat._count.id
      }))
    } catch (error) {
      logger.error('Error fetching categories:', error)
      throw new AppError('Failed to fetch categories', 500)
    }
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: WineFilters): any {
    const where: any = {
      isActive: true
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { producer: { contains: filters.search } },
        { region: { contains: filters.search } }
      ]
    }

    if (filters.category) {
      where.category = { in: Array.isArray(filters.category) ? filters.category : [filters.category] }
    }

    if (filters.region && filters.region.length > 0) {
      // Support partial matching for regions (e.g., "Burgundy" matches "Burgundy & Champagne, France")
      console.log('REGION FILTER:', filters.region)
      if (filters.region.length === 1) {
        // Single region: use contains for partial matching
        where.region = { contains: filters.region[0] }
        console.log('WHERE REGION:', where.region)
      } else {
        // Multiple regions: use OR with contains for each
        const regionConditions = filters.region.map(region => ({
          region: { contains: region }
        }))
        
        if (where.OR) {
          // If OR already exists (from search), wrap both in AND
          where.AND = [
            { OR: where.OR },
            { OR: regionConditions }
          ]
          delete where.OR
        } else {
          where.OR = regionConditions
        }
      }
    }

    if (filters.producer) {
      where.producer = { in: Array.isArray(filters.producer) ? filters.producer : [filters.producer] }
    }

    if (filters.vintage) {
      where.vintage = {}
      if (filters.vintage.min) where.vintage.gte = filters.vintage.min
      if (filters.vintage.max) where.vintage.lte = filters.vintage.max
    }

    if (filters.price) {
      where.price = {}
      if (filters.price.min !== undefined) where.price.gte = filters.price.min
      if (filters.price.max !== undefined) where.price.lte = filters.price.max
      // Note: Currency filtering would require a more complex query with price table joins
    }

    if (filters.availability !== undefined) {
      // Assuming availability means stock > 0
      if (filters.availability) {
        where.stock = { gt: 0 }
      }
    }

    if (filters.featured !== undefined) {
      where.isFeatured = filters.featured
    }

    return where
  }

  /**
   * Build order by clause
   */
  private buildOrderByClause(sortBy: string, sortOrder: string): any {
    const orderBy: any = {}
    
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder
        break
      case 'vintage':
        orderBy.vintage = sortOrder
        break
      case 'createdAt':
      default:
        orderBy.createdAt = sortOrder
        break
    }

    return orderBy
  }

  /**
   * Transform wine data for API response
   */
  private transformWineData = (wine: any): Wine => {
    return {
      id: wine.id,
      name: wine.name,
      producer: wine.producer,
      description: wine.description,
      region: wine.region,
      vintage: wine.vintage,
      category: wine.category,
      tastingNotes: wine.tastingNotes,
      alcoholContent: wine.alcoholContent,
      bottleSize: wine.bottleSize,
      sku: wine.sku || '',
      // Price fields
      price: wine.price || wine.currentPrice || 0,
      currentPrice: wine.currentPrice || wine.price || 0,
      originalPrice: wine.originalPrice || wine.currentPrice || wine.price || 0,
      discountPercent: wine.discountPercent || 0,
      currency: wine.currency || 'EUR',
      // Stock and availability
      stock: wine.stock || 0,
      isActive: wine.isActive,
      isFeatured: wine.isFeatured,
      isNftAvailable: wine.isNftAvailable,
      // Image
      imageUrl: wine.imageUrl || '',
      createdAt: wine.createdAt,
      updatedAt: wine.updatedAt,
      prices: [],
      inventory: [],
      images: [],
      specifications: wine.specification ? {
        id: wine.specification.id,
        wineId: wine.specification.wineId,
        grapeVariety: wine.specification.grapeVariety ? JSON.parse(wine.specification.grapeVariety) : [],
        servingTemp: wine.specification.servingTemp,
        foodPairing: wine.specification.foodPairing,
        awards: wine.specification.awards ? JSON.parse(wine.specification.awards) : [],
        createdAt: wine.specification.createdAt,
        updatedAt: wine.specification.updatedAt
      } : undefined,
      reviews: [],
      nfts: []
    }
  }
}