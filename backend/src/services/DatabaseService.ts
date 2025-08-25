import mongoose from 'mongoose';
import config from '../config';
import logger from './LoggerService';

interface DatabaseMetrics {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  maxPoolSize: number;
  activeConnections: number;
  lastHealthCheck: Date;
}

class DatabaseService {
  private static instance: DatabaseService;
  private isConnected = false;
  private metrics: DatabaseMetrics = {
    totalQueries: 0,
    slowQueries: 0,
    averageQueryTime: 0,
    maxPoolSize: 0,
    activeConnections: 0,
    lastHealthCheck: new Date(),
  };
  private queryTimes: number[] = [];
  private slowQueryThreshold = 100; // 100ms threshold for slow queries

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const uri =
        config.server.nodeEnv === 'production' ? config.mongodb.uriProd : config.mongodb.uri;

      // Enhanced connection options for better performance
      await mongoose.connect(uri, {
        maxPoolSize: 20, // Increased from 10 for better concurrency
        minPoolSize: 5, // Maintain minimum connections
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        // Performance optimizations
        maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
        compressors: ['zlib'], // Enable compression
        retryWrites: true, // Enable retry for write operations
        w: 'majority', // Write concern for better reliability
        // Connection pool optimizations
        keepAliveInitialDelay: 300000, // 5 minutes
      });

      this.isConnected = true;
      this.metrics.maxPoolSize = 20;
      logger.info('Successfully connected to MongoDB with performance optimizations');

      // Enhanced connection event handling
      mongoose.connection.on('error', error => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      // Monitor connection pool
      mongoose.connection.on('connected', () => {
        this.updateConnectionMetrics();
        logger.info('MongoDB connection established');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        // Graceful shutdown completed
      });

      // Set up performance monitoring
      this.setupPerformanceMonitoring();
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public isDatabaseConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      // Enhanced health check with performance metrics
      const startTime = Date.now();
      const db = mongoose.connection.db;
      if (db) {
        await db.admin().ping();
        const healthCheckTime = Date.now() - startTime;

        // Update metrics
        this.metrics.lastHealthCheck = new Date();
        this.updateConnectionMetrics();

        // Log slow health checks
        if (healthCheckTime > this.slowQueryThreshold) {
          logger.warn(`Slow health check: ${healthCheckTime}ms`);
        }

        return true;
      }
      return false;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Track query performance
   */
  public trackQuery(queryTime: number): void {
    this.metrics.totalQueries++;
    this.queryTimes.push(queryTime);

    if (queryTime > this.slowQueryThreshold) {
      this.metrics.slowQueries++;
      logger.warn(`Slow query detected: ${queryTime}ms`);
    }

    // Keep only last 1000 query times for memory efficiency
    if (this.queryTimes.length > 1000) {
      this.queryTimes.shift();
    }

    // Update average query time
    this.metrics.averageQueryTime =
      this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length;
  }

  /**
   * Get database performance metrics
   */
  public getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  /**
   * Get query performance statistics
   */
  public getQueryStats(): {
    totalQueries: number;
    slowQueries: number;
    averageQueryTime: number;
    slowQueryPercentage: number;
    p95QueryTime: number;
    p99QueryTime: number;
  } {
    const sortedTimes = [...this.queryTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    return {
      totalQueries: this.metrics.totalQueries,
      slowQueries: this.metrics.slowQueries,
      averageQueryTime: this.metrics.averageQueryTime,
      slowQueryPercentage: (this.metrics.slowQueries / this.metrics.totalQueries) * 100,
      p95QueryTime: sortedTimes[p95Index] || 0,
      p99QueryTime: sortedTimes[p99Index] || 0,
    };
  }

  /**
   * Clear performance metrics
   */
  public clearMetrics(): void {
    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      maxPoolSize: this.metrics.maxPoolSize,
      activeConnections: this.metrics.activeConnections,
      lastHealthCheck: new Date(),
    };
    this.queryTimes = [];
    logger.info('Database performance metrics cleared');
  }

  /**
   * Set slow query threshold
   */
  public setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    logger.info(`Slow query threshold set to ${threshold}ms`);
  }

  /**
   * Get connection pool status
   */
  public getConnectionPoolStatus(): {
    maxPoolSize: number;
    activeConnections: number;
    availableConnections: number;
    pendingConnections: number;
  } {
    return {
      maxPoolSize: this.metrics.maxPoolSize,
      activeConnections: this.metrics.activeConnections,
      availableConnections: this.metrics.maxPoolSize - this.metrics.activeConnections,
      pendingConnections: 0, // Mongoose doesn't expose this directly
    };
  }

  /**
   * Update connection metrics
   */
  private updateConnectionMetrics(): void {
    this.metrics.maxPoolSize = 20; // Set from connection options
    this.metrics.activeConnections = 0; // Mongoose doesn't expose active connections directly
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor connection pool events
    mongoose.connection.on('connected', () => {
      this.updateConnectionMetrics();
    });

    // Set up periodic metrics logging
    setInterval(() => {
      if (this.isConnected) {
        const stats = this.getQueryStats();
        if (stats.totalQueries > 0) {
          logger.info('Database Performance Stats', {
            totalQueries: stats.totalQueries,
            slowQueries: stats.slowQueries,
            averageQueryTime: `${stats.averageQueryTime.toFixed(2)}ms`,
            slowQueryPercentage: `${stats.slowQueryPercentage.toFixed(2)}%`,
            p95QueryTime: `${stats.p95QueryTime}ms`,
            p99QueryTime: `${stats.p99QueryTime}ms`,
          });
        }
      }
    }, 60000); // Log every minute
  }

  /**
   * Create database indexes for common queries
   */
  public async createIndexes(): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('Cannot create indexes: database not connected');
        return;
      }

      const db = mongoose.connection.db;
      if (!db) {
        logger.warn('Database instance not available for index creation');
        return;
      }

      // Create indexes for common query patterns
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        const collectionName = collection.name;

        // Create indexes based on collection type
        switch (collectionName) {
          case 'sessions':
            await db.collection(collectionName).createIndex({ campaignId: 1 });
            await db.collection(collectionName).createIndex({ startTime: -1 });
            await db.collection(collectionName).createIndex({ dm: 1 });
            await db.collection(collectionName).createIndex({ tags: 1 });
            break;
          case 'characters':
            await db.collection(collectionName).createIndex({ campaignId: 1 });
            await db.collection(collectionName).createIndex({ playerId: 1 });
            await db.collection(collectionName).createIndex({ level: 1 });
            break;
          case 'campaigns':
            await db.collection(collectionName).createIndex({ dmId: 1 });
            await db.collection(collectionName).createIndex({ status: 1 });
            break;
        }
      }

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes:', error);
    }
  }
}

export default DatabaseService;
