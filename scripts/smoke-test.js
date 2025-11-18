#!/usr/bin/env node

/**
 * Quick smoke test for critical functionality
 * Run this after starting both servers to verify basic functionality
 */

const http = require('http');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function test(name, url, expectedStatus = 200) {
  try {
    const response = await makeRequest(url);
    const passed = response.statusCode === expectedStatus || 
                   (expectedStatus === 200 && response.statusCode < 400);
    
    if (passed) {
      results.passed++;
      results.tests.push({ name, status: 'PASS', code: response.statusCode });
      process.stdout.write('.');
    } else {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', code: response.statusCode, expected: expectedStatus });
      process.stdout.write('F');
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'ERROR', error: error.message });
    process.stdout.write('E');
  }
}

async function runSmokeTests() {
  console.log('🔥 Running smoke tests...\n');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}\n`);
  
  // Backend API tests
  await test('Backend Health', `${BACKEND_URL}/api/health`);
  await test('Products API', `${BACKEND_URL}/api/products`);
  await test('Search API', `${BACKEND_URL}/api/products/search?q=wine`);
  await test('Filters API', `${BACKEND_URL}/api/products/filters`);
  await test('Auth Login Endpoint', `${BACKEND_URL}/api/auth/login`);
  
  // Frontend page tests
  await test('Homepage', `${FRONTEND_URL}/`);
  await test('Products Page', `${FRONTEND_URL}/products`);
  await test('Collections Page', `${FRONTEND_URL}/collections`);
  await test('Login Page', `${FRONTEND_URL}/login`);
  await test('Cart Page', `${FRONTEND_URL}/cart`);
  await test('Category Page', `${FRONTEND_URL}/products/red-wine`);
  await test('Search Page', `${FRONTEND_URL}/products/search`);
  
  // 404 test
  await test('404 Handling', `${FRONTEND_URL}/nonexistent-page-12345`, 404);
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SMOKE TEST RESULTS');
  console.log('='.repeat(60) + '\n');
  
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✓' : '✗';
    const color = test.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    let details = `[${test.code || 'N/A'}]`;
    if (test.expected) details += ` (expected ${test.expected})`;
    if (test.error) details = test.error;
    
    console.log(`${color}${icon}${reset} ${test.name.padEnd(30)} ${details}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.passed} passed, ${results.failed} failed`);
  console.log('='.repeat(60) + '\n');
  
  if (results.failed > 0) {
    console.log('❌ Some tests failed. Please check the servers are running.\n');
    console.log('Start backend: cd backend && npm run dev');
    console.log('Start frontend: cd frontend && npm run dev\n');
    process.exit(1);
  } else {
    console.log('✅ All smoke tests passed!\n');
    process.exit(0);
  }
}

runSmokeTests().catch(error => {
  console.error('\n\n❌ Fatal error:', error.message);
  process.exit(1);
});
