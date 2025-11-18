import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'
import { ResponseHelper } from '@/utils/response'

const prisma = new PrismaClient()

export class AdminProductAdvancedController {
  /**
   * Upload product images
   */
  async uploadImages(req: Request, res: Response) {
    try {
      const { productId } = req.params
      const files = req.files as Express.Multer.File[]

      if (!files || files.length === 0) {
        return ResponseHelper.badRequest(res, 'No files uploaded')
      }

      // Check if product exists
      const product = await prisma.wine.findUnique({
        where: { id: productId } as any
      })

      if (!product) {
        return ResponseHelper.notFound(res, 'Product not found')
      }

      // Process uploaded files and create image records
      const imagePromises = files.map(async (file, index) => {
        // In a real implementation, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
        const imageUrl = `/uploads/products/${productId}/${file.filename}`
        
        return (prisma as any).wineImage.create({
          data: {
            wineId: productId,
            url: imageUrl,
            altText: file.originalname,
            isPrimary: index === 0, // First image is primary
            sortOrder: index
          }
        })
      })

      const images = await Promise.all(imagePromises)

      logger.info('Product images uploaded', { 
        productId, 
        imageCount: images.length,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, images)
    } catch (error) {
      logger.error('Upload images error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to upload images')
    }
  }

  /**
   * Update product SEO metadata
   */
  async updateSEO(req: Request, res: Response) {
    try {
      const { productId } = req.params
      const {
        metaTitle,
        metaDescription,
        metaKeywords,
        slug,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        structuredData
      } = req.body

      // Check if product exists
      const product = await prisma.wine.findUnique({
        where: { id: productId } as any
      })

      if (!product) {
        return ResponseHelper.notFound(res, 'Product not found')
      }

      // Update or create SEO metadata
      const seoData = await (prisma as any).wineSEO.upsert({
        where: { wineId: productId },
        create: {
          wineId: productId,
          metaTitle,
          metaDescription,
          metaKeywords: metaKeywords || [],
          slug,
          canonicalUrl,
          ogTitle,
          ogDescription,
          ogImage,
          twitterTitle,
          twitterDescription,
          twitterImage,
          structuredData: structuredData || {}
        },
        update: {
          metaTitle,
          metaDescription,
          metaKeywords: metaKeywords || [],
          slug,
          canonicalUrl,
          ogTitle,
          ogDescription,
          ogImage,
          twitterTitle,
          twitterDescription,
          twitterImage,
          structuredData: structuredData || {}
        }
      })

      logger.info('Product SEO updated', { 
        productId,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, seoData)
    } catch (error) {
      logger.error('Update SEO error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update SEO')
    }
  }

  /**
   * Get product reviews for moderation
   */
  async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params
      const { 
        page = 1, 
        limit = 20, 
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      const take = Number(limit)

      // Build where clause
      const where: any = { wineId: productId }
      
      if (status && status !== 'all') {
        where.status = status
      }

      // Get reviews with user information
      const [reviews, total] = await Promise.all([
        (prisma as any).wineReview.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),
        (prisma as any).wineReview.count({ where })
      ])

      // Transform data for frontend
      const transformedReviews = reviews.map((review: any) => ({
        id: review.id,
        userId: review.userId,
        userName: `${review.user.firstName} ${review.user.lastName}`,
        userEmail: review.user.email,
        rating: review.rating,
        title: review.title || '',
        comment: review.comment,
        status: review.status || 'pending',
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        isVerifiedPurchase: review.isVerifiedPurchase || false,
        helpfulVotes: review.helpfulVotes || 0,
        reportCount: review.reportCount || 0,
        moderatorNotes: review.moderatorNotes
      }))

      return ResponseHelper.paginated(res, transformedReviews, Number(page), Number(limit), total)
    } catch (error) {
      logger.error('Get product reviews error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch reviews')
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(req: Request, res: Response) {
    try {
      const { reviewId } = req.params
      const { status, moderatorNotes } = req.body

      const review = await (prisma as any).wineReview.update({
        where: { id: reviewId },
        data: {
          status,
          moderatorNotes,
          updatedAt: new Date()
        }
      })

      logger.info('Review status updated', { 
        reviewId,
        status,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, review)
    } catch (error) {
      logger.error('Update review status error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        reviewId: req.params.reviewId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update review')
    }
  }

  /**
   * Delete review
   */
  async deleteReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params

      await (prisma as any).wineReview.delete({
        where: { id: reviewId }
      })

      logger.info('Review deleted', { 
        reviewId,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, { message: 'Review deleted successfully' })
    } catch (error) {
      logger.error('Delete review error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        reviewId: req.params.reviewId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to delete review')
    }
  }

  /**
   * Get product variants
   */
  async getProductVariants(req: Request, res: Response) {
    try {
      const { productId } = req.params

      const variants = await (prisma as any).wineVariant.findMany({
        where: { wineId: productId },
        orderBy: { createdAt: 'desc' }
      })

      return ResponseHelper.success(res, variants)
    } catch (error) {
      logger.error('Get product variants error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch variants')
    }
  }

  /**
   * Create product variant
   */
  async createVariant(req: Request, res: Response) {
    try {
      const { productId } = req.params
      const {
        name,
        sku,
        attributes,
        priceModifier,
        stockQuantity,
        isActive
      } = req.body

      // Check if SKU already exists
      const existingSku = await (prisma as any).wineVariant.findUnique({
        where: { sku }
      })

      if (existingSku) {
        return ResponseHelper.conflict(res, 'Variant SKU already exists')
      }

      const variant = await (prisma as any).wineVariant.create({
        data: {
          wineId: productId,
          name,
          sku,
          attributes: attributes || {},
          priceModifier: priceModifier || 0,
          stockQuantity: stockQuantity || 0,
          isActive: isActive !== false
        }
      })

      logger.info('Product variant created', { 
        productId,
        variantId: variant.id,
        adminId: req.admin?.id 
      })

      return ResponseHelper.created(res, variant)
    } catch (error) {
      logger.error('Create variant error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to create variant')
    }
  }

  /**
   * Update product variant
   */
  async updateVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params
      const updateData = req.body

      const variant = await (prisma as any).wineVariant.update({
        where: { id: variantId },
        data: updateData
      })

      logger.info('Product variant updated', { 
        variantId,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, variant)
    } catch (error) {
      logger.error('Update variant error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        variantId: req.params.variantId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update variant')
    }
  }

  /**
   * Delete product variant
   */
  async deleteVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params

      await (prisma as any).wineVariant.delete({
        where: { id: variantId }
      })

      logger.info('Product variant deleted', { 
        variantId,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, { message: 'Variant deleted successfully' })
    } catch (error) {
      logger.error('Delete variant error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        variantId: req.params.variantId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to delete variant')
    }
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(req: Request, res: Response) {
    try {
      const { productId } = req.params

      const recommendations = await (prisma as any).productRecommendation.findMany({
        where: { sourceProductId: productId },
        orderBy: { priority: 'desc' }
      })

      return ResponseHelper.success(res, recommendations)
    } catch (error) {
      logger.error('Get recommendations error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch recommendations')
    }
  }

  /**
   * Update product recommendations
   */
  async updateRecommendations(req: Request, res: Response) {
    try {
      const { productId } = req.params
      const { recommendations } = req.body

      // Delete existing recommendations
      await (prisma as any).productRecommendation.deleteMany({
        where: { sourceProductId: productId }
      })

      // Create new recommendations
      if (recommendations && recommendations.length > 0) {
        const recommendationData = recommendations.map((rec: any) => ({
          sourceProductId: productId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          conditions: rec.conditions || {},
          targetProducts: rec.targetProducts || [],
          priority: rec.priority || 1,
          isActive: rec.isActive !== false
        }))

        await (prisma as any).productRecommendation.createMany({
          data: recommendationData
        })
      }

      logger.info('Product recommendations updated', { 
        productId,
        count: recommendations?.length || 0,
        adminId: req.admin?.id 
      })

      return ResponseHelper.success(res, { message: 'Recommendations updated successfully' })
    } catch (error) {
      logger.error('Update recommendations error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId: req.params.productId,
        adminId: req.admin?.id
      })
      return ResponseHelper.internalServerError(res, 'Failed to update recommendations')
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(req: Request, res: Response) {
    try {
      const { threshold = 10 } = req.query

      const lowStockProducts = await prisma.wine.findMany({
        where: {
          stock: {
            lte: Number(threshold)
          }
        },
        orderBy: {
          stock: 'asc'
        }
      })

      return ResponseHelper.success(res, lowStockProducts)
    } catch (error) {
      logger.error('Get low stock alerts error', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return ResponseHelper.internalServerError(res, 'Failed to fetch low stock alerts')
    }
  }

  /**
   * Export products to CSV
   */
  async exportProducts(req: Request, res: Response) {
    try {
      const { format = 'csv' } = req.query

      const products = await prisma.wine.findMany({
        // Note: Using basic fields only due to type issues
        orderBy: { createdAt: 'desc' }
      })

      if (format === 'csv') {
        const csvHeaders = [
          'name', 'producer', 'region', 'vintage', 'category', 'description',
          'tastingNotes', 'alcoholContent', 'bottleSize', 'id', 'price', 'stock', 'imageUrl'
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
            product.id, // Use ID instead of SKU
            product.price, // Use base price
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

export const adminProductAdvancedController = new AdminProductAdvancedController()