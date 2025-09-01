// Test setup file for Jest
import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.USE_MOCK_LLM = 'true';
process.env.MOCK_LLM_URL = 'http://localhost:5002';

// Global test timeout - increased for CI environment
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Enhanced mocks to prevent external dependencies
jest.mock('ioredis', () => require('ioredis-mock'));

// Mock CacheService to prevent cleanup interval issues
jest.mock('../src/services/CacheService', () => ({
  CacheService: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(true),
    clear: jest.fn().mockResolvedValue(true),
    initializeRedis: jest.fn(),
    startFallbackCleanup: jest.fn(),
  })),
}));

// Mock external AI services
jest.mock('@google/generative-ai');

// Mock Winston logger to prevent file system issues in CI
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    add: jest.fn(),
  })),
  format: {
    combine: jest.fn((...formats) => ({
      transform: jest.fn(info => info),
      ...formats.reduce((acc, format) => ({ ...acc, ...format }), {}),
    })),
    timestamp: jest.fn(() => ({ transform: jest.fn(info => info) })),
    errors: jest.fn(() => ({ transform: jest.fn(info => info) })),
    json: jest.fn(() => ({ transform: jest.fn(info => info) })),
    simple: jest.fn(() => ({ transform: jest.fn(info => info) })),
    colorize: jest.fn(() => ({ transform: jest.fn(info => info) })),
  },
  transports: {
    Console: jest.fn().mockImplementation(() => ({
      name: 'console',
      level: 'info',
    })),
    File: jest.fn().mockImplementation(() => ({
      name: 'file',
      level: 'info',
    })),
  },
}));

// Ensure MongoDB connection is properly configured for tests
beforeAll(async () => {
  // Wait a bit for MongoDB memory server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Global teardown to clean up any remaining timers and handles
afterAll(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Global setup to ensure clean state between test suites
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
