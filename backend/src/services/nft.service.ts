import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

const prisma = new PrismaClient()

export class NFTService {
  /**
   * Create NFT collection for wine
   */
  async createNFTCollection(wineId: string, data: {
    name: string
    description: string
    totalSupply: number
    floorPrice?: number
  }) {
    try {
      const collection = await prisma.nFTCollection.create({
        data: {
          wineId,
          name: data.name,
          description: data.description,
          totalSupply: data.totalSupply,
          floorPrice: data.floorPrice || 0,
          mintedCount: 0,
          isActive: true
        },
        include: {
          wine: {
            select: {
              id: true,
              name: true,
              producer: true,
              vintage: true
            }
          }
        }
      })

      logger.info('NFT collection created', {
        collectionId: collection.id,
        wineId,
        totalSupply: data.totalSupply
      })

      return collection
    } catch (error) {
      logger.error('Error creating NFT collection', {
        error: error instanceof Error ? error.message : 'Unknown error',
        wineId
      })
      throw error
    }
  }

  /**
   * Get NFT collection by wine ID
   */
  async getNFTCollectionByWineId(wineId: string) {
    return await prisma.nFTCollection.findUnique({
      where: { wineId },
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            producer: true,
            vintage: true,
            imageUrl: true
          }
        }
      }
    })
  }

  /**
   * Get all NFT collections
   */
  async getAllNFTCollections(filters?: {
    isActive?: boolean
    search?: string
  }) {
    const where: any = {}
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { wine: { name: { contains: filters.search } } }
      ]
    }

    return await prisma.nFTCollection.findMany({
      where,
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            producer: true,
            vintage: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Update NFT collection
   */
  async updateNFTCollection(id: string, data: {
    name?: string
    description?: string
    floorPrice?: number
    isActive?: boolean
  }) {
    return await prisma.nFTCollection.update({
      where: { id },
      data,
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            producer: true,
            vintage: true,
            imageUrl: true
          }
        }
      }
    })
  }

  /**
   * Mint NFT (simplified - just increment count)
   */
  async mintNFT(collectionId: string, quantity: number = 1) {
    try {
      const collection = await prisma.nFTCollection.findUnique({
        where: { id: collectionId }
      })

      if (!collection) {
        throw new Error('NFT collection not found')
      }

      if (!collection.isActive) {
        throw new Error('NFT collection is not active')
      }

      if (collection.mintedCount + quantity > collection.totalSupply) {
        throw new Error('Exceeds total supply')
      }

      const updatedCollection = await prisma.nFTCollection.update({
        where: { id: collectionId },
        data: {
          mintedCount: {
            increment: quantity
          }
        },
        include: {
          wine: {
            select: {
              id: true,
              name: true,
              producer: true,
              vintage: true
            }
          }
        }
      })

      logger.info('NFT minted', {
        collectionId,
        quantity,
        newMintedCount: updatedCollection.mintedCount
      })

      return updatedCollection
    } catch (error) {
      logger.error('Error minting NFT', {
        error: error instanceof Error ? error.message : 'Unknown error',
        collectionId,
        quantity
      })
      throw error
    }
  }

  /**
   * Get NFT collection statistics
   */
  async getNFTStats() {
    const [totalCollections, activeCollections, totalMinted, totalSupply] = await Promise.all([
      prisma.nFTCollection.count(),
      prisma.nFTCollection.count({ where: { isActive: true } }),
      prisma.nFTCollection.aggregate({
        _sum: {
          mintedCount: true
        }
      }),
      prisma.nFTCollection.aggregate({
        _sum: {
          totalSupply: true
        }
      })
    ])

    return {
      totalCollections,
      activeCollections,
      totalMinted: totalMinted._sum.mintedCount || 0,
      totalSupply: totalSupply._sum.totalSupply || 0,
      mintingRate: totalSupply._sum.totalSupply ? 
        ((totalMinted._sum.mintedCount || 0) / totalSupply._sum.totalSupply) * 100 : 0
    }
  }

  /**
   * Get top NFT collections by floor price
   */
  async getTopCollections(limit: number = 10) {
    return await prisma.nFTCollection.findMany({
      where: { isActive: true },
      orderBy: { floorPrice: 'desc' },
      take: limit,
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            producer: true,
            vintage: true,
            imageUrl: true
          }
        }
      }
    })
  }

  /**
   * Update floor price
   */
  async updateFloorPrice(collectionId: string, newFloorPrice: number) {
    return await prisma.nFTCollection.update({
      where: { id: collectionId },
      data: { floorPrice: newFloorPrice },
      include: {
        wine: {
          select: {
            id: true,
            name: true,
            producer: true,
            vintage: true
          }
        }
      }
    })
  }

  /**
   * Delete NFT collection
   */
  async deleteNFTCollection(id: string) {
    const collection = await prisma.nFTCollection.findUnique({
      where: { id }
    })

    if (!collection) {
      throw new Error('NFT collection not found')
    }

    if (collection.mintedCount > 0) {
      throw new Error('Cannot delete collection with minted NFTs')
    }

    await prisma.nFTCollection.delete({
      where: { id }
    })

    logger.info('NFT collection deleted', { collectionId: id })
  }
}

export const nftService = new NFTService()