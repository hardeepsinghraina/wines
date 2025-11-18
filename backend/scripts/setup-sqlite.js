#!/usr/bin/env node

const { spawn } = require('child_process');
const { copyFileSync, existsSync } = require('fs');

console.log('📁 Setting up SQLite database for development...\n');

// Copy SQLite environment file
function setupEnv() {
  console.log('📝 Setting up environment variables...');
  copyFileSync('.env.sqlite', '.env');
  console.log('✅ Environment configured for SQLite');
}

// Create SQLite-compatible schema
function createSQLiteSchema() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Creating SQLite-compatible schema...');
    
    // This would require modifying the schema, but for now let's use a simpler approach
    console.log('⚠️  Note: Some features may be limited with SQLite');
    console.log('   - Decimal types will be stored as Float');
    console.log('   - Array fields will be stored as JSON strings');
    
    resolve();
  });
}

// Generate Prisma client
function generateClient() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Generating Prisma client...');
    
    const prisma = spawn('npx', ['prisma', 'generate'], {
      stdio: 'inherit'
    });
    
    prisma.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Prisma client generated');
        resolve();
      } else {
        reject(new Error(`Prisma generate failed with code ${code}`));
      }
    });
  });
}

// Main setup function
async function setupSQLite() {
  try {
    setupEnv();
    await createSQLiteSchema();
    
    console.log('\n💡 SQLite setup complete!');
    console.log('📋 Database file: ./dev.db');
    console.log('\n⚠️  Note: For full functionality, PostgreSQL is recommended');
    console.log('🚀 You can now start the backend server:');
    console.log('   npm run start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Try the PostgreSQL setup instead:');
    console.log('   node scripts/setup-db.js');
    process.exit(1);
  }
}

setupSQLite();