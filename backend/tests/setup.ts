// @ts-nocheck
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
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

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

// Mock mongoose - the most critical mock for our tests
jest.mock('mongoose', () => {
  const MockSchema = jest.fn().mockImplementation(() => ({
    methods: {},
    statics: {},
    index: jest.fn(),
    pre: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    virtual: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    }),
    method: jest.fn().mockReturnThis(),
    statics: jest.fn().mockReturnThis(),
    plugin: jest.fn().mockReturnThis(),
  }));

  // Add Types to Schema
  MockSchema.Types = {
    ObjectId: jest.fn(() => 'mock-object-id'),
    String: jest.fn(),
    Number: jest.fn(),
    Date: jest.fn(),
    Boolean: jest.fn(),
    Array: jest.fn(),
    Mixed: jest.fn(),
    Buffer: jest.fn(),
  };

  return {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    Schema: MockSchema,
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
});

// Mock ioredis
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
  (Redis as any).Cluster = jest.fn().mockImplementation(() => ({
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
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  },
}));

// Mock CacheService
jest.mock('../src/services/CacheService', () => ({
  __esModule: true,
  default: {
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
  },
  cacheService: {
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
  },
}));

// Mock LLM client factory
jest.mock('../src/services/LLMClientFactory', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      getClient: jest.fn(() => ({
        generateResponse: jest.fn().mockResolvedValue('Mock response'),
        generateStreamingResponse: jest.fn().mockResolvedValue(['Mock', 'response']),
        testConnection: jest.fn().mockResolvedValue(true),
        sendPrompt: jest.fn().mockResolvedValue('Mock response'),
        extractCharacterInformation: jest.fn().mockResolvedValue({}),
        extractLocationInformation: jest.fn().mockResolvedValue({}),
      })),
      switchClient: jest.fn(),
      getCurrentClientType: jest.fn().mockReturnValue('mock'),
      testConnection: jest.fn().mockResolvedValue(true),
    })),
  },
}));

// Mock routes to prevent express Router errors
jest.mock('../src/routes/campaigns', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/characters', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/sessions', () => ({
  __esModule: true,
  default: jest.fn(),
  initializeGameEngineService: jest.fn(),
}));

jest.mock('../src/routes/gameplay', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/character-development', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/combat', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/campaign-themes', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/ai-analytics', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/quests', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/locations', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/campaign-settings', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/routes/story-arcs', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock specific models
jest.mock('../src/models', () => ({
  __esModule: true,
  default: {
    StoryArc: {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      create: jest.fn().mockResolvedValue({ _id: 'mock-story-arc-id' }),
      save: jest.fn().mockResolvedValue({ _id: 'mock-story-arc-id' }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    },
    Campaign: {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'mock-campaign-id' }) }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      create: jest.fn().mockResolvedValue({ _id: 'mock-campaign-id' }),
      save: jest.fn().mockResolvedValue({ _id: 'mock-campaign-id' }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    },
  },
  StoryArc: {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    create: jest.fn().mockResolvedValue({ _id: 'mock-story-arc-id' }),
    save: jest.fn().mockResolvedValue({ _id: 'mock-story-arc-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  },
  Campaign: {
    findById: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'mock-campaign-id' }) }),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    create: jest.fn().mockResolvedValue({ _id: 'mock-campaign-id' }),
    save: jest.fn().mockResolvedValue({ _id: 'mock-campaign-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  },
}));

// Mock StoryArc model specifically - this mocks the named exports from ../models/StoryArc
jest.mock('../src/models/StoryArc', () => {
  const mockStoryArcModel = {
    findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    create: jest.fn().mockResolvedValue({ _id: 'mock-story-arc-id' }),
    save: jest.fn().mockResolvedValue({ _id: 'mock-story-arc-id' }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  };

  return {
    __esModule: true,
    StoryArc: mockStoryArcModel,
    // Also export the interfaces
    IStoryArc: {},
    IStoryBeat: {},
    ICharacterMilestone: {},
    IWorldStateChange: {},
    IQuestProgress: {},
  };
});
