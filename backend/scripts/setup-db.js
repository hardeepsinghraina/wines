#!/usr/bin/env node

const { spawn } = require('child_process');
const { existsSync } = require('fs');

console.log('🐘 Setting up PostgreSQL database for development...\n');

// Check if Docker is available
function checkDocker() {
  return new Promise((resolve) => {
    const docker = spawn('docker', ['--version'], { stdio: 'pipe' });
    docker.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Start PostgreSQL container
function startPostgres() {
  return new Promise((resolve, reject) => {
    console.log('📦 Starting PostgreSQL container...');
    
    const dockerCompose = spawn('docker-compose', ['-f', 'docker-compose.dev.yml', 'up', '-d'], {
      stdio: 'inherit'
    });
    
    dockerCompose.on('close', (code) => {
      if (code === 0) {
        console.log('✅ PostgreSQL container started successfully');
        resolve();
      } else {
        reject(new Error(`Docker compose failed with code ${code}`));
      }
    });
  });
}

// Wait for database to be ready
function waitForDatabase() {
  return new Promise((resolve) => {
    console.log('⏳ Waiting for database to be ready...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkConnection = () => {
      attempts++;
      
      const pg = spawn('docker', [
        'exec', 'luxury-wine-postgres-dev', 
        'pg_isready', '-U', 'postgres', '-d', 'luxury_wine_db'
      ], { stdio: 'pipe' });
      
      pg.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database is ready!');
          resolve();
        } else if (attempts < maxAttempts) {
          console.log(`   Attempt ${attempts}/${maxAttempts}...`);
          setTimeout(checkConnection, 1000);
        } else {
          console.log('⚠️  Database took longer than expected, but continuing...');
          resolve();
        }
      });
    };
    
    setTimeout(checkConnection, 2000);
  });
}

// Run Prisma migrations
function runMigrations() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Running database migrations...');
    
    const prisma = spawn('npx', ['prisma', 'migrate', 'dev', '--name', 'init'], {
      stdio: 'inherit'
    });
    
    prisma.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database migrations completed');
        resolve();
      } else {
        console.log('⚠️  Migrations failed, but database is available');
        resolve(); // Continue anyway
      }
    });
  });
}

// Main setup function
async function setupDatabase() {
  try {
    // Check if Docker is available
    const dockerAvailable = await checkDocker();
    if (!dockerAvailable) {
      console.log('❌ Docker is not available. Please install Docker first.');
      console.log('   Download from: https://www.docker.com/products/docker-desktop');
      process.exit(1);
    }
    
    // Start PostgreSQL
    await startPostgres();
    
    // Wait for database
    await waitForDatabase();
    
    // Run migrations
    await runMigrations();
    
    console.log('\n🎉 Database setup complete!');
    console.log('📋 Connection details:');
    console.log('   Host: localhost');
    console.log('   Port: 5432');
    console.log('   Database: luxury_wine_db');
    console.log('   Username: postgres');
    console.log('   Password: password');
    console.log('\n🚀 You can now start the backend server:');
    console.log('   npm run start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();