const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyChampagneCollection() {
  console.log('🥂 Verifying luxury champagne collection...')
  
  try {
    // Count total champagnes
    const totalChampagnes = await prisma.wine.count({
      where: { category: 'Champagne' }
    })
    
    console.log(`Total champagnes in database: ${totalChampagnes}`)
    
    if (totalChampagnes === 0) {
      console.log('❌ No champagnes found. Running population script...')
      
      // Import and run the population function
      const { populateLuxuryChampagne } = require('./populate-luxury-champagne.js')
      await populateLuxuryChampagne()
      
      // Recount after population
      const newTotal = await prisma.wine.count({
        where: { category: 'Champagne' }
      })
      console.log(`✅ Created ${newTotal} champagnes`)
    } else {
      console.log('✅ Champagne collection already exists')
      
      // Show some details
      const champagnes = await prisma.wine.findMany({
        where: { category: 'Champagne' },
        select: {
          name: true,
          producer: true,
          vintage: true,
          originalPrice: true,
          currentPrice: true,
          stock: true
        },
        take: 5
      })
      
      console.log('\n📋 Sample champagnes:')
      champagnes.forEach((champ, index) => {
        console.log(`${index + 1}. ${champ.name} (${champ.vintage || 'NV'}) - €${champ.currentPrice} (was €${champ.originalPrice}) - Stock: ${champ.stock}`)
      })
    }
    
    // Get collection statistics
    const stats = await prisma.wine.aggregate({
      where: { category: 'Champagne' },
      _sum: { originalPrice: true, currentPrice: true, stock: true },
      _avg: { originalPrice: true, currentPrice: true },
      _min: { currentPrice: true },
      _max: { currentPrice: true }
    })
    
    console.log('\n📊 Collection Statistics:')
    console.log(`Total original value: €${stats._sum.originalPrice?.toFixed(2) || '0.00'}`)
    console.log(`Total current value: €${stats._sum.currentPrice?.toFixed(2) || '0.00'}`)
    console.log(`Total stock: ${stats._sum.stock || 0} bottles`)
    console.log(`Average original price: €${stats._avg.originalPrice?.toFixed(2) || '0.00'}`)
    console.log(`Average current price: €${stats._avg.currentPrice?.toFixed(2) || '0.00'}`)
    console.log(`Price range: €${stats._min.currentPrice?.toFixed(2) || '0.00'} - €${stats._max.currentPrice?.toFixed(2) || '0.00'}`)
    
    // Check categorization
    const vintageCount = await prisma.wine.count({
      where: { 
        category: 'Champagne',
        vintage: { gt: 0 }
      }
    })
    
    const nonVintageCount = await prisma.wine.count({
      where: { 
        category: 'Champagne',
        vintage: 0
      }
    })
    
    console.log(`\n🍾 Style Breakdown:`)
    console.log(`Vintage champagnes: ${vintageCount}`)
    console.log(`Multi-vintage blends: ${nonVintageCount}`)
    
  } catch (error) {
    console.error('❌ Error verifying champagne collection:', error)
    throw error
  }
}

// Run the verification
verifyChampagneCollection()
  .catch((e) => {
    console.error('❌ Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })