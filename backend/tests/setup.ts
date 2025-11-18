import { PrismaClient } from '@prisma/client';
import { redisService } from '../src/services/redis.service';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidEmail(): R;
      toBeValidUUID(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
  
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  
  // Initialize test database
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('Test database connected');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
  }
  
  await prisma.$disconnect();
});

// Global test cleanup
afterAll(async () => {
  // Close Redis connection
  try {
    const client = redisService.getClient();
    await client.quit();
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
});

// Suppress console logs during tests unless explicitly needed
const originalConsole = { ...console };
beforeEach(() => {
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  if (!process.env.VERBOSE_TESTS) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});