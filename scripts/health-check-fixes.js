#!/usr/bin/env node

/**
 * Quick health check for website audit fixes
 * Verifies critical files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else {
    checks.failed.push(`✗ ${description} - File not found: ${filePath}`);
    return false;
  }
}

function checkFileNotExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else {
    checks.failed.push(`✗ ${description} - File should not exist: ${filePath}`);
    return false;
  }
}

function checkFileContent(filePath, searchString, shouldExist, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    checks.warnings.push(`⚠ Cannot check ${description} - File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const found = content.includes(searchString);
  
  if (shouldExist && found) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else if (!shouldExist && !found) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else {
    checks.failed.push(`✗ ${description}`);
    return false;
  }
}

function searchForPattern(directory, pattern, description) {
  const results = [];
  
  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, .git
        if (!['node_modules', '.next', '.git', 'dist'].includes(item)) {
          searchDir(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.match(pattern)) {
          results.push(fullPath.replace(process.cwd(), ''));
        }
      }
    }
  }
  
  searchDir(directory);
  
  if (results.length === 0) {
    checks.passed.push(`✓ ${description}`);
    return true;
  } else {
    checks.warnings.push(`⚠ ${description} - Found in ${results.length} files`);
    results.slice(0, 5).forEach(file => {
      checks.warnings.push(`  - ${file}`);
    });
    if (results.length > 5) {
      checks.warnings.push(`  ... and ${results.length - 5} more`);
    }
    return false;
  }
}

console.log('🔍 Running health checks for website audit fixes...\n');

// Check critical page implementations
console.log('📄 Checking Page Implementations...');
checkFileExists('frontend/src/app/products/[category]/page.tsx', 'Category page implemented');
checkFileExists('frontend/src/app/products/search/page.tsx', 'Search page exists');
checkFileExists('frontend/src/app/collections/page.tsx', 'Collections page exists');
checkFileExists('frontend/src/app/account/orders/[orderId]/page.tsx', 'Order detail page exists');

// Check removed pages
console.log('\n🗑️  Checking Removed Pages...');
checkFileNotExists('frontend/src/app/debug-api/page.tsx', 'Debug API page removed');

// Check API configuration
console.log('\n⚙️  Checking API Configuration...');
checkFileExists('frontend/src/config/api.ts', 'API config file exists');
checkFileExists('frontend/src/lib/api.ts', 'API client exists');
checkFileExists('frontend/src/lib/api-helpers.ts', 'API helpers exist');

// Check for hardcoded URLs
console.log('\n🔗 Checking for Hardcoded URLs...');
searchForPattern(
  'frontend/src',
  /localhost:5000/,
  'No hardcoded localhost:5000 in frontend'
);
searchForPattern(
  'frontend/src',
  /http:\/\/localhost:3000/,
  'No hardcoded localhost:3000 in frontend'
);

// Check cart implementation
console.log('\n🛒 Checking Cart Implementation...');
checkFileExists('frontend/src/contexts/CartContext.tsx', 'Cart context exists');
checkFileExists('frontend/src/components/cart/ShoppingCart.tsx', 'Shopping cart component exists');
checkFileExists('frontend/src/components/cart/CartStatusIndicator.tsx', 'Cart status indicator exists');

// Check authentication
console.log('\n🔐 Checking Authentication...');
checkFileExists('frontend/src/lib/auth-api.ts', 'Auth API client exists');
checkFileExists('frontend/src/components/forms/LoginForm.tsx', 'Login form exists');

// Check error handling
console.log('\n❌ Checking Error Handling...');
checkFileExists('frontend/src/lib/error-messages.ts', 'Error messages file exists');
checkFileExists('frontend/src/components/ui/ErrorDisplay.tsx', 'Error display component exists');
checkFileExists('frontend/src/app/error.tsx', 'Error page exists');
checkFileExists('frontend/src/app/global-error.tsx', 'Global error page exists');

// Check offline support
console.log('\n📡 Checking Offline Support...');
checkFileExists('frontend/src/contexts/ConnectionContext.tsx', 'Connection context exists');
checkFileExists('frontend/src/components/connection/OfflineIndicator.tsx', 'Offline indicator exists');
checkFileExists('frontend/src/lib/offline-queue.ts', 'Offline queue exists');

// Check search functionality
console.log('\n🔍 Checking Search Functionality...');
checkFileExists('frontend/src/components/product/SearchBar.tsx', 'Search bar component exists');

// Check filter functionality
console.log('\n🎛️  Checking Filter Functionality...');
checkFileExists('frontend/src/components/product/ProductFilters.tsx', 'Product filters component exists');

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 HEALTH CHECK RESULTS');
console.log('='.repeat(60) + '\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED CHECKS:\n');
  checks.passed.forEach(check => console.log(`  ${check}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:\n');
  checks.failed.forEach(check => console.log(`  ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  checks.warnings.forEach(warning => console.log(`  ${warning}`));
  console.log('');
}

console.log('='.repeat(60));
console.log(`Total: ${checks.passed.length} passed, ${checks.failed.length} failed, ${checks.warnings.length} warnings`);
console.log('='.repeat(60) + '\n');

if (checks.failed.length > 0) {
  console.log('❌ Some checks failed. Please review the issues above.\n');
  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log('⚠️  All critical checks passed, but there are warnings to review.\n');
  process.exit(0);
} else {
  console.log('✅ All checks passed successfully!\n');
  process.exit(0);
}
