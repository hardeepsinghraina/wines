const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyLuxuryGiftSets() {
  console.log('🔍 Verifying luxury gift sets...')
  
  try {
    // Get all gift sets
    const giftSets = await prisma.wine.findMany({
      where: { category: 'Gift Set' },
      include: {
        specification: true,
        inventory: true,
        prices: true,
        images: true,
        variants: true
      },
      orderBy: { name: 'asc' }
    })
    
    console.log(`\n📊 Found ${giftSets.length} gift sets in database`)
    
    // Verify each gift set
    let validCount = 0
    let issueCount = 0
    
    for (const giftSet of giftSets) {
      const issues = []
      
      // Check required fields
      if (!giftSet.name) issues.push('Missing name')
      if (!giftSet.sku) issues.push('Missing SKU')
      if (!giftSet.originalPrice || giftSet.originalPrice < 2000) issues.push('Invalid original price')
      if (!giftSet.currentPrice || giftSet.currentPrice < 400 || giftSet.currentPrice > 800) issues.push('Invalid current price')
      if (!giftSet.discountPercent || giftSet.discountPercent !== 80) issues.push('Invalid discount percentage')
      
      // Check relationships
      if (!giftSet.specification) issues.push('Missing specification')
      if (!giftSet.inventory || giftSet.inventory.length === 0) issues.push('Missing inventory')
      if (!giftSet.prices || giftSet.prices.length === 0) issues.push('Missing prices')
      if (!giftSet.images || giftSet.images.length === 0) issues.push('Missing images')
      if (!giftSet.variants || giftSet.variants.length === 0) issues.push('Missing variants')
      
      if (issues.length === 0) {
        validCount++
        console.log(`✅ ${giftSet.name} - Valid`)
      } else {
        issueCount++
        console.log(`❌ ${giftSet.name} - Issues: ${issues.join(', ')}`)
      }
    }
    
    console.log(`\n📈 Verification Summary:`)
    console.log(`   Valid gift sets: ${validCount}`)
    console.log(`   Gift sets with issues: ${issueCount}`)
    console.log(`   Success rate: ${((validCount / giftSets.length) * 100).toFixed(1)}%`)
    
    // Display gift set categories
    const categories = {}
    giftSets.forEach(gs => {
      const type = gs.name.includes('Collection') ? 'Collection' :
                   gs.name.includes('Set') ? 'Set' :
                   gs.name.includes('Trilogy') ? 'Trilogy' : 'Other'
      categories[type] = (categories[type] || 0) + 1
    })
    
    console.log(`\n🏷️ Gift Set Types:`)
    Object.entries(categories).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })
    
    // Display price distribution
    const priceRanges = {
      '$400-499': 0,
      '$500-599': 0,
      '$600-699': 0,
      '$700-799': 0,
      '$800+': 0
    }
    
    giftSets.forEach(gs => {
      const price = gs.currentPrice
      if (price < 500) priceRanges['$400-499']++
      else if (price < 600) priceRanges['$500-599']++
      else if (price < 700) priceRanges['$600-699']++
      else if (price < 800) priceRanges['$700-799']++
      else priceRanges['$800+']++
    })
    
    console.log(`\n💰 Price Distribution:`)
    Object.entries(priceRanges).forEach(([range, count]) => {
      console.log(`   ${range}: ${count} gift sets`)
    })
    
    // Display top 5 most expensive gift sets
    const topExpensive = giftSets
      .sort((a, b) => b.currentPrice - a.currentPrice)
      .slice(0, 5)
    
    console.log(`\n🏆 Top 5 Most Expensive Gift Sets:`)
    topExpensive.forEach((gs, index) => {
      console.log(`   ${index + 1}. ${gs.name} - $${gs.currentPrice} (was $${gs.originalPrice})`)
    })
    
    // Display gift sets by region/theme
    const themes = {}
    giftSets.forEach(gs => {
      if (gs.name.includes('Bordeaux')) themes['Bordeaux'] = (themes['Bordeaux'] || 0) + 1
      else if (gs.name.includes('Burgundy')) themes['Burgundy'] = (themes['Burgundy'] || 0) + 1
      else if (gs.name.includes('Champagne')) themes['Champagne'] = (themes['Champagne'] || 0) + 1
      else if (gs.name.includes('Napa')) themes['Napa Valley'] = (themes['Napa Valley'] || 0) + 1
      else if (gs.name.includes('Whisky') || gs.name.includes('Whiskey')) themes['Whisky'] = (themes['Whisky'] || 0) + 1
      else if (gs.name.includes('Executive') || gs.name.includes('Board')) themes['Corporate'] = (themes['Corporate'] || 0) + 1
      else if (gs.name.includes('Christmas') || gs.name.includes('New Year') || gs.name.includes('Holiday')) themes['Holiday'] = (themes['Holiday'] || 0) + 1
      else if (gs.name.includes('Anniversary') || gs.name.includes('Wedding')) themes['Personal'] = (themes['Personal'] || 0) + 1
      else themes['Other'] = (themes['Other'] || 0) + 1
    })
    
    console.log(`\n🌍 Gift Set Themes:`)
    Object.entries(themes).forEach(([theme, count]) => {
      console.log(`   ${theme}: ${count} gift sets`)
    })
    
    console.log(`\n✨ Verification complete!`)
    
  } catch (error) {
    console.error('❌ Error verifying gift sets:', error)
    throw error
  }
}

// Run the verification script
verifyLuxuryGiftSets()
  .catch((e) => {
    console.error('❌ Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })