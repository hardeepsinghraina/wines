const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateWinePrices() {
  try {
    console.log('Updating wine prices and stock...');
    
    // Get all wines
    const wines = await prisma.wine.findMany();
    console.log(`Found ${wines.length} wines to update`);
    
    // Update each wine with price and stock
    for (const wine of wines) {
      // Generate a price based on the wine name/category
      let basePrice = 150; // Default base price
      
      // Adjust price based on keywords in name
      if (wine.name.toLowerCase().includes('master sommelier')) basePrice = 2500;
      else if (wine.name.toLowerCase().includes('collector')) basePrice = 5000;
      else if (wine.name.toLowerCase().includes('connoisseur')) basePrice = 1800;
      else if (wine.name.toLowerCase().includes('wedding')) basePrice = 3500;
      else if (wine.name.toLowerCase().includes('anniversary')) basePrice = 2800;
      else if (wine.name.toLowerCase().includes('corporate')) basePrice = 4200;
      else if (wine.name.toLowerCase().includes('luxury')) basePrice = 3200;
      else if (wine.name.toLowerCase().includes('premium')) basePrice = 2400;
      else if (wine.name.toLowerCase().includes('exclusive')) basePrice = 6500;
      else if (wine.name.toLowerCase().includes('rare')) basePrice = 8500;
      else if (wine.name.toLowerCase().includes('vintage')) basePrice = 4800;
      else if (wine.name.toLowerCase().includes('reserve')) basePrice = 3800;
      else if (wine.name.toLowerCase().includes('grand cru')) basePrice = 7200;
      else if (wine.name.toLowerCase().includes('first growth')) basePrice = 9500;
      
      // Add some variation
      const variation = Math.floor(Math.random() * 500) - 250;
      const currentPrice = basePrice + variation;
      const originalPrice = currentPrice * 1.2; // 20% discount
      const discountPercent = 20;
      
      // Stock between 5 and 50
      const stock = Math.floor(Math.random() * 46) + 5;
      
      await prisma.wine.update({
        where: { id: wine.id },
        data: {
          price: currentPrice,
          currentPrice: currentPrice,
          originalPrice: originalPrice,
          discountPercent: discountPercent,
          currency: 'EUR',
          stock: stock
        }
      });
      
      console.log(`Updated: ${wine.name} - €${currentPrice} (${stock} in stock)`);
    }
    
    console.log('✓ All wines updated successfully!');
  } catch (error) {
    console.error('Error updating wines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWinePrices();
