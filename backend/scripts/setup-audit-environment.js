/**
 * Audit Environment Setup Script
 * 
 * This script sets up the test environment for the checkout payment flow audit.
 * It creates sample data including test products, users, and addresses.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test user data
const TEST_USERS = [
  {
    email: 'audit.guest@test.com',
    password: 'AuditTest123!',
    firstName: 'Guest',
    lastName: 'User',
    role: 'USER'
  },
  {
    email: 'audit.authenticated@test.com',
    password: 'AuditTest123!',
    firstName: 'Authenticated',
    lastName: 'User',
    role: 'USER'
  },
  {
    email: 'audit.vip@test.com',
    password: 'AuditTest123!',
    firstName: 'VIP',
    lastName: 'Customer',
    role: 'USER'
  }
];

// Test addresses
const TEST_ADDRESSES = [
  {
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '+1-555-0100'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    street: '456 Oxford Street',
    city: 'London',
    state: 'Greater London',
    postalCode: 'SW1A 1AA',
    country: 'GB',
    phone: '+44-20-7946-0958'
  },
  {
    firstName: 'Pierre',
    lastName: 'Dubois',
    street: '789 Rue de Rivoli',
    city: 'Paris',
    state: 'Île-de-France',
    postalCode: '75001',
    country: 'FR',
    phone: '+33-1-42-96-12-34'
  },
  {
    firstName: 'Hans',
    lastName: 'Mueller',
    street: '321 Unter den Linden',
    city: 'Berlin',
    state: 'Berlin',
    postalCode: '10117',
    country: 'DE',
    phone: '+49-30-2270-0'
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    street: '654 Yonge Street',
    city: 'Toronto',
    state: 'ON',
    postalCode: 'M5B 1L7',
    country: 'CA',
    phone: '+1-416-555-0199'
  }
];

// Test products (wines) for audit
const TEST_WINES = [
  {
    name: 'Audit Test Bordeaux 2015',
    description: 'Premium red wine for testing checkout flow',
    producer: 'Test Château',
    region: 'Bordeaux',
    country: 'France',
    vintage: 2015,
    type: 'Red',
    price: 89.99,
    stock: 50,
    alcoholContent: 13.5,
    category: 'Premium',
    imageUrl: '/images/test-bordeaux.jpg'
  },
  {
    name: 'Audit Test Champagne NV',
    description: 'Luxury champagne for testing payment processing',
    producer: 'Test Maison',
    region: 'Champagne',
    country: 'France',
    vintage: null,
    type: 'Sparkling',
    price: 149.99,
    stock: 30,
    alcoholContent: 12.0,
    category: 'Luxury',
    imageUrl: '/images/test-champagne.jpg'
  },
  {
    name: 'Audit Test Barolo 2016',
    description: 'Italian red wine for cart management testing',
    producer: 'Test Winery',
    region: 'Piedmont',
    country: 'Italy',
    vintage: 2016,
    type: 'Red',
    price: 129.99,
    stock: 25,
    alcoholContent: 14.0,
    category: 'Premium',
    imageUrl: '/images/test-barolo.jpg'
  },
  {
    name: 'Audit Test Napa Cabernet 2018',
    description: 'California red wine for inventory testing',
    producer: 'Test Vineyards',
    region: 'Napa Valley',
    country: 'USA',
    vintage: 2018,
    type: 'Red',
    price: 199.99,
    stock: 5, // Low stock for testing inventory validation
    alcoholContent: 14.5,
    category: 'Luxury',
    imageUrl: '/images/test-napa.jpg'
  },
  {
    name: 'Audit Test Rioja Reserva 2014',
    description: 'Spanish red wine for error handling testing',
    producer: 'Test Bodega',
    region: 'Rioja',
    country: 'Spain',
    vintage: 2014,
    type: 'Red',
    price: 59.99,
    stock: 100,
    alcoholContent: 13.5,
    category: 'Standard',
    imageUrl: '/images/test-rioja.jpg'
  },
  {
    name: 'Audit Test Unavailable Wine',
    description: 'Wine with zero stock for testing unavailability',
    producer: 'Test Producer',
    region: 'Test Region',
    country: 'France',
    vintage: 2020,
    type: 'Red',
    price: 79.99,
    stock: 0, // Zero stock for testing
    alcoholContent: 13.0,
    category: 'Premium',
    imageUrl: '/images/test-unavailable.jpg'
  }
];

async function setupAuditEnvironment() {
  console.log('🚀 Starting audit environment setup...\n');

  try {
    // 1. Create test users
    console.log('👥 Creating test users...');
    const createdUsers = [];
    
    for (const userData of TEST_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          emailVerified: true
        }
      });
      
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.email}`);
    }

    // 2. Create test addresses for authenticated users
    console.log('\n📍 Creating test addresses...');
    
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const addressData = TEST_ADDRESSES[i % TEST_ADDRESSES.length];
      
      await prisma.address.create({
        data: {
          userId: user.id,
          ...addressData,
          isDefault: true
        }
      });
      
      console.log(`   ✓ Created address for ${user.email}`);
    }

    // 3. Create test wines
    console.log('\n🍷 Creating test wines...');
    
    for (const wineData of TEST_WINES) {
      const wine = await prisma.wine.upsert({
        where: { 
          name_producer_vintage: {
            name: wineData.name,
            producer: wineData.producer,
            vintage: wineData.vintage || 0
          }
        },
        update: {},
        create: wineData
      });
      
      console.log(`   ✓ Created wine: ${wine.name} (Stock: ${wine.stock})`);
    }

    // 4. Create a test cart for the authenticated user
    console.log('\n🛒 Creating test cart...');
    
    const authenticatedUser = createdUsers.find(u => u.email === 'audit.authenticated@test.com');
    const wines = await prisma.wine.findMany({ take: 2 });
    
    if (authenticatedUser && wines.length > 0) {
      const cart = await prisma.cart.upsert({
        where: { userId: authenticatedUser.id },
        update: {},
        create: {
          userId: authenticatedUser.id
        }
      });

      for (const wine of wines) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            wineId: wine.id,
            quantity: 2
          }
        });
      }
      
      console.log(`   ✓ Created cart with ${wines.length} items for authenticated user`);
    }

    // 5. Create a test order for order history testing
    console.log('\n📦 Creating test order...');
    
    if (authenticatedUser && wines.length > 0) {
      const order = await prisma.order.create({
        data: {
          userId: authenticatedUser.id,
          orderNumber: `AUDIT-${Date.now()}`,
          status: 'DELIVERED',
          subtotal: 179.98,
          shippingCost: 15.00,
          taxAmount: 19.50,
          totalAmount: 214.48,
          currency: 'EUR',
          shippingAddress: JSON.stringify(TEST_ADDRESSES[0]),
          billingAddress: JSON.stringify(TEST_ADDRESSES[0]),
          items: {
            create: wines.slice(0, 2).map(wine => ({
              wineId: wine.id,
              quantity: 1,
              unitPrice: wine.price,
              totalPrice: wine.price
            }))
          }
        }
      });
      
      console.log(`   ✓ Created test order: ${order.orderNumber}`);
    }

    console.log('\n✅ Audit environment setup complete!\n');
    console.log('📋 Test Credentials:');
    console.log('   Guest User: audit.guest@test.com / AuditTest123!');
    console.log('   Authenticated User: audit.authenticated@test.com / AuditTest123!');
    console.log('   VIP User: audit.vip@test.com / AuditTest123!\n');
    
    console.log('📊 Test Data Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Addresses: ${TEST_ADDRESSES.length}`);
    console.log(`   Wines: ${TEST_WINES.length}`);
    console.log(`   Cart Items: 2`);
    console.log(`   Test Orders: 1\n`);

  } catch (error) {
    console.error('❌ Error setting up audit environment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAuditEnvironment()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
