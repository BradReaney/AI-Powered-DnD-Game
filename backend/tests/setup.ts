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
jest.mock('ioredis', () => {
  const Redis = jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-1),
    scan: jest.fn().mockResolvedValue(['0', []]),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  }));
  Redis.Cluster = jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-1),
    scan: jest.fn().mockResolvedValue(['0', []]),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  }));
  return Redis;
});

// Mock LoggerService
jest.mock('../src/services/LoggerService', () => ({
  LoggerService: {
    getInstance: jest.fn(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
    })),
  },
}));

// Mock CacheService
jest.mock('../src/services/CacheService', () => ({
  CacheService: {
    getInstance: jest.fn(() => ({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(0),
      expire: jest.fn().mockResolvedValue(1),
      ttl: jest.fn().mockResolvedValue(-1),
      scan: jest.fn().mockResolvedValue(['0', []]),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Mock LLM client
jest.mock('../src/services/LLMClientFactory', () => ({
  LLMClientFactory: {
    createClient: jest.fn(() => ({
      generateResponse: jest.fn().mockResolvedValue('Mock response'),
      generateStreamingResponse: jest.fn().mockResolvedValue(['Mock', 'response']),
    })),
  },
}));

// Mock performance monitoring
jest.mock('../src/middleware/performance', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => next()),
}));

// Mock security middleware
jest.mock('../src/middleware/security', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => next()),
}));

// Mock compression
jest.mock('compression', () => jest.fn(() => (req, res, next) => next()));

// Mock morgan
jest.mock('morgan', () => jest.fn(() => (req, res, next) => next()));

// Mock cors
jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
  validate: jest.fn(() => true),
}));

// Mock mongoose
jest.mock('mongoose', () => {
  const mongoose = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    connection: {
      db: {
        collection: jest.fn(() => ({
          find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
          findOne: jest.fn().mockResolvedValue(null),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
          countDocuments: jest.fn().mockResolvedValue(0),
          aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
        })),
        createCollection: jest.fn().mockResolvedValue(undefined),
      },
      collections: {},
      readyState: 1,
    },
    Schema: jest.fn(),
    model: jest.fn(() => ({
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockResolvedValue({ _id: 'mock-id' }),
      save: jest.fn().mockResolvedValue({ _id: 'mock-id' }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    })),
    Types: {
      ObjectId: jest.fn(() => 'mock-object-id'),
    },
  };
  return mongoose;
});

// Mock express
jest.mock('express', () => {
  const express = jest.fn(() => ({
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
    listen: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    enable: jest.fn().mockReturnThis(),
    disable: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    urlencoded: jest.fn().mockReturnThis(),
    static: jest.fn().mockReturnThis(),
    Router: jest.fn(() => ({
      use: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      put: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      patch: jest.fn().mockReturnThis(),
    })),
  }));
  express.json = jest.fn();
  express.urlencoded = jest.fn();
  express.static = jest.fn();
  return express;
});

// Mock supertest
jest.mock('supertest', () => {
  const supertest = jest.fn(() => ({
    get: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    patch: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    expect: jest.fn().mockReturnThis(),
    end: jest.fn().mockImplementation(callback => {
      if (callback) callback(null, { status: 200, body: {} });
      return Promise.resolve({ status: 200, body: {} });
    }),
  }));
  return supertest;
});

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'mock file content'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => []),
  statSync: jest.fn(() => ({ isDirectory: () => false })),
  promises: {
    readFile: jest.fn().mockResolvedValue('mock file content'),
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
    stat: jest.fn().mockResolvedValue({ isDirectory: () => false }),
  },
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn(() => '/mock/dir'),
  basename: jest.fn(() => 'mock-file'),
  extname: jest.fn(() => '.js'),
}));

// Mock os
jest.mock('os', () => ({
  platform: jest.fn(() => 'linux'),
  arch: jest.fn(() => 'x64'),
  cpus: jest.fn(() => [{ model: 'Mock CPU', speed: 1000 }]),
  totalmem: jest.fn(() => 8589934592), // 8GB
  freemem: jest.fn(() => 4294967296), // 4GB
  hostname: jest.fn(() => 'mock-host'),
  type: jest.fn(() => 'Linux'),
  release: jest.fn(() => '5.4.0'),
  uptime: jest.fn(() => 3600),
  userInfo: jest.fn(() => ({ username: 'mock-user', homedir: '/home/mock-user' })),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('mock-random-bytes')),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hash'),
  })),
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-hmac'),
  })),
}));

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    stdout: { on: jest.fn(), pipe: jest.fn() },
    stderr: { on: jest.fn(), pipe: jest.fn() },
    on: jest.fn(),
    kill: jest.fn(),
  })),
  exec: jest.fn((command, callback) => {
    if (callback) callback(null, 'mock output', '');
    return { stdout: { on: jest.fn() }, stderr: { on: jest.fn() } };
  }),
  execSync: jest.fn(() => 'mock output'),
}));

// Mock cluster
jest.mock('cluster', () => ({
  isMaster: false,
  isPrimary: false,
  isWorker: true,
  fork: jest.fn(),
  on: jest.fn(),
  process: {
    pid: 12345,
    on: jest.fn(),
    exit: jest.fn(),
  },
}));

// Mock process
Object.defineProperty(process, 'exit', {
  value: jest.fn(),
  writable: true,
});

// Mock Buffer
global.Buffer = Buffer;

// Mock setTimeout and clearTimeout
global.setTimeout = jest.fn((callback, delay) => {
  if (typeof callback === 'function') {
    callback();
  }
  return 123;
});

global.clearTimeout = jest.fn();

// Mock setInterval and clearInterval
global.setInterval = jest.fn((callback, delay) => {
  if (typeof callback === 'function') {
    callback();
  }
  return 456;
});

global.clearInterval = jest.fn();

// Mock Date
const mockDate = new Date('2023-01-01T00:00:00.000Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

// Mock Math.random
jest.spyOn(Math, 'random').mockReturnValue(0.5);

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.env
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret';
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.USE_MOCK_LLM = 'true';
process.env.MOCK_LLM_URL = 'http://localhost:5002';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error';
process.env.TEST_MODE = 'true';
process.env.SKIP_PERFORMANCE_MONITORING = 'true';
