const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:5000';

async function testEndpoints() {
  console.log('Testing API endpoints...\n');
  console.log(`API Base URL: ${API_BASE}\n`);

  try {
    // Test 1: Get all products
    console.log('1. Testing GET /api/products');
    const allProducts = await axios.get(`${API_BASE}/api/products?limit=5`);
    console.log(`   Status: ${allProducts.status}`);
    console.log(`   Response structure:`, Object.keys(allProducts.data));
    if (allProducts.data.data) {
      console.log(`   Data structure:`, Object.keys(allProducts.data.data));
      console.log(`   Wines count:`, allProducts.data.data.wines?.length || 0);
    }
    console.log('');

    // Test 2: Search for Red wines
    console.log('2. Testing GET /api/products?search=Red');
    const redWines = await axios.get(`${API_BASE}/api/products?search=Red&limit=5`);
    console.log(`   Status: ${redWines.status}`);
    console.log(`   Response structure:`, Object.keys(redWines.data));
    if (redWines.data.data) {
      console.log(`   Data structure:`, Object.keys(redWines.data.data));
      console.log(`   Wines count:`, redWines.data.data.wines?.length || 0);
      if (redWines.data.data.wines?.length > 0) {
        console.log(`   First wine:`, redWines.data.data.wines[0].name);
      }
    }
    console.log('');

    // Test 3: Search for Champagne
    console.log('3. Testing GET /api/products?search=Champagne');
    const champagne = await axios.get(`${API_BASE}/api/products?search=Champagne&limit=5`);
    console.log(`   Status: ${champagne.status}`);
    console.log(`   Response structure:`, Object.keys(champagne.data));
    if (champagne.data.data) {
      console.log(`   Data structure:`, Object.keys(champagne.data.data));
      console.log(`   Wines count:`, champagne.data.data.wines?.length || 0);
      if (champagne.data.data.wines?.length > 0) {
        console.log(`   First wine:`, champagne.data.data.wines[0].name);
      }
    }
    console.log('');

    // Test 4: Search for White wines
    console.log('4. Testing GET /api/products?search=White');
    const whiteWines = await axios.get(`${API_BASE}/api/products?search=White&limit=5`);
    console.log(`   Status: ${whiteWines.status}`);
    console.log(`   Response structure:`, Object.keys(whiteWines.data));
    if (whiteWines.data.data) {
      console.log(`   Data structure:`, Object.keys(whiteWines.data.data));
      console.log(`   Wines count:`, whiteWines.data.data.wines?.length || 0);
      if (whiteWines.data.data.wines?.length > 0) {
        console.log(`   First wine:`, whiteWines.data.data.wines[0].name);
      }
    }
    console.log('');

    // Test 5: Filter by category
    console.log('5. Testing GET /api/products?category=Red Wine');
    const categoryRed = await axios.get(`${API_BASE}/api/products?category=Red%20Wine&limit=5`);
    console.log(`   Status: ${categoryRed.status}`);
    console.log(`   Response structure:`, Object.keys(categoryRed.data));
    if (categoryRed.data.data) {
      console.log(`   Data structure:`, Object.keys(categoryRed.data.data));
      console.log(`   Wines count:`, categoryRed.data.data.wines?.length || 0);
    }
    console.log('');

    // Test 6: Filter by category Champagne
    console.log('6. Testing GET /api/products?category=Champagne');
    const categoryChampagne = await axios.get(`${API_BASE}/api/products?category=Champagne&limit=5`);
    console.log(`   Status: ${categoryChampagne.status}`);
    console.log(`   Response structure:`, Object.keys(categoryChampagne.data));
    if (categoryChampagne.data.data) {
      console.log(`   Data structure:`, Object.keys(categoryChampagne.data.data));
      console.log(`   Wines count:`, categoryChampagne.data.data.wines?.length || 0);
    }
    console.log('');

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

testEndpoints();
