import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { createServer } from 'http';
import { Server } from 'socket.io';

import config from './config';
import logger from './services/LoggerService';
import DatabaseService from './services/DatabaseService';
import { cacheService } from './services/CacheService';
import SessionCleanupScheduler from './services/SessionCleanupScheduler';

// Import routes
import campaignRoutes from './routes/campaigns';
import characterRoutes from './routes/characters';
import sessionRoutes from './routes/sessions';
import gameplayRoutes from './routes/gameplay';
import characterDevelopmentRoutes from './routes/character-development';
import combatRoutes from './routes/combat';
import campaignThemesRoutes from './routes/campaign-themes';
import aiAnalyticsRoutes from './routes/ai-analytics';
import questRoutes from './routes/quests';
import locationRoutes from './routes/locations';
import campaignSettingsRoutes from './routes/campaign-settings';

class App {
  public app: express.Application;
  public server: any;
  public io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.security.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: config.security.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: '*',
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined'));

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Root endpoint for Railway health checks
    this.app.get('/', (_req, res) => {
      res.status(200).json({
        message: 'AI-Powered D&D Game Backend API',
        status: 'running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.nodeEnv,
        version: '1.0.0',
        endpoints: {
          health: '/health',
          campaigns: '/api/campaigns',
          characters: '/api/characters',
          sessions: '/api/sessions',
          gameplay: '/api/gameplay',
          combat: '/api/combat',
          quests: '/api/quests',
          locations: '/api/locations',
        },
      });
    });

    // Health check endpoint
    this.app.get('/health', async (_req, res) => {
      try {
        // Check database health
        const dbHealthy = await DatabaseService.getInstance().healthCheck();

        // Check Redis health
        const redisHealthy = await cacheService.healthCheck();

        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: config.server.nodeEnv,
          services: {
            database: dbHealthy ? 'healthy' : 'unhealthy',
            redis: redisHealthy ? 'healthy' : 'unhealthy',
          },
        });
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: 'Health check failed',
        });
      }
    });

    // Redis health check endpoint
    this.app.get('/health/redis', async (_req, res) => {
      try {
        const healthy = await cacheService.healthCheck();
        const stats = await cacheService.getStats();

        res.status(200).json({
          status: healthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          redis: {
            connected: healthy,
            stats: stats,
          },
        });
      } catch (error) {
        logger.error('Redis health check failed:', error);
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: 'Redis health check failed',
        });
      }
    });

    // Cache management endpoints
    this.app.get('/api/cache/stats', async (_req, res) => {
      try {
        const stats = await cacheService.getStats();
        res.status(200).json({
          status: 'success',
          data: stats,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to get cache stats:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to get cache stats',
        });
      }
    });

    this.app.post('/api/cache/clear', async (_req, res) => {
      try {
        await cacheService.clearAll();
        res.status(200).json({
          status: 'success',
          message: 'All cache cleared successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to clear cache:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to clear cache',
        });
      }
    });

    this.app.post('/api/cache/warm', async (_req, res) => {
      try {
        await cacheService.warmCache();
        res.status(200).json({
          status: 'success',
          message: 'Cache warming completed successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to warm cache:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to warm cache',
        });
      }
    });

    // Deployment-triggered cache clearing endpoint
    this.app.post('/api/cache/clear-deploy', async (_req, res) => {
      try {
        await cacheService.clearCacheOnDeploy();
        res.status(200).json({
          status: 'success',
          message: 'Deployment cache clearing completed successfully',
          timestamp: new Date().toISOString(),
          config: {
            clearOnDeploy: config.cache.clearOnDeploy,
            clearPatterns: config.cache.clearPatterns,
            preservePatterns: config.cache.preservePatterns,
          },
        });
      } catch (error) {
        logger.error('Failed to clear cache on deploy:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to clear cache on deploy',
        });
      }
    });

    // Startup-triggered cache clearing endpoint
    this.app.post('/api/cache/clear-startup', async (_req, res) => {
      try {
        await cacheService.clearCacheOnStartup();
        res.status(200).json({
          status: 'success',
          message: 'Startup cache clearing completed successfully',
          timestamp: new Date().toISOString(),
          config: {
            clearOnStartup: config.cache.clearOnStartup,
            clearPatterns: config.cache.clearPatterns,
            preservePatterns: config.cache.preservePatterns,
          },
        });
      } catch (error) {
        logger.error('Failed to clear cache on startup:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to clear cache on startup',
        });
      }
    });

    // Cache performance monitoring endpoint
    this.app.get('/api/cache/performance', async (_req, res) => {
      try {
        const stats = await cacheService.getStats();
        const health = await cacheService.healthCheck();

        res.status(200).json({
          status: 'success',
          data: {
            health: health ? 'healthy' : 'unhealthy',
            stats: stats,
            performance: {
              hitRate: stats.hitRate,
              efficiency: stats.hitRate > 80 ? 'excellent' : stats.hitRate > 60 ? 'good' : 'poor',
              recommendations: this.getCacheRecommendations(stats),
            },
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to get cache performance:', error);
        res.status(500).json({
          status: 'error',
          error: 'Failed to get cache performance',
        });
      }
    });

    // Register routes
    this.app.use('/api/campaigns', campaignRoutes);
    this.app.use('/api/characters', characterRoutes);
    this.app.use('/api/sessions', sessionRoutes);
    this.app.use('/api/gameplay', gameplayRoutes);
    this.app.use('/api/character-development', characterDevelopmentRoutes);
    this.app.use('/api/combat', combatRoutes);
    this.app.use('/api/campaign-themes', campaignThemesRoutes);
    this.app.use('/api/ai-analytics', aiAnalyticsRoutes);
    this.app.use('/api/quests', questRoutes);
    this.app.use('/api/locations', locationRoutes);
    this.app.use('/api/campaign-settings', campaignSettingsRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
      });
    });
  }

  // Helper method for cache recommendations
  private getCacheRecommendations(stats: any): string[] {
    const recommendations = [];

    if (stats.hitRate < 50) {
      recommendations.push('Consider increasing cache TTL for frequently accessed data');
      recommendations.push('Review cache invalidation strategies');
    }

    if (stats.hitRate < 30) {
      recommendations.push('Cache warming may be needed');
      recommendations.push('Consider adding more data to cache');
    }

    if (stats.memory > 100 * 1024 * 1024) {
      // 100MB
      recommendations.push('Monitor memory usage - consider compression for large objects');
    }

    if (stats.keys > 1000) {
      recommendations.push('Consider implementing cache eviction policies');
    }

    return recommendations;
  }

  private initializeSocketIO(): void {
    // Initialize GameEngineService with Socket.IO instance
    const { initializeGameEngineService } = require('./routes/sessions');
    initializeGameEngineService(this.io);

    this.io.on('connection', socket => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('join-campaign', (campaignId: string) => {
        socket.join(`campaign-${campaignId}`);
        logger.info(`Client ${socket.id} joined campaign ${campaignId}`);
      });

      socket.on('leave-campaign', (campaignId: string) => {
        socket.leave(`campaign-${campaignId}`);
        logger.info(`Client ${socket.id} left campaign ${campaignId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(
      (error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
        logger.error('Unhandled error:', error);

        const status = error.status || 500;
        const message = error.message || 'Internal server error';

        res.status(status).json({
          error: {
            message,
            status,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
          },
        });
      }
    );

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await DatabaseService.getInstance().connect();
      logger.info('Database connected successfully');

      // Initialize cache service
      try {
        await cacheService.healthCheck();
        logger.info('Redis cache service connected successfully');

        // Clear cache on deployment if configured
        if (config.cache.clearOnDeploy) {
          await cacheService.clearCacheOnDeploy();
        }

        // Clear cache on startup if configured
        if (config.cache.clearOnStartup) {
          await cacheService.clearCacheOnStartup();
        }

        // Warm up cache
        await cacheService.warmCache();
        logger.info('Cache warming completed');
      } catch (error) {
        logger.warn('Redis cache service not available, continuing without caching:', error);
      }

      // Initialize and start session cleanup scheduler
      try {
        const sessionCleanupScheduler = SessionCleanupScheduler.getInstance();
        sessionCleanupScheduler.start();
        logger.info('Session cleanup scheduler started successfully');
      } catch (error) {
        logger.warn(
          'Session cleanup scheduler not available, continuing without automatic cleanup:',
          error
        );
      }

      // Start server
      this.server.listen(config.server.port, () => {
        logger.info(`Server started on port ${config.server.port}`);
        logger.info(`Environment: ${config.server.nodeEnv}`);
        logger.info(`Health check: http://localhost:${config.server.port}/health`);
        logger.info(`Redis health check: http://localhost:${config.server.port}/health/redis`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down server...');

      // Close cache service
      try {
        await cacheService.shutdown();
        logger.info('Cache service shutdown complete');
      } catch (error) {
        logger.error('Cache service shutdown failed:', error);
      }

      // Stop session cleanup scheduler
      try {
        const sessionCleanupScheduler = SessionCleanupScheduler.getInstance();
        sessionCleanupScheduler.destroy();
        logger.info('Session cleanup scheduler shutdown complete');
      } catch (error) {
        logger.error('Session cleanup scheduler shutdown failed:', error);
      }

      // Close database connection
      await DatabaseService.getInstance().disconnect();

      // Close server
      this.server.close(() => {
        logger.info('Server closed');
        // Graceful shutdown completed
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        // Force shutdown completed
      }, 10000);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      // Error during shutdown
    }
  }
}

export default App;
