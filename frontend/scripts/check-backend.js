#!/usr/bin/env node

// Simple script to check if backend is running
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function checkBackend() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Backend is running and healthy');
      console.log(`   Status: ${data.data.status}`);
      console.log(`   Environment: ${data.data.environment}`);
    } else {
      console.log('⚠️  Backend is running but degraded');
      console.log(`   Status: ${data.data?.status || 'unknown'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.log('❌ Backend is not accessible');
    console.log(`   URL: ${API_URL}`);
    console.log(`   Error: ${error.message}`);
    console.log('\nMake sure to start the backend server:');
    console.log('   cd backend && npm run start');
    process.exit(1);
  }
}

checkBackend();