const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrices() {
  const wine = await prisma.wine.findFirst();
  console.log('Wine:', wine.name);
  console.log('Price:', wine.price);
  console.log('CurrentPrice:', wine.currentPrice);
  console.log('Stock:', wine.stock);
  await prisma.$disconnect();
}

checkPrices();
