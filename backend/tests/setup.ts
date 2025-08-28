// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock environment variables
process.env['NODE_ENV'] = 'test';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/test';
process.env['GEMINI_API_KEY'] = 'test-api-key';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['CACHE_CLEAR_ON_STARTUP'] = 'false';
process.env['CLEAR_CACHE_ON_DEPLOY'] = 'false';

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

// Mock MongoDB connection
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    readyState: 1,
    close: jest.fn(),
  },
}));

// Mock Google Generative AI - simplified
jest.mock('@google/generative-ai');

// Mock Redis and ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    scan: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    status: 'ready',
  }));
});

// Mock CacheService to prevent Redis connection attempts
jest.mock('../src/services/CacheService', () => ({
  CacheService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    clearDeploymentCache: jest.fn(),
    warmCache: jest.fn(),
    getStats: jest.fn(),
    getPerformance: jest.fn(),
    isRailwayDeployment: jest.fn().mockReturnValue(false),
  })),
}));
