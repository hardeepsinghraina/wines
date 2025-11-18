import { PrismaClient, UserRole, LoyaltyTier } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@luxurywines.com' },
    update: {},
    create: {
      email: 'admin@luxurywines.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123!', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      emailVerified: true,
      loyaltyStatus: {
        create: {
          tier: LoyaltyTier.BRONZE,
          points: 0,
          totalSpent: 0,
        },
      },
    },
  })

  console.log('✅ Customer user created:', customer.email)

  // Create sample wines
  const wines = [
    {
      name: 'Château Margaux 2015',
      producer: 'Château Margaux',
      region: 'Bordeaux, France',
      vintage: 2015,
      category: 'Red Wine',
      description: 'A legendary Bordeaux wine with exceptional elegance and complexity.',
      tastingNotes: 'Rich blackcurrant, cedar, tobacco, and violet notes with silky tannins.',
      alcoholContent: 13.5,
      bottleSize: '750ml',
      sku: 'CM-2015-750',
      prices: [
        { currency: 'USD', price: 899.99 },
        { currency: 'EUR', price: 799.99 },
        { currency: 'BTC', price: 0.000015 },
        { currency: 'ETH', price: 0.00025 },
      ],
      inventory: { quantity: 50, location: 'main_warehouse' },
      images: [
        {
          url: '/images/wines/chateau-margaux-2015.jpg',
          altText: 'Château Margaux 2015 bottle',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      specifications: {
        grapeVariety: ['Cabernet Sauvignon', 'Merlot', 'Petit Verdot', 'Cabernet Franc'],
        servingTemp: '16-18°C',
        agingPotential: '20-30 years',
        foodPairing: 'Red meat, game, aged cheeses',
        awards: ['Wine Spectator 98 points', 'Robert Parker 96 points'],
      },
    },
    {
      name: 'Dom Pérignon 2012',
      producer: 'Moët & Chandon',
      region: 'Champagne, France',
      vintage: 2012,
      category: 'Champagne',
      description: 'The epitome of luxury champagne with exceptional finesse.',
      tastingNotes: 'Fresh citrus, white flowers, brioche, and mineral complexity.',
      alcoholContent: 12.5,
      bottleSize: '750ml',
      sku: 'DP-2012-750',
      isFeatured: true,
      prices: [
        { currency: 'USD', price: 249.99 },
        { currency: 'EUR', price: 219.99 },
        { currency: 'BTC', price: 0.0000042 },
        { currency: 'ETH', price: 0.000068 },
      ],
      inventory: { quantity: 100, location: 'main_warehouse' },
      images: [
        {
          url: '/images/wines/dom-perignon-2012.jpg',
          altText: 'Dom Pérignon 2012 bottle',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      specifications: {
        grapeVariety: ['Chardonnay', 'Pinot Noir'],
        servingTemp: '6-8°C',
        agingPotential: '10-15 years',
        foodPairing: 'Seafood, caviar, light appetizers',
        awards: ['Wine Spectator 95 points', 'Decanter 96 points'],
      },
    },
    {
      name: 'Opus One 2018',
      producer: 'Opus One Winery',
      region: 'Napa Valley, California',
      vintage: 2018,
      category: 'Red Wine',
      description: 'A prestigious Bordeaux-style blend from Napa Valley.',
      tastingNotes: 'Dark fruit, espresso, vanilla, and structured tannins.',
      alcoholContent: 14.5,
      bottleSize: '750ml',
      sku: 'OO-2018-750',
      isNftAvailable: true,
      prices: [
        { currency: 'USD', price: 449.99 },
        { currency: 'EUR', price: 399.99 },
        { currency: 'BTC', price: 0.0000075 },
        { currency: 'ETH', price: 0.00012 },
      ],
      inventory: { quantity: 75, location: 'main_warehouse' },
      images: [
        {
          url: '/images/wines/opus-one-2018.jpg',
          altText: 'Opus One 2018 bottle',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      specifications: {
        grapeVariety: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Petit Verdot', 'Malbec'],
        servingTemp: '16-18°C',
        agingPotential: '15-25 years',
        foodPairing: 'Grilled meats, lamb, dark chocolate',
        awards: ['Wine Advocate 95 points', 'James Suckling 97 points'],
      },
    },
  ]

  for (const wineData of wines) {
    const { prices, inventory, images, specifications, ...wineInfo } = wineData

    const wine = await prisma.wine.create({
      data: {
        ...wineInfo,
        prices: {
          create: prices,
        },
        inventory: {
          create: inventory,
        },
        images: {
          create: images,
        },
        specifications: {
          create: specifications,
        },
      },
    })

    console.log('✅ Wine created:', wine.name)
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })