// Test setup file for Jest
import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.USE_MOCK_LLM = 'true';
process.env.MOCK_LLM_URL = 'http://localhost:5002';
process.env.GEMINI_API_KEY = 'test-api-key-for-ci';
process.env.TEST_MODE = 'true';
process.env.SKIP_PERFORMANCE_MONITORING = 'true';
process.env.LOG_LEVEL = 'error';

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
    stopFallbackCleanup: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
    getClient: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(1),
    }),
  })),
}));

// Mock LoggerService to prevent file system issues
jest.mock('../src/services/LoggerService', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    child: jest.fn().mockReturnThis(),
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

// Mock Next.js router and image components
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn(({ src, alt, ...props }) => {
    // Return a simple object for testing
    return { src, alt, ...props };
  }),
}));

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

// Mock WebSocket
Object.defineProperty(global, 'WebSocket', {
  value: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
    readyState: 1,
    url: '',
    protocol: '',
    extensions: '',
    bufferedAmount: 0,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    binaryType: 'blob',
  })),
});

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
