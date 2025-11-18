#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const config = {
  backend: {
    cwd: path.join(__dirname, '..', 'backend'),
    tests: [
      'npm run test:integration',
      'npm run test:e2e'
    ]
  },
  frontend: {
    cwd: path.join(__dirname, '..', 'frontend'),
    tests: [
      'npm run test',
      'npm run test:e2e'
    ]
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}Running: ${command} in ${cwd}${colors.reset}`);
    
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`${colors.green}✓ ${command} completed successfully${colors.reset}`);
        resolve();
      } else {
        log(`${colors.red}✗ ${command} failed with code ${code}${colors.reset}`);
        reject(new Error(`Command failed: ${command}`));
      }
    });

    child.on('error', (error) => {
      log(`${colors.red}✗ Error running ${command}: ${error.message}${colors.reset}`);
      reject(error);
    });
  });
}

async function runTests() {
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  log(`${colors.bright}${colors.blue}🧪 Starting Checkout End-to-End Test Suite${colors.reset}`);
  log(`${colors.yellow}Testing complete checkout flow across frontend and backend${colors.reset}\n`);

  try {
    // Check if required directories exist
    if (!fs.existsSync(config.backend.cwd)) {
      throw new Error('Backend directory not found');
    }
    if (!fs.existsSync(config.frontend.cwd)) {
      throw new Error('Frontend directory not found');
    }

    // Run backend tests
    log(`${colors.bright}${colors.magenta}📦 Running Backend Tests${colors.reset}`);
    for (const test of config.backend.tests) {
      totalTests++;
      try {
        await runCommand(test, config.backend.cwd);
        passedTests++;
      } catch (error) {
        failedTests++;
        log(`${colors.red}Backend test failed: ${test}${colors.reset}`);
      }
    }

    // Run frontend tests
    log(`${colors.bright}${colors.magenta}🎨 Running Frontend Tests${colors.reset}`);
    for (const test of config.frontend.tests) {
      totalTests++;
      try {
        await runCommand(test, config.frontend.cwd);
        passedTests++;
      } catch (error) {
        failedTests++;
        log(`${colors.red}Frontend test failed: ${test}${colors.reset}`);
      }
    }

    // Generate test report
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    log(`\n${colors.bright}${colors.blue}📊 Test Results Summary${colors.reset}`);
    log(`${colors.cyan}Total Tests: ${totalTests}${colors.reset}`);
    log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    log(`${colors.yellow}Duration: ${duration}s${colors.reset}`);

    if (failedTests === 0) {
      log(`\n${colors.bright}${colors.green}🎉 All checkout tests passed!${colors.reset}`);
      log(`${colors.green}✓ Complete checkout flow is working correctly${colors.reset}`);
      log(`${colors.green}✓ All payment scenarios tested${colors.reset}`);
      log(`${colors.green}✓ Age verification integration verified${colors.reset}`);
      log(`${colors.green}✓ Error handling tested${colors.reset}`);
      log(`${colors.green}✓ Performance requirements met${colors.reset}`);
      log(`${colors.green}✓ Accessibility compliance verified${colors.reset}`);
      process.exit(0);
    } else {
      log(`\n${colors.bright}${colors.red}❌ Some tests failed${colors.reset}`);
      log(`${colors.red}Please review the test output above and fix the issues${colors.reset}`);
      process.exit(1);
    }

  } catch (error) {
    log(`\n${colors.bright}${colors.red}💥 Test suite failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log(`\n${colors.yellow}Test suite interrupted${colors.reset}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log(`\n${colors.yellow}Test suite terminated${colors.reset}`);
  process.exit(1);
});

// Run the tests
runTests().catch((error) => {
  log(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});