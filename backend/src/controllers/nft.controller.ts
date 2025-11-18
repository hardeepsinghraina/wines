import { Request, Response } from 'express'
import { nftService } from '@/services/nft.service'
import { ResponseHelper } from '@/utils/response'
import { logger } from '@/utils/logger'

export class NFTController {
  /**
   * Get all NFT collections
   */
  async getCollections(req: Request, res: Response) {
    try {
      const { isActive, search } = req.query
      
      const filters: any = {}
      if (isActive === 'true') filters.isActive = true
      if (isActive === 'false') filters.isActive = false
      if (search) filters.search = search as string

      const collections = await nftService.getAllNFTCollections(filters)

      return ResponseHelper.success(res, collections)
    } catch (error) {
      logger.error('Error getting NFT collections:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get NFT collections')
    }
  }

  /**
   * Get NFT collection by ID
   */
  async getCollectionById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      if (!id) {
        return ResponseHelper.badRequest(res, 'ID parameter is required')
      }
      
      const collection = await nftService.getNFTCollectionByWineId(id)
      if (!collection) {
        return ResponseHelper.notFound(res, 'NFT collection not found')
      }

      return ResponseHelper.success(res, collection)
    } catch (error) {
      logger.error('Error getting NFT collection:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get NFT collection')
    }
  }

  /**
   * Get wine NFTs (simplified - return collection info)
   */
  async getWineNFTs(req: Request, res: Response) {
    try {
      const { collectionId } = req.params
      
      if (!collectionId) {
        return ResponseHelper.badRequest(res, 'Collection ID parameter is required')
      }
      
      const collection = await nftService.getNFTCollectionByWineId(collectionId)
      if (!collection) {
        return ResponseHelper.notFound(res, 'NFT collection not found')
      }

      // Return collection as NFT info since we don't have individual NFT tracking
      return ResponseHelper.success(res, [collection])
    } catch (error) {
      logger.error('Error getting wine NFTs:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get wine NFTs')
    }
  }

  /**
   * Get NFT by ID (simplified)
   */
  async getNFTById(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      if (!id) {
        return ResponseHelper.badRequest(res, 'ID parameter is required')
      }
      
      const collection = await nftService.getNFTCollectionByWineId(id)
      if (!collection) {
        return ResponseHelper.notFound(res, 'NFT not found')
      }

      return ResponseHelper.success(res, collection)
    } catch (error) {
      logger.error('Error getting NFT:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get NFT')
    }
  }

  /**
   * Purchase NFT (simplified - mint from collection)
   */
  async purchaseNFT(req: Request, res: Response) {
    try {
      const { collectionId, quantity = 1 } = req.body
      
      const result = await nftService.mintNFT(collectionId, quantity)
      return ResponseHelper.success(res, result)
    } catch (error) {
      logger.error('Error purchasing NFT:', error)
      const message = error instanceof Error ? error.message : 'Failed to purchase NFT'
      return ResponseHelper.badRequest(res, message)
    }
  }

  /**
   * Verify NFT ownership (simplified - always return false)
   */
  async verifyNFTOwnership(req: Request, res: Response) {
    try {
      // Simplified version - no ownership tracking
      return ResponseHelper.success(res, { isOwner: false })
    } catch (error) {
      logger.error('Error verifying NFT ownership:', error)
      return ResponseHelper.internalServerError(res, 'Failed to verify NFT ownership')
    }
  }

  /**
   * Get transaction status (simplified - return pending)
   */
  async getTransactionStatus(req: Request, res: Response) {
    try {
      // Simplified version - always return pending
      return ResponseHelper.success(res, { status: 'pending' })
    } catch (error) {
      logger.error('Error getting transaction status:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get transaction status')
    }
  }

  /**
   * Create NFT collection
   */
  async createCollection(req: Request, res: Response) {
    try {
      const { wineId, name, description, totalSupply, floorPrice } = req.body
      
      const collection = await nftService.createNFTCollection(wineId, {
        name,
        description,
        totalSupply,
        floorPrice
      })

      return ResponseHelper.created(res, collection)
    } catch (error) {
      logger.error('Error creating NFT collection:', error)
      const message = error instanceof Error ? error.message : 'Failed to create NFT collection'
      return ResponseHelper.badRequest(res, message)
    }
  }

  /**
   * Update NFT collection
   */
  async updateCollection(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body
      
      if (!id) {
        return ResponseHelper.badRequest(res, 'ID parameter is required')
      }
      
      const collection = await nftService.updateNFTCollection(id, updateData)
      return ResponseHelper.success(res, collection)
    } catch (error) {
      logger.error('Error updating NFT collection:', error)
      const message = error instanceof Error ? error.message : 'Failed to update NFT collection'
      return ResponseHelper.badRequest(res, message)
    }
  }

  /**
   * Get NFT statistics
   */
  async getNFTStats(req: Request, res: Response) {
    try {
      const stats = await nftService.getNFTStats()
      return ResponseHelper.success(res, stats)
    } catch (error) {
      logger.error('Error getting NFT stats:', error)
      return ResponseHelper.internalServerError(res, 'Failed to get NFT statistics')
    }
  }
}

export const nftController = new NFTController()