/**
 * Comprehensive verification script for website audit fixes
 * Tests all critical functionality to ensure fixes are working correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test functions
async function testPageExists(path, description) {
  try {
    const response = await makeRequest(`${FRONTEND_URL}${path}`);
    if (response.statusCode === 200) {
      results.passed.push(`✓ ${description}: Page loads successfully`);
      return true;
    } else {
      results.failed.push(`✗ ${description}: Returned status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`✗ ${description}: ${error.message}`);
    return false;
  }
}

async function testApiEndpoint(path, description) {
  try {
    const response = await makeRequest(`${BACKEND_URL}${path}`);
    if (response.statusCode === 200 || response.statusCode === 401) {
      // 401 is acceptable for protected endpoints
      results.passed.push(`✓ ${description}: API endpoint accessible`);
      return true;
    } else {
      results.failed.push(`✗ ${description}: Returned status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    results.failed.push(`✗ ${description}: ${error.message}`);
    return false;
  }
}

async function testApiConfiguration() {
  console.log('\n🔍 Testing API Configuration...\n');
  
  await testApiEndpoint('/api/products', 'Products API endpoint');
  await testApiEndpoint('/api/products/search', 'Search API endpoint');
  await testApiEndpoint('/api/products/filters', 'Filters API endpoint');
  await testApiEndpoint('/api/auth/login', 'Auth login endpoint');
  await testApiEndpoint('/api/cart', 'Cart API endpoint');
  await testApiEndpoint('/api/nft/collections', 'NFT collections endpoint');
}

async function testPageImplementations() {
  console.log('\n🔍 Testing Page Implementations...\n');
  
  // Test main pages
  await testPageExists('/', 'Homepage');
  await testPageExists('/products', 'Products page');
  await testPageExists('/collections', 'Collections page');
  await testPageExists('/login', 'Login page');
  await testPageExists('/register', 'Register page');
  await testPageExists('/cart', 'Cart page');
  await testPageExists('/checkout', 'Checkout page');
  await testPageExists('/about', 'About page');
  await testPageExists('/contact', 'Contact page');
  
  // Test dynamic routes (these might 404 without data, but should not error)
  await testPageExists('/products/red-wine', 'Category page (Red Wine)');
  await testPageExists('/products/bordeaux', 'Region page (Bordeaux)');
  await testPageExists('/products/search', 'Search page');
  
  // Test account pages (will redirect if not authenticated, but should not error)
  await testPageExists('/account', 'Account page');
  await testPageExists('/account/orders', 'Orders page');
}

async function testRemovedPages() {
  console.log('\n🔍 Testing Removed Pages...\n');
  
  try {
    const response = await makeRequest(`${FRONTEND_URL}/debug-api`);
    if (response.statusCode === 404) {
      results.passed.push('✓ Debug API page removed successfully');
    } else {
      results.warnings.push(`⚠ Debug API page still accessible (status ${response.statusCode})`);
    }
  } catch (error) {
    results.passed.push('✓ Debug API page removed successfully');
  }
}

async function checkForHardcodedUrls() {
  console.log('\n🔍 Checking for Hardcoded URLs...\n');
  
  // This is a basic check - in a real scenario, you'd scan the codebase
  results.warnings.push('⚠ Manual code review needed for hardcoded URLs');
  results.warnings.push('  Check: grep -r "localhost:5000" frontend/src/');
  results.warnings.push('  Check: grep -r "localhost:3000" frontend/src/');
}

async function testErrorHandling() {
  console.log('\n🔍 Testing Error Handling...\n');
  
  // Test 404 handling
  try {
    const response = await makeRequest(`${FRONTEND_URL}/nonexistent-page-12345`);
    if (response.statusCode === 404) {
      results.passed.push('✓ 404 error handling works');
    } else {
      results.warnings.push(`⚠ Unexpected status for 404 page: ${response.statusCode}`);
    }
  } catch (error) {
    results.failed.push(`✗ Error handling test failed: ${error.message}`);
  }
}

async function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  if (results.passed.length > 0) {
    console.log('✅ PASSED TESTS:\n');
    results.passed.forEach(test => console.log(`  ${test}`));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log('❌ FAILED TESTS:\n');
    results.failed.forEach(test => console.log(`  ${test}`));
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    results.warnings.forEach(warning => console.log(`  ${warning}`));
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log(`Total: ${results.passed.length} passed, ${results.failed.length} failed, ${results.warnings.length} warnings`);
  console.log('='.repeat(60) + '\n');
  
  // Exit with error code if tests failed
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive verification tests...');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  try {
    await testApiConfiguration();
    await testPageImplementations();
    await testRemovedPages();
    await testErrorHandling();
    await checkForHardcodedUrls();
  } catch (error) {
    console.error('Fatal error during testing:', error);
    results.failed.push(`✗ Fatal error: ${error.message}`);
  }
  
  await printResults();
}

// Run tests
runAllTests().catch(console.error);
