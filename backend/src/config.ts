import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  mongodb: {
    uri: string;
    uriProd: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    db: number;
    maxRetriesPerRequest: number;
    connectTimeout: number;
    commandTimeout: number;
    keepAlive: number;
  };
  gemini: {
    apiKey: string;
    flashLiteModel: string;
    flashModel: string;
    proModel: string;
    modelSelectionEnabled: boolean;
    flashLiteQualityThreshold: number;
    flashQualityThreshold: number;
    proFallbackEnabled: boolean;
    threeModelFallbackEnabled: boolean;
    flashLiteResponseTimeThreshold: number;
    flashResponseTimeThreshold: number;
    serviceUrl: string;
    useMockService: boolean;
  };
  security: {
    jwtSecret: string;
    corsOrigin: string;
  };
  logging: {
    level: string;
    file: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  session: {
    secret: string;
    maxAge: number;
  };
  ai: {
    maxContextLength: number;
    contextCompressionThreshold: number;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env['PORT'] || '5001', 10),
    nodeEnv: process.env['NODE_ENV'] || 'development',
  },
  mongodb: {
    uri: process.env['MONGODB_URI'],
    uriProd: process.env['MONGODB_URI_PROD'],
  },
  redis: {
    host:
      process.env['REDIS_HOST_INTERNAL'] ||
      process.env['REDIS_HOST'] ||
      (() => {
        // Try REDIS_PUBLIC_URL first (Railway proxy), then REDIS_URL (internal), then fallback
        if (process.env['REDIS_PUBLIC_URL']) {
          try {
            const url = new URL(process.env['REDIS_PUBLIC_URL']);
            return url.hostname;
          } catch (error) {
            // Fall through to REDIS_URL
          }
        }
        if (process.env['REDIS_URL']) {
          try {
            const url = new URL(process.env['REDIS_URL']);
            return url.hostname;
          } catch (error) {
            return 'localhost';
          }
        }
        return 'localhost';
      })(),
    port: parseInt(
      process.env['REDIS_PORT'] ||
        (() => {
          // Try REDIS_PUBLIC_URL first (Railway proxy), then REDIS_URL (internal), then fallback
          if (process.env['REDIS_PUBLIC_URL']) {
            try {
              const url = new URL(process.env['REDIS_PUBLIC_URL']);
              return url.port || '6379';
            } catch (error) {
              // Fall through to REDIS_URL
            }
          }
          if (process.env['REDIS_URL']) {
            try {
              const url = new URL(process.env['REDIS_URL']);
              return url.port || '6379';
            } catch (error) {
              return '6379';
            }
          }
          return '6379';
        })(),
      10
    ),
    password:
      process.env['REDIS_PASSWORD'] ||
      (() => {
        // Try REDIS_PUBLIC_URL first (Railway proxy), then REDIS_URL (internal), then fallback
        if (process.env['REDIS_PUBLIC_URL']) {
          try {
            const url = new URL(process.env['REDIS_PUBLIC_URL']);
            return url.password || '';
          } catch (error) {
            // Fall through to REDIS_URL
          }
        }
        if (process.env['REDIS_URL']) {
          try {
            const url = new URL(process.env['REDIS_URL']);
            return url.password || '';
          } catch (error) {
            return '';
          }
        }
        return '';
      })(),
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
    keepAlive: 30000,
  },
  cache: {
    clearOnDeploy: process.env['CLEAR_CACHE_ON_DEPLOY'] === 'true',
    clearOnStartup: process.env['CACHE_CLEAR_ON_STARTUP'] === 'true',
    clearPatterns: process.env['CACHE_CLEAR_PATTERNS']?.split(',') || [
      'user-sessions:*',
      'game-state:*',
      'ai:response:*',
    ],
    preservePatterns: process.env['CACHE_PRESERVE_PATTERNS']?.split(',') || [
      'mechanics:*',
      'templates:*',
      'system:*',
    ],
  },
  gemini: {
    apiKey: process.env['GEMINI_API_KEY'] || '',
    flashLiteModel: process.env['GEMINI_FLASH_LITE_MODEL'] || 'gemini-2.0-flash-lite',
    flashModel: process.env['GEMINI_FLASH_MODEL'] || 'gemini-2.5-flash',
    proModel: process.env['GEMINI_PRO_MODEL'] || 'gemini-2.5-pro',
    modelSelectionEnabled: process.env['MODEL_SELECTION_ENABLED'] === 'true',
    flashLiteQualityThreshold: parseFloat(process.env['FLASH_LITE_QUALITY_THRESHOLD'] || '0.6'),
    flashQualityThreshold: parseFloat(process.env['FLASH_QUALITY_THRESHOLD'] || '0.7'),
    proFallbackEnabled: process.env['PRO_FALLBACK_ENABLED'] === 'true',
    threeModelFallbackEnabled: process.env['THREE_MODEL_FALLBACK_ENABLED'] === 'true',
    flashLiteResponseTimeThreshold: parseInt(
      process.env['FLASH_LITE_RESPONSE_TIME_THRESHOLD'] || '3000',
      10
    ),
    flashResponseTimeThreshold: parseInt(
      process.env['FLASH_LITE_RESPONSE_TIME_THRESHOLD'] || '5000',
      10
    ),
    serviceUrl: process.env['LLM_SERVICE_URL'] || 'https://generativelanguage.googleapis.com',
    useMockService: process.env['MOCK_LLM_ENABLED'] === 'true',
  },
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'default-secret-change-in-production',
    corsOrigin:
      process.env['CORS_ORIGIN'] ||
      (() => {
        if (process.env['NODE_ENV'] === 'production') {
          return process.env['FRONTEND_URL'] || 'https://your-frontend-service.railway.app';
        }
        return 'http://localhost:3000';
      })(),
  },
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    file: process.env['LOG_FILE'] || 'logs/app.log',
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
  session: {
    secret: process.env['SESSION_SECRET'] || 'default-session-secret',
    maxAge: parseInt(process.env['SESSION_MAX_AGE'] || '86400000', 10),
  },
  ai: {
    maxContextLength: parseInt(process.env['MAX_CONTEXT_LENGTH'] || '8000', 10),
    contextCompressionThreshold: parseInt(
      process.env['CONTEXT_COMPRESSION_THRESHOLD'] || '6000',
      10
    ),
  },
};

export default config;
