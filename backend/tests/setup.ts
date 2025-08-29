// Test setup file for Jest
import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.USE_MOCK_LLM = 'true';
process.env.MOCK_LLM_URL = 'http://localhost:5002';

// Global test timeout
jest.setTimeout(10000);

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

jest.mock('@google/generative-ai');

// Global teardown to clean up any remaining timers
afterAll(() => {
  jest.clearAllTimers();
});
