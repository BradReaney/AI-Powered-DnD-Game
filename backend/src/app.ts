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
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.nodeEnv,
      });
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

      // Start server
      this.server.listen(config.server.port, () => {
        logger.info(`Server started on port ${config.server.port}`);
        logger.info(`Environment: ${config.server.nodeEnv}`);
        logger.info(`Health check: http://localhost:${config.server.port}/health`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down server...');

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
