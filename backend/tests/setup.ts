// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock environment variables
process.env['NODE_ENV'] = 'test';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/test';
process.env['GEMINI_API_KEY'] = 'test-api-key';

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
