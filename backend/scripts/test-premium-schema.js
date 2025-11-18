// Test script to verify premium product schema is working correctly

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPremiumSchema() {
  try {
    console.log('Testing premium product schema...')
    
    // Test creating a product category
    const category = await prisma.productCategory.create({
      data: {
        name: 'Test Vintage Reserves',
        slug: `test-vintage-reserves-${Date.now()}`,
        description: 'Test category for premium wines',
        level: 0,
        sortOrder: 1,
        isActive: true,
        isFeatured: true,
        imageUrl: '/images/test-category.jpg'
      }
    })
    console.log('✓ Created product category:', category.name)
    
    // Test creating a premium wine with all new fields
    const wine = await prisma.wine.create({
      data: {
        name: 'Test Premium Bordeaux 2015',
        producer: 'Test Estate',
        description: 'A premium test wine with exceptional quality',
        region: 'Bordeaux',
        appellation: 'Pauillac',
        vintage: 2015,
        category: 'Red Wine',
        categoryId: category.id,
        sku: `TEST-BORDEAUX-2015-${Date.now()}`,
        originalPrice: 2995.00,
        currentPrice: 599.00,
        discountPercent: 80,
        currency: 'USD',
        terroir: 'Gravelly soil with excellent drainage',
        winemaker: 'Jean-Claude Test',
        estate: 'Château Test',
        classification: 'AOC Pauillac',
        servingTemp: '16-18°C',
        agingPotential: '15-20 years',
        stock: 50,
        isActive: true,
        isFeatured: true,
        isLimitedEdition: true
      }
    })
    console.log('✓ Created premium wine:', wine.name)
    
    // Test creating wine specifications with enhanced fields
    const specification = await prisma.wineSpecification.create({
      data: {
        wineId: wine.id,
        grapeVariety: JSON.stringify(['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc']),
        alcoholContent: 14.5,
        servingTemp: '16-18°C',
        tastingNotes: 'Rich blackcurrant, cedar, and tobacco notes',
        foodPairing: 'Perfect with red meat and aged cheeses',
        awards: JSON.stringify(['Wine Spectator 95 points']),
        ph: 3.6,
        residualSugar: 2.1,
        tannins: 'High',
        acidity: 'Medium',
        body: 'Full',
        finish: 'Long',
        oakTreatment: 'Heavy',
        malolacticFermentation: true
      }
    })
    console.log('✓ Created wine specification with premium attributes')
    
    // Test creating enhanced pricing
    const pricing = await prisma.winePrice.create({
      data: {
        wineId: wine.id,
        currency: 'USD',
        originalPrice: 2995.00,
        currentPrice: 599.00,
        discountType: 'PERCENTAGE',
        discountValue: 80,
        tier: 'STANDARD',
        minQuantity: 1,
        isActive: true,
        isPromotion: true
      }
    })
    console.log('✓ Created enhanced pricing structure')
    
    // Test creating enhanced inventory
    const inventory = await prisma.wineInventory.create({
      data: {
        wineId: wine.id,
        quantity: 50,
        reservedQty: 5,
        availableQty: 45,
        location: 'main_warehouse',
        warehouse: 'WH-001',
        zone: 'A-12',
        temperature: 12.5,
        humidity: 65.0,
        lowStockThreshold: 10,
        reorderPoint: 5,
        batchNumber: 'BATCH-2015-001',
        lotNumber: 'LOT-TEST-001',
        unitCost: 1200.00,
        totalValue: 60000.00
      }
    })
    console.log('✓ Created enhanced inventory tracking')
    
    // Test creating enhanced images
    const image = await prisma.wineImage.create({
      data: {
        wineId: wine.id,
        url: '/images/test-wine-main.jpg',
        filename: 'test-wine-main.jpg',
        altText: 'Test Premium Bordeaux 2015 bottle',
        title: 'Premium Bordeaux Wine',
        type: 'PRODUCT',
        isPrimary: true,
        sortOrder: 1,
        width: 800,
        height: 1200,
        fileSize: 245760,
        mimeType: 'image/jpeg',
        thumbnailUrl: '/images/test-wine-thumb.jpg',
        mediumUrl: '/images/test-wine-medium.jpg',
        largeUrl: '/images/test-wine-large.jpg',
        isActive: true,
        isProcessed: true
      }
    })
    console.log('✓ Created enhanced image gallery')
    
    // Test creating product certification
    const certification = await prisma.productCertification.create({
      data: {
        wineId: wine.id,
        name: 'Organic Certification',
        certifyingBody: 'ECOCERT',
        certificateNumber: 'ECO-2015-001',
        type: 'ORGANIC',
        level: 'Gold',
        description: 'Certified organic wine production',
        issuedDate: new Date('2015-01-01'),
        isActive: true,
        isVerified: true,
        certificateUrl: '/certificates/eco-cert-001.pdf',
        logoUrl: '/logos/ecocert.png'
      }
    })
    console.log('✓ Created product certification')
    
    // Test creating product award
    const award = await prisma.productAward.create({
      data: {
        wineId: wine.id,
        name: 'Wine Spectator',
        title: 'Outstanding Wine Award',
        category: 'Best Bordeaux',
        awardingBody: 'Wine Spectator Magazine',
        competition: 'Annual Wine Awards 2018',
        year: 2018,
        score: 95,
        maxScore: 100,
        level: 'Gold',
        rank: 1,
        description: 'Exceptional quality and outstanding character',
        isActive: true,
        isVerified: true,
        certificateUrl: '/awards/ws-2018-001.pdf',
        logoUrl: '/logos/wine-spectator.png'
      }
    })
    console.log('✓ Created product award')
    
    // Test creating wine variant
    const variant = await prisma.wineVariant.create({
      data: {
        wineId: wine.id,
        name: 'Magnum (1.5L)',
        sku: `TEST-BORDEAUX-2015-MAG-${Date.now()}`,
        bottleSize: '1.5L',
        packaging: 'Wooden Gift Box',
        format: 'Magnum',
        originalPrice: 5990.00,
        currentPrice: 1198.00,
        priceModifier: 599.00,
        stockQuantity: 12,
        isActive: true,
        isDefault: false,
        attributes: JSON.stringify({
          giftBoxIncluded: true,
          limitedEdition: true,
          handNumbered: true
        })
      }
    })
    console.log('✓ Created product variant')
    
    // Test creating enhanced SEO
    const seo = await prisma.wineSEO.create({
      data: {
        wineId: wine.id,
        metaTitle: 'Test Premium Bordeaux 2015 - 80% Off Luxury Wine',
        metaDescription: 'Exceptional 2015 Bordeaux from Château Test. Originally $2,995, now $599 with 80% discount. Limited edition premium wine.',
        metaKeywords: JSON.stringify(['bordeaux', 'premium wine', 'luxury wine', 'discount wine', '2015 vintage']),
        slug: 'test-premium-bordeaux-2015',
        canonicalUrl: '/products/test-premium-bordeaux-2015',
        ogTitle: 'Premium Bordeaux 2015 - Luxury Wine Collection',
        ogDescription: 'Discover this exceptional Bordeaux with 80% off original pricing',
        ogImage: '/images/test-wine-og.jpg',
        ogType: 'product',
        twitterTitle: 'Premium Bordeaux 2015 - Limited Time Offer',
        twitterDescription: 'Exceptional vintage wine with 80% discount',
        twitterImage: '/images/test-wine-twitter.jpg',
        twitterCard: 'summary_large_image',
        structuredData: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Test Premium Bordeaux 2015',
          description: 'A premium test wine with exceptional quality',
          offers: {
            '@type': 'Offer',
            price: '599.00',
            priceCurrency: 'USD'
          }
        }),
        seoScore: 85.5,
        searchTerms: JSON.stringify(['premium bordeaux', 'luxury wine', 'vintage 2015'])
      }
    })
    console.log('✓ Created enhanced SEO metadata')
    
    // Test creating product recommendation
    const recommendation = await prisma.productRecommendation.create({
      data: {
        sourceProductId: wine.id,
        type: 'similar_products',
        title: 'Similar Premium Bordeaux Wines',
        description: 'Other exceptional Bordeaux wines from the same vintage',
        reason: 'Same region and vintage year',
        conditions: JSON.stringify({
          region: 'Bordeaux',
          vintage: 2015,
          priceRange: { min: 500, max: 800 }
        }),
        targetProducts: JSON.stringify([]),
        priority: 1,
        weight: 1.0,
        isActive: true,
        isAutoGenerated: false
      }
    })
    console.log('✓ Created product recommendation')
    
    // Test querying the complete wine with all relations
    const completeWine = await prisma.wine.findUnique({
      where: { id: wine.id },
      include: {
        productCategory: true,
        specification: true,
        prices: true,
        inventory: true,
        images: true,
        variants: true,
        certifications: true,
        awards: true,
        seo: true,
        recommendations: true
      }
    })
    
    console.log('✓ Successfully queried complete wine with all relations')
    console.log(`  - Category: ${completeWine.productCategory?.name}`)
    console.log(`  - Specifications: ${completeWine.specification ? 'Yes' : 'No'}`)
    console.log(`  - Prices: ${completeWine.prices.length}`)
    console.log(`  - Inventory records: ${completeWine.inventory.length}`)
    console.log(`  - Images: ${completeWine.images.length}`)
    console.log(`  - Variants: ${completeWine.variants.length}`)
    console.log(`  - Certifications: ${completeWine.certifications.length}`)
    console.log(`  - Awards: ${completeWine.awards.length}`)
    console.log(`  - SEO: ${completeWine.seo ? 'Yes' : 'No'}`)
    console.log(`  - Recommendations: ${completeWine.recommendations.length}`)
    
    console.log('\n🎉 All premium product schema tests passed successfully!')
    
    // Clean up test data
    await prisma.productRecommendation.deleteMany({ where: { sourceProductId: wine.id } })
    await prisma.wineSEO.deleteMany({ where: { wineId: wine.id } })
    await prisma.wineVariant.deleteMany({ where: { wineId: wine.id } })
    await prisma.productAward.deleteMany({ where: { wineId: wine.id } })
    await prisma.productCertification.deleteMany({ where: { wineId: wine.id } })
    await prisma.wineImage.deleteMany({ where: { wineId: wine.id } })
    await prisma.wineInventory.deleteMany({ where: { wineId: wine.id } })
    await prisma.winePrice.deleteMany({ where: { wineId: wine.id } })
    await prisma.wineSpecification.deleteMany({ where: { wineId: wine.id } })
    await prisma.wine.delete({ where: { id: wine.id } })
    await prisma.productCategory.delete({ where: { id: category.id } })
    
    console.log('✓ Test data cleaned up successfully')
    
  } catch (error) {
    console.error('❌ Error testing premium schema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testPremiumSchema()
  .then(() => {
    console.log('\n✅ Premium product schema test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Premium product schema test failed:', error)
    process.exit(1)
  })