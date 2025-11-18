import { Request, Response } from 'express'
import { ProductService } from '../services/product.service'
import { ResponseHelper } from '../utils/response'
import { logger } from '../utils/logger'
import { 
  WineSearchParams, 
  CreateWineRequest, 
  UpdateWineRequest,
  WineFilters 
} from '../types/product'

export class ProductController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
  }

  /**
   * Get all wines with filtering and pagination
   * GET /api/products
   */
  getWines = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('getWines controller called with query:', req.query)
      
      const sortBy = req.query.sortBy as string
      const validSortBy = ['name', 'createdAt', 'rating', 'vintage', 'price'].includes(sortBy) ? sortBy : 'createdAt'
      
      const params: WineSearchParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: validSortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      }

      // Add optional filters only if they exist
      if (req.query.search) {
        params.search = req.query.search as string
      }
      
      // Handle category filter (can be single value or array)
      if (req.query.category) {
        params.category = Array.isArray(req.query.category) 
          ? req.query.category as any 
          : [req.query.category] as any
      }
      
      // Handle region filter (can be single value or array)
      if (req.query.region) {
        params.region = Array.isArray(req.query.region) 
          ? req.query.region as string[] 
          : [req.query.region] as string[]
        logger.info('Region filter applied:', params.region)
      }
      
      // Handle producer filter (can be single value or array)
      if (req.query.producer) {
        params.producer = Array.isArray(req.query.producer) 
          ? req.query.producer as string[] 
          : [req.query.producer] as string[]
      }
      
      // Handle vintage filter (can be single value or range)
      if (req.query.vintage) {
        const vintageValue = parseInt(req.query.vintage as string)
        params.vintage = {
          min: vintageValue,
          max: vintageValue
        }
      } else if (req.query.vintageMin || req.query.vintageMax) {
        params.vintage = {
          ...(req.query.vintageMin && { min: parseInt(req.query.vintageMin as string) }),
          ...(req.query.vintageMax && { max: parseInt(req.query.vintageMax as string) })
        }
      }
      
      // Handle price filter
      if (req.query.priceMin || req.query.priceMax || req.query.priceCurrency) {
        params.price = {
          ...(req.query.priceMin && { min: parseFloat(req.query.priceMin as string) }),
          ...(req.query.priceMax && { max: parseFloat(req.query.priceMax as string) }),
          ...(req.query.priceCurrency && { currency: req.query.priceCurrency as any })
        }
      }
      
      // Handle boolean filters
      if (req.query.featured) {
        params.featured = req.query.featured === 'true'
      }
      
      if (req.query.availability) {
        params.availability = req.query.availability === 'true'
      }

      logger.info('Calling productService.getWines with params:', params)
      const result = await this.productService.getWines(params)
      logger.info('Got result from productService:', { count: result?.wines?.length })
      
      ResponseHelper.success(res, result)
    } catch (error) {
      logger.error('Error in getWines controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Get wine by ID
   * GET /api/products/:id
   */
  getWineById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      if (!id) {
        ResponseHelper.badRequest(res, 'Wine ID is required')
        return
      }
      
      const wine = await this.productService.getWineById(id)
      
      ResponseHelper.success(res, wine)
    } catch (error) {
      logger.error('Error in getWineById controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Create new wine
   * POST /api/products
   */
  createWine = async (req: Request, res: Response): Promise<void> => {
    try {
      const wineData: CreateWineRequest = req.body
      const wine = await this.productService.createWine(wineData)
      
      ResponseHelper.created(res, wine)
    } catch (error) {
      logger.error('Error in createWine controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Update wine
   * PUT /api/products/:id
   */
  updateWine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      if (!id) {
        ResponseHelper.badRequest(res, 'Wine ID is required')
        return
      }
      
      const updateData: UpdateWineRequest = { ...req.body, id }
      const wine = await this.productService.updateWine(id, updateData)
      
      ResponseHelper.success(res, wine)
    } catch (error) {
      logger.error('Error in updateWine controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Delete wine
   * DELETE /api/products/:id
   */
  deleteWine = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      if (!id) {
        ResponseHelper.badRequest(res, 'Wine ID is required')
        return
      }
      
      await this.productService.deleteWine(id)
      
      ResponseHelper.noContent(res)
    } catch (error) {
      logger.error('Error in deleteWine controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Search wines
   * GET /api/products/search
   */
  searchWines = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string
      if (!query) {
        ResponseHelper.badRequest(res, 'Search query is required')
        return
      }

      const params: WineSearchParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        ...(req.query.category && {
          category: Array.isArray(req.query.category) ? req.query.category as any : [req.query.category] as any
        }),
        ...(req.query.region && {
          region: Array.isArray(req.query.region) ? req.query.region as string[] : [req.query.region] as string[]
        }),
        ...(req.query.producer && {
          producer: Array.isArray(req.query.producer) ? req.query.producer as string[] : [req.query.producer] as string[]
        }),
        ...((req.query.vintageMin || req.query.vintageMax) && {
          vintage: {
            ...(req.query.vintageMin && { min: parseInt(req.query.vintageMin as string) }),
            ...(req.query.vintageMax && { max: parseInt(req.query.vintageMax as string) })
          }
        }),
        ...((req.query.priceMin || req.query.priceMax || req.query.priceCurrency) && {
          price: {
            ...(req.query.priceMin && { min: parseFloat(req.query.priceMin as string) }),
            ...(req.query.priceMax && { max: parseFloat(req.query.priceMax as string) }),
            ...(req.query.priceCurrency && { currency: req.query.priceCurrency as any })
          }
        }),
        ...(req.query.featured && { featured: req.query.featured === 'true' }),
        ...(req.query.availability && { availability: req.query.availability === 'true' })
      }

      const result = await this.productService.searchWines(query, params)
      
      ResponseHelper.success(res, result)
    } catch (error) {
      logger.error('Error in searchWines controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Get search suggestions for autocomplete
   * GET /api/products/search/suggestions
   */
  getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string
      if (!query) {
        ResponseHelper.badRequest(res, 'Search query is required')
        return
      }

      const limit = parseInt(req.query.limit as string) || 10
      const suggestions = await this.productService.getSearchSuggestions(query)
      
      ResponseHelper.success(res, suggestions)
    } catch (error) {
      logger.error('Error in getSearchSuggestions controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Get filter options
   * GET /api/products/filters
   */
  getFilterOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const options = await this.productService.getFilterOptions()
      
      ResponseHelper.success(res, options)
    } catch (error) {
      logger.error('Error in getFilterOptions controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Get wine categories
   * GET /api/products/categories
   */
  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.productService.getCategories()
      
      ResponseHelper.success(res, categories)
    } catch (error) {
      logger.error('Error in getCategories controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }

  /**
   * Get featured wines
   * GET /api/products/featured
   */
  getFeaturedWines = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 8
      const wines = await this.productService.getFeaturedWines(limit)
      
      ResponseHelper.success(res, wines)
    } catch (error) {
      logger.error('Error in getFeaturedWines controller:', error)
      if (error instanceof Error) {
        ResponseHelper.error(res, error.message, 500)
        return
      }
      ResponseHelper.internalServerError(res)
    }
  }
}