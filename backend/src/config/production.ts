import { Config } from '../config';

export const productionConfig: Partial<Config> = {
  server: {
    port: parseInt(process.env['PORT'] || '3000', 10),
    nodeEnv: 'production',
  },
  mongodb: {
    uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/ai-dnd-game-prod',
    uriProd: process.env['MONGODB_URI_PROD'] || 'mongodb://localhost:27017/ai-dnd-game-prod',
  },
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'change-this-in-production',
    corsOrigin: process.env['FRONTEND_URL'] || 'https://yourdomain.com',
  },
  logging: {
    level: 'info',
    file: process.env['LOG_FILE'] || '/var/log/dnd-game/app.log',
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
  session: {
    secret: process.env['SESSION_SECRET'] || 'change-this-in-production',
    maxAge: parseInt(process.env['SESSION_MAX_AGE'] || '86400000', 10), // 24 hours
  },
  ai: {
    maxContextLength: parseInt(process.env['MAX_CONTEXT_LENGTH'] || '8000', 10),
    contextCompressionThreshold: parseInt(
      process.env['CONTEXT_COMPRESSION_THRESHOLD'] || '6000',
      10
    ),
  },
};

export default productionConfig;
