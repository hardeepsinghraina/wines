/**
 * Manual Product Discovery Audit Script
 * 
 * This script performs manual checks on the product discovery flow
 * and generates a report.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

function addResult(test, status, message, details = {}) {
  results.tests.push({
    test,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  results.summary.total++;
  if (status === 'PASS') results.summary.passed++;
  else if (status === 'FAIL') results.summary.failed++;
  else if (status === 'WARN') results.summary.warnings++;
}

async function testHomepageLoad() {
  console.log('\n=== Testing Homepage Load ===');
  try {
    const startTime = Date.now();
    const response = await fetch(FRONTEND_URL, { 
      signal: AbortSignal.timeout(5000)
    });
    const loadTime = Date.now() - startTime;
    
    if (response.ok) {
      if (loadTime < 2000) {
        addResult('Homepage Load Time', 'PASS', `Loaded in ${loadTime}ms (< 2000ms)`, { loadTime });
        console.log(`✓ Homepage loaded in ${loadTime}ms`);
      } else {
        addResult('Homepage Load Time', 'WARN', `Loaded in ${loadTime}ms (> 2000ms)`, { loadTime });
        console.log(`⚠ Homepage loaded in ${loadTime}ms (slower than target)`);
      }
    } else {
      addResult('Homepage Load', 'FAIL', `HTTP ${response.status}`, { status: response.status });
      console.log(`✗ Homepage returned status ${response.status}`);
    }
  } catch (error) {
    addResult('Homepage Load', 'FAIL', error.message, { error: error.toString() });
    console.log(`✗ Failed to load homepage: ${error.message}`);
  }
}

async function testProductsAPI() {
  console.log('\n=== Testing Products API ===');
  try {
    const response = await fetch(`${BACKEND_URL}/api/products`, { 
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      let products = [];
      
      // Handle different response structures
      if (data.success && data.data) {
        products = data.data.wines || data.data.products || [];
      } else if (data.wines) {
        products = data.wines;
      } else if (data.products) {
        products = data.products;
      } else if (Array.isArray(data)) {
        products = data;
      }
      
      if (products.length > 0) {
        addResult('Products API', 'PASS', `Retrieved ${products.length} products`, { count: products.length });
        console.log(`✓ Products API returned ${products.length} products`);
        
        // Check first product structure
        const firstProduct = products[0];
        const hasRequiredFields = firstProduct.name && firstProduct.price;
        
        if (hasRequiredFields) {
          addResult('Product Data Structure', 'PASS', 'Products have required fields', { 
            sample: { name: firstProduct.name, price: firstProduct.price }
          });
          console.log(`✓ Products have required fields (name, price)`);
        } else {
          addResult('Product Data Structure', 'WARN', 'Some required fields missing', { 
            sample: firstProduct
          });
          console.log(`⚠ Some products missing required fields`);
        }
      } else {
        addResult('Products API', 'WARN', 'No products returned', { count: 0 });
        console.log(`⚠ Products API returned no products`);
      }
    } else {
      addResult('Products API', 'FAIL', `HTTP ${response.status}`, { status: response.status });
      console.log(`✗ Products API returned status ${response.status}`);
    }
  } catch (error) {
    addResult('Products API', 'FAIL', error.message, { error: error.toString() });
    console.log(`✗ Failed to fetch products: ${error.message}`);
  }
}

async function testSearchFunctionality() {
  console.log('\n=== Testing Search Functionality ===');
  const searchQueries = ['Bordeaux', 'Red', 'Champagne'];
  
  for (const query of searchQueries) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products?search=${encodeURIComponent(query)}`, { 
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        let products = [];
        
        if (data.success && data.data) {
          products = data.data.wines || data.data.products || [];
        } else if (data.wines) {
          products = data.wines;
        } else if (data.products) {
          products = data.products;
        } else if (Array.isArray(data)) {
          products = data;
        }
        
        addResult(`Search: "${query}"`, 'PASS', `Found ${products.length} results`, { query, count: products.length });
        console.log(`✓ Search for "${query}" returned ${products.length} results`);
      } else {
        addResult(`Search: "${query}"`, 'FAIL', `HTTP ${response.status}`, { query, status: response.status });
        console.log(`✗ Search for "${query}" failed with status ${response.status}`);
      }
    } catch (error) {
      addResult(`Search: "${query}"`, 'FAIL', error.message, { query, error: error.toString() });
      console.log(`✗ Search for "${query}" failed: ${error.message}`);
    }
  }
}

async function testCategoryFiltering() {
  console.log('\n=== Testing Category Filtering ===');
  const categories = ['Red', 'White', 'Champagne'];
  
  for (const category of categories) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products?category=${encodeURIComponent(category)}`, { 
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        let products = [];
        
        if (data.success && data.data) {
          products = data.data.wines || data.data.products || [];
        } else if (data.wines) {
          products = data.wines;
        } else if (data.products) {
          products = data.products;
        } else if (Array.isArray(data)) {
          products = data;
        }
        
        addResult(`Category: "${category}"`, 'PASS', `Found ${products.length} products`, { category, count: products.length });
        console.log(`✓ Category "${category}" returned ${products.length} products`);
      } else {
        addResult(`Category: "${category}"`, 'FAIL', `HTTP ${response.status}`, { category, status: response.status });
        console.log(`✗ Category "${category}" failed with status ${response.status}`);
      }
    } catch (error) {
      addResult(`Category: "${category}"`, 'FAIL', error.message, { category, error: error.toString() });
      console.log(`✗ Category "${category}" failed: ${error.message}`);
    }
  }
}

async function generateReport() {
  console.log('\n=== Generating Report ===');
  
  const reportPath = path.join(__dirname, '..', 'docs', 'PRODUCT_DISCOVERY_AUDIT_RESULTS.md');
  
  let report = `# Product Discovery and Browsing Flow Audit Results\n\n`;
  report += `**Audit Date**: ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Audit Time**: ${new Date().toISOString()}\n`;
  report += `**Auditor**: Automated Audit Script\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total Tests**: ${results.summary.total}\n`;
  report += `- **Passed**: ${results.summary.passed} ✓\n`;
  report += `- **Failed**: ${results.summary.failed} ✗\n`;
  report += `- **Warnings**: ${results.summary.warnings} ⚠\n\n`;
  
  report += `## Test Results\n\n`;
  
  for (const test of results.tests) {
    const icon = test.status === 'PASS' ? '✓' : test.status === 'FAIL' ? '✗' : '⚠';
    report += `### ${icon} ${test.test}\n\n`;
    report += `- **Status**: ${test.status}\n`;
    report += `- **Message**: ${test.message}\n`;
    if (Object.keys(test.details).length > 0) {
      report += `- **Details**: \`\`\`json\n${JSON.stringify(test.details, null, 2)}\n\`\`\`\n`;
    }
    report += `\n`;
  }
  
  report += `## Recommendations\n\n`;
  
  if (results.summary.failed > 0) {
    report += `### Critical Issues\n\n`;
    report += `${results.summary.failed} test(s) failed. Please review the failed tests above and address the issues.\n\n`;
  }
  
  if (results.summary.warnings > 0) {
    report += `### Warnings\n\n`;
    report += `${results.summary.warnings} test(s) have warnings. These should be reviewed for potential improvements.\n\n`;
  }
  
  if (results.summary.failed === 0 && results.summary.warnings === 0) {
    report += `All tests passed successfully! The product discovery flow is working as expected.\n\n`;
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`\n✓ Report generated: ${reportPath}`);
}

async function runAudit() {
  console.log('='.repeat(60));
  console.log('PRODUCT DISCOVERY AND BROWSING FLOW AUDIT');
  console.log('='.repeat(60));
  
  await testHomepageLoad();
  await testProductsAPI();
  await testSearchFunctionality();
  await testCategoryFiltering();
  
  console.log('\n' + '='.repeat(60));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nTotal: ${results.summary.total} | Passed: ${results.summary.passed} | Failed: ${results.summary.failed} | Warnings: ${results.summary.warnings}`);
  
  await generateReport();
}

// Run the audit
runAudit().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
