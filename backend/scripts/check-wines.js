const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWines() {
  try {
    console.log('Checking wines in database...\n');
    
    // Get total count
    const total = await prisma.wine.count();
    console.log(`Total wines: ${total}\n`);
    
    // Get sample wines
    const wines = await prisma.wine.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
        region: true,
        producer: true,
        vintage: true,
        currentPrice: true,
        originalPrice: true
      }
    });
    
    console.log('Sample wines:');
    wines.forEach(wine => {
      console.log(`- ${wine.name} (${wine.category}) - ${wine.region} - €${wine.currentPrice}`);
    });
    
    // Get categories
    console.log('\nCategories in database:');
    const categories = await prisma.wine.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    categories.forEach(cat => {
      console.log(`- ${cat.category}: ${cat._count.category} wines`);
    });
    
    // Get regions
    console.log('\nRegions in database:');
    const regions = await prisma.wine.groupBy({
      by: ['region'],
      _count: {
        region: true
      }
    });
    regions.slice(0, 10).forEach(reg => {
      console.log(`- ${reg.region}: ${reg._count.region} wines`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWines();
