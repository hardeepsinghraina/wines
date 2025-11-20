/**
 * Baseline Metrics Collection Script
 * 
 * This script collects baseline performance metrics for the checkout payment flow audit.
 * It measures page load times, API response times, and other key performance indicators.
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const RESULTS_DIR = path.join(__dirname, '../docs/audit-results');

// Metrics to collect
const metrics = {
  timestamp: new Date().toISOString(),
  pageLoadTimes: {},
  apiResponseTimes: {},
  operationTimes: {},
  errors: [],
  warnings: []
};

/**
 * Measure page load time
 */
async function measurePageLoad(page, url, pageName) {
  console.log(`📊 Measuring ${pageName} load time...`);
  
  try {
    const startTime = Date.now();
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics from the browser
    const performanceMetrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        loadComplete: perfData.loadEventEnd - perfData.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });
    
    metrics.pageLoadTimes[pageName] = {
      totalTime: loadTime,
      domContentLoaded: performanceMetrics.domContentLoaded,
      loadComplete: performanceMetrics.loadComplete,
      firstPaint: performanceMetrics.firstPaint,
      firstContentfulPaint: performanceMetrics.firstContentfulPaint,
      status: loadTime < 2000 ? '✅ Pass' : '⚠️ Slow',
      target: '< 2000ms'
    };
    
    console.log(`   ✓ ${pageName}: ${loadTime}ms ${metrics.pageLoadTimes[pageName].status}`);
    
  } catch (error) {
    console.error(`   ✗ Error measuring ${pageName}:`, error.message);
    metrics.errors.push({
      page: pageName,
      error: error.message
    });
  }
}

/**
 * Measure API response time
 */
async function measureAPIResponse(endpoint, method = 'GET', body = null) {
  console.log(`📊 Measuring API ${method} ${endpoint}...`);
  
  try {
    const startTime = Date.now();
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const responseTime = Date.now() - startTime;
    
    metrics.apiResponseTimes[`${method} ${endpoint}`] = {
      time: responseTime,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      result: responseTime < 1000 ? '✅ Pass' : '⚠️ Slow',
      target: '< 1000ms'
    };
    
    console.log(`   ✓ ${method} ${endpoint}: ${responseTime}ms (${response.status})`);
    
  } catch (error) {
    console.error(`   ✗ Error measuring API ${endpoint}:`, error.message);
    metrics.errors.push({
      api: `${method} ${endpoint}`,
      error: error.message
    });
  }
}

/**
 * Measure cart operation performance
 */
async function measureCartOperations(page) {
  console.log('📊 Measuring cart operations...');
  
  try {
    // Navigate to a product page
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle2' });
    
    // Measure Add to Cart
    const addToCartStart = Date.now();
    await page.click('[data-testid="add-to-cart"]').catch(() => {
      // Fallback if testid not found
      return page.click('button:has-text("Add to Cart")').catch(() => null);
    });
    await page.waitForTimeout(500); // Wait for operation to complete
    const addToCartTime = Date.now() - addToCartStart;
    
    metrics.operationTimes['Add to Cart'] = {
      time: addToCartTime,
      status: addToCartTime < 500 ? '✅ Pass' : '⚠️ Slow',
      target: '< 500ms'
    };
    
    console.log(`   ✓ Add to Cart: ${addToCartTime}ms`);
    
    // Open cart
    await page.click('[data-testid="cart-icon"]').catch(() => {
      return page.click('button:has-text("Cart")').catch(() => null);
    });
    await page.waitForTimeout(300);
    
    // Measure Update Quantity
    const updateStart = Date.now();
    await page.click('[data-testid="increase-quantity"]').catch(() => {
      return page.click('button:has-text("+")').catch(() => null);
    });
    await page.waitForTimeout(500);
    const updateTime = Date.now() - updateStart;
    
    metrics.operationTimes['Update Quantity'] = {
      time: updateTime,
      status: updateTime < 500 ? '✅ Pass' : '⚠️ Slow',
      target: '< 500ms'
    };
    
    console.log(`   ✓ Update Quantity: ${updateTime}ms`);
    
  } catch (error) {
    console.error('   ✗ Error measuring cart operations:', error.message);
    metrics.errors.push({
      operation: 'Cart Operations',
      error: error.message
    });
  }
}

/**
 * Check for console errors
 */
async function checkConsoleErrors(page) {
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });
  
  return consoleErrors;
}

/**
 * Main execution
 */
async function collectMetrics() {
  console.log('🚀 Starting baseline metrics collection...\n');
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Collect console errors
    const consoleErrors = await checkConsoleErrors(page);
    
    // Measure page load times
    console.log('📄 Measuring page load times...\n');
    await measurePageLoad(page, BASE_URL, 'Homepage');
    await measurePageLoad(page, `${BASE_URL}/products`, 'Product Listing');
    await measurePageLoad(page, `${BASE_URL}/cart`, 'Cart Page');
    await measurePageLoad(page, `${BASE_URL}/checkout`, 'Checkout Page');
    
    // Measure cart operations
    console.log('\n🛒 Measuring cart operations...\n');
    await measureCartOperations(page);
    
    // Add console errors to metrics
    if (consoleErrors.length > 0) {
      metrics.warnings.push({
        type: 'Console Errors',
        count: consoleErrors.length,
        errors: consoleErrors.slice(0, 10) // First 10 errors
      });
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error during metrics collection:', error);
    metrics.errors.push({
      phase: 'Main Execution',
      error: error.message
    });
    
    if (browser) {
      await browser.close();
    }
  }
  
  // Measure API response times
  console.log('\n🔌 Measuring API response times...\n');
  await measureAPIResponse('/api/products');
  await measureAPIResponse('/api/cart');
  await measureAPIResponse('/health');
  
  // Save results
  console.log('\n💾 Saving results...\n');
  await saveResults();
  
  // Print summary
  printSummary();
}

/**
 * Save results to file
 */
async function saveResults() {
  try {
    // Create results directory if it doesn't exist
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    
    // Save JSON results
    const jsonPath = path.join(RESULTS_DIR, 'baseline-metrics.json');
    await fs.writeFile(jsonPath, JSON.stringify(metrics, null, 2));
    console.log(`   ✓ Saved JSON results to ${jsonPath}`);
    
    // Save markdown report
    const mdPath = path.join(RESULTS_DIR, 'baseline-metrics-report.md');
    const report = generateMarkdownReport();
    await fs.writeFile(mdPath, report);
    console.log(`   ✓ Saved markdown report to ${mdPath}`);
    
  } catch (error) {
    console.error('   ✗ Error saving results:', error.message);
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  let report = `# Baseline Metrics Report\n\n`;
  report += `**Generated**: ${metrics.timestamp}\n\n`;
  
  // Page Load Times
  report += `## Page Load Times\n\n`;
  report += `| Page | Load Time | Status | Target |\n`;
  report += `|------|-----------|--------|--------|\n`;
  
  for (const [page, data] of Object.entries(metrics.pageLoadTimes)) {
    report += `| ${page} | ${data.totalTime}ms | ${data.status} | ${data.target} |\n`;
  }
  
  // Operation Times
  report += `\n## Operation Performance\n\n`;
  report += `| Operation | Time | Status | Target |\n`;
  report += `|-----------|------|--------|--------|\n`;
  
  for (const [operation, data] of Object.entries(metrics.operationTimes)) {
    report += `| ${operation} | ${data.time}ms | ${data.status} | ${data.target} |\n`;
  }
  
  // API Response Times
  report += `\n## API Response Times\n\n`;
  report += `| Endpoint | Time | Status | Result | Target |\n`;
  report += `|----------|------|--------|--------|--------|\n`;
  
  for (const [endpoint, data] of Object.entries(metrics.apiResponseTimes)) {
    report += `| ${endpoint} | ${data.time}ms | ${data.status} | ${data.result} | ${data.target} |\n`;
  }
  
  // Errors
  if (metrics.errors.length > 0) {
    report += `\n## Errors\n\n`;
    metrics.errors.forEach(error => {
      report += `- **${error.page || error.api || error.operation || error.phase}**: ${error.error}\n`;
    });
  }
  
  // Warnings
  if (metrics.warnings.length > 0) {
    report += `\n## Warnings\n\n`;
    metrics.warnings.forEach(warning => {
      report += `- **${warning.type}**: ${warning.count} occurrences\n`;
    });
  }
  
  return report;
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log('\n📊 Baseline Metrics Summary\n');
  console.log('═══════════════════════════════════════\n');
  
  // Page Load Times
  console.log('📄 Page Load Times:');
  for (const [page, data] of Object.entries(metrics.pageLoadTimes)) {
    console.log(`   ${page}: ${data.totalTime}ms ${data.status}`);
  }
  
  // Operation Times
  console.log('\n🛒 Operation Performance:');
  for (const [operation, data] of Object.entries(metrics.operationTimes)) {
    console.log(`   ${operation}: ${data.time}ms ${data.status}`);
  }
  
  // API Response Times
  console.log('\n🔌 API Response Times:');
  for (const [endpoint, data] of Object.entries(metrics.apiResponseTimes)) {
    console.log(`   ${endpoint}: ${data.time}ms ${data.result}`);
  }
  
  // Errors and Warnings
  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Errors: ${metrics.errors.length}`);
  }
  
  if (metrics.warnings.length > 0) {
    console.log(`⚠️  Warnings: ${metrics.warnings.length}`);
  }
  
  console.log('\n═══════════════════════════════════════\n');
  console.log('✅ Metrics collection complete!\n');
}

// Run the script
collectMetrics()
  .then(() => {
    console.log('🎉 Baseline metrics collected successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Metrics collection failed:', error);
    process.exit(1);
  });
