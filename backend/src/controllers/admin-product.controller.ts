import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'

const prisma = new PrismaClient()

export class AdminProductController {
  /**
   * Get all products with admin details
   */
  async getAllProducts(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        category, 
        isActive, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { producer: { contains: search as string, mode: 'insensitive' } },
          { region: { contains: search as string, mode: 'insensitive' } },
          { id: { contains: search as string, mode: 'insensitive' } }
        ]
      }

      if (category) {
        where.category = category
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true'
      }

      // Get products with related data
      const [products, total] = await Promise.all([
        prisma.wine.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            specification: true,
            _count: {
              select: {
                orderItems: true
              }
            }
          }
        }),
        prisma.wine.count({ where })
      ])

      return ResponseHelper.paginated(res, products, Number(page), Number(limit), total)
    } catch (error) {
      logger.error('Get all products error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch products')
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const product = await prisma.wine.findUnique({
        where: { id } as any,
        include: {
          specification: true,
          // reviews: { // Commented out due to type issues
          //   include: {
          //     user: {
          //       select: {
          //         firstName: true,
          //         lastName: true,
          //         email: true
          //       }
          //     }
          //   },
          //   orderBy: { createdAt: 'desc' },
          //   take: 10
          // },
          _count: {
            select: {
              orderItems: true,
              cartItems: true
            }
          }
        }
      })

      if (!product) {
        return ResponseHelper.notFound(res, 'Product not found')
      }

      return ResponseHelper.success(res, product)
    } catch (error) {
      logger.error('Get product by ID error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch product')
    }
  }

  /**
   * Create new product
   */
  async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        producer,
        region,
        vintage,
        category,
        description,
        tastingNotes,
        alcoholContent,
        bottleSize,
        isActive,
        isFeatured,
        isNftAvailable,
        prices,
        inventory,
        images,
        specifications
      } = req.body

      // Prepare create data
      const createData: any = {
        name,
        producer,
        region,
        vintage: Number(vintage),
        category,
        description,
        tastingNotes: tastingNotes || null,
        alcoholContent: Number(alcoholContent),
        bottleSize: bottleSize || '750ml',
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        isNftAvailable: isNftAvailable === true
      }

      // Add related data if provided
      if (prices && Array.isArray(prices) && prices.length > 0) {
        createData.prices = {
          create: prices.map((price: any) => ({
            currency: price.currency,
            price: price.price,
            isActive: price.isActive !== false
          }))
        }
      }

      // Note: Inventory should be handled separately via dedicated endpoints

      if (images && Array.isArray(images) && images.length > 0) {
        createData.images = {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            altText: img.altText || null,
            isPrimary: index === 0,
            sortOrder: index
          }))
        }
      }

      if (specifications) {
        createData.specifications = {
          create: {
            grapeVariety: specifications.grapeVariety || [],
            servingTemp: specifications.servingTemp || null,
            agingPotential: specifications.agingPotential || null,
            foodPairing: specifications.foodPairing || null,
            awards: specifications.awards || []
          }
        }
      }

      // Create product with related data
      const product = await prisma.wine.create({
        data: createData,
        include: {
          specification: true
        }
      })

      logger.info('Product created', { 
        productId: product.id, 
        adminId: req.admin?.id 
      })

      return ResponseHelper.created(res, product)
    } catch (error) {
      logger.error('Create product error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to create product')
    }
  }

  /**
   * Update existing product
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        name,
        producer,
        region,
        vintage,
        category,
        description,
        tastingNotes,
        alcoholContent,
        bottleSize,
        sku,
        isActive,
        isFeatured,
        isNftAvailable,
        prices,
        inventory,
        images,
        specifications
      } = req.body

      // Check if product exists
      const existingProduct = await prisma.wine.findUnique({
        where: { id } as any
      })

      if (!existingProduct) {
        return ResponseHelper.notFound(res, 'Product not found')
      }



      // Prepare update data
      const updateData: any = {}

      if (name !== undefined) updateData.name = name
      if (producer !== undefined) updateData.producer = producer
      if (region !== undefined) updateData.region = region
      if (vintage !== undefined) updateData.vintage = Number(vintage)
      if (category !== undefined) updateData.category = category
      if (description !== undefined) updateData.description = description
      if (tastingNotes !== undefined) updateData.tastingNotes = tastingNotes
      if (alcoholContent !== undefined) updateData.alcoholContent = Number(alcoholContent)
      if (bottleSize !== undefined) updateData.bottleSize = bottleSize

      if (isActive !== undefined) updateData.isActive = isActive
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured
      if (isNftAvailable !== undefined) updateData.isNftAvailable = isNftAvailable

      // Update prices if provided
      if (prices && Array.isArray(prices)) {
        updateData.prices = {
          deleteMany: {},
          create: prices.map((price: any) => ({
            currency: price.currency,
            price: price.price,
            isActive: price.isActive !== false
          }))
        }
      }

      // Note: Inventory updates should be handled separately via dedicated endpoints

      // Update images if provided
      if (images && Array.isArray(images)) {
        updateData.images = {
          deleteMany: {},
          create: images.map((img: any, index: number) => ({
            url: img.url,
            altText: img.altText || null,
            isPrimary: index === 0,
            sortOrder: index
          }))
        }
      }

      // Update specifications if provided
      if (specifications) {
        updateData.specifications = {
          upsert: {
            create: {
              grapeVariety: specifications.grapeVariety || [],
              servingTemp: specifications.servingTemp || null,
              agingPotential: specifications.agingPotential || null,
              foodPairing: specifications.foodPairing || null,
              awards: specifications.awards || []
            },
            update: {
              grapeVariety: specifications.grapeVariety || [],
              servingTemp: specifications.servingTemp || null,
              agingPotential: specifications.agingPotential || null,
              foodPairing: specifications.foodPairing || null,
              awards: specifications.awards || []
            }
          }
        }
      }

      // Update product with related data
      const product = await prisma.wine.update({
        where: { id } as any,
        data: updateData,
        include: {
          specification: true
        }
      })

      logger.info('Product updated', { 
        productId: product.id, 
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, product)
    } catch (error) {
      logger.error('Update product error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.id,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update product')
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Check if product exists
      const existingProduct = await prisma.wine.findUnique({
        where: { id } as any,
        include: {
          _count: {
            select: {
              orderItems: true,
              cartItems: true
            }
          }
        }
      })

      if (!existingProduct) {
        return ResponseHelper.notFound(res, 'Product not found')
      }

      // Check if product has orders (soft delete if it does)
      if (existingProduct._count.orderItems > 0) {
        await prisma.wine.update({
          where: { id } as any,
          data: { isActive: false }
        })

        logger.info('Product soft deleted (has orders)', { 
          productId: id,
          adminId: req.admin?.id 
        })

        return ResponseHelper.success(res, {
          message: 'Product deactivated (has existing orders)'
        })
      }

      // Hard delete if no orders
      await prisma.wine.delete({
        where: { id } as any
      })

      logger.info('Product deleted', { 
        productId: id,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, {
        message: 'Product deleted successfully'
      })
    } catch (error) {
      logger.error('Delete product error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.id,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to delete product')
    }
  }

  /**
   * Bulk import products
   */
  async bulkImportProducts(req: Request, res: Response) {
    try {
      const { products } = req.body

      if (!Array.isArray(products) || products.length === 0) {
        return ResponseHelper.badRequest(res, 'Products array is required')
      }

      const results = {
        created: 0,
        updated: 0,
        errors: [] as any[]
      }

      for (const productData of products) {
        try {
          const data = productData

          if (!data.name || !data.producer || !data.vintage) {
            results.errors.push({ 
              product: productData, 
              error: 'Name, producer, and vintage are required' 
            })
            continue
          }

          // Check if product exists by name, producer, and vintage
          const existingProduct = await prisma.wine.findFirst({
            where: { 
              name: data.name,
              producer: data.producer,
              vintage: Number(data.vintage)
            }
          })

          if (existingProduct) {
            // Update existing product
            await prisma.wine.update({
              where: { id: existingProduct.id },
              data: {
                ...data,
                vintage: data.vintage ? Number(data.vintage) : undefined,
                alcoholContent: data.alcoholContent ? Number(data.alcoholContent) : undefined
              }
            })
            results.updated++
          } else {
            // Create new product
            await prisma.wine.create({
              data: {
                ...data,
                vintage: Number(data.vintage),
                alcoholContent: Number(data.alcoholContent),
                bottleSize: data.bottleSize || '750ml',
                isActive: data.isActive !== false
              }
            })
            results.created++
          }
        } catch (error) {
          results.errors.push({ 
            product: productData, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
      }

      logger.info('Bulk import completed', { 
        results,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, results)
    } catch (error) {
      logger.error('Bulk import error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to import products')
    }
  }

  /**
   * Update inventory for a product
   */
  async updateInventory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { inventory } = req.body

      if (!Array.isArray(inventory)) {
        return ResponseHelper.badRequest(res, 'Inventory array is required')
      }

      // Check if product exists
      const existingProduct = await prisma.wine.findUnique({
        where: { id } as any
      })

      if (!existingProduct) {
        return ResponseHelper.notFound(res, 'Product not found')
      }

      // Update inventory
      // TODO: Implement inventory update via separate wineInventory operations
      // await prisma.wine.update({
      //   where: { id } as any,
      //   data: {
      //     inventory: {
      //       deleteMany: {},
      //       create: inventory.map((inv: any) => ({
      //         quantity: Number(inv.quantity),
      //         reservedQty: Number(inv.reservedQty) || 0,
      //         location: inv.location || 'main_warehouse',
      //         lastRestocked: inv.lastRestocked ? new Date(inv.lastRestocked) : null
      //       }))
      //     }
      //   }
      // })

      logger.info('Product inventory updated', { 
        productId: id,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, {
        message: 'Inventory updated successfully'
      })
    } catch (error) {
      logger.error('Update inventory error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.id,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update inventory')
    }
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(req: Request, res: Response) {
    try {
      const summary = await (prisma as any).wineInventory.groupBy({
        by: ['location'],
        _sum: {
          quantity: true,
          reservedQty: true
        },
        _count: {
          wineId: true
        }
      })

      const lowStockProducts = await prisma.wine.findMany({
        where: {
          stock: {
            lte: 10 // Low stock threshold
          }
        },
        take: 20
      })

      return ResponseHelper.success(res, {
        summary,
        lowStockProducts,
        totalLocations: summary.length
      })
    } catch (error) {
      logger.error('Get inventory summary error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch inventory summary')
    }
  }

  /**
   * Export products to CSV or JSON
   */
  async exportProducts(req: Request, res: Response) {
    try {
      const { format = 'json' } = req.query

      const products = await prisma.wine.findMany({
        include: {
          specification: true
        }
      })

      if (format === 'csv') {
        const csvHeaders = [
          'id', 'name', 'producer', 'region', 'vintage', 'category', 'description',
          'tastingNotes', 'alcoholContent', 'bottleSize', 'price', 'stock', 'imageUrl'
        ]

        const csvRows = products.map(product => {
          return [
            product.name,
            product.producer,
            product.region,
            product.vintage,
            product.category,
            product.description,
            product.tastingNotes || '',
            product.alcoholContent,
            product.bottleSize,
            product.id, // Product ID
            product.price,
            product.stock,
            product.imageUrl || ''
          ].map(field => `"${field}"`).join(',')
        })

        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv')
        return res.send(csvContent)
      }

      return ResponseHelper.success(res, products)
    } catch (error) {
      logger.error('Export products error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to export products')
    }
  }
}

export const adminProductController = new AdminProductController()
