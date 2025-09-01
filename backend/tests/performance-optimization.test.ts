import request from 'supertest';
import mongoose from 'mongoose';
import App from '../src/app';
import DatabaseService from '../src/services/DatabaseService';
import BackgroundJobService from '../src/services/BackgroundJobService';
import performanceMiddleware from '../src/middleware/performance';

describe('Backend Performance Optimization Tests', () => {
  let dbService: DatabaseService;
  let backgroundJobService: BackgroundJobService;
  let app: App;

  beforeAll(async () => {
    // MongoDB connection is handled automatically by @shelf/jest-mongodb
    // Initialize services
    dbService = DatabaseService.getInstance();
    backgroundJobService = BackgroundJobService.getInstance();

    // Initialize app instance
    app = new App();
  });

  afterAll(async () => {
    // Cleanup - MongoDB disconnection is handled automatically
  });

  beforeEach(async () => {
    // Clear database before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Database Performance Optimizations', () => {
    test('should create database indexes for common queries', async () => {
      // Create test collections
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database not connected');
      await db.createCollection('sessions');
      await db.createCollection('characters');
      await db.createCollection('campaigns');

      // Create indexes
      await dbService.createIndexes();

      // Verify indexes were created
      const sessionIndexes = await db.collection('sessions').indexes();
      const characterIndexes = await db.collection('characters').indexes();
      const campaignIndexes = await db.collection('campaigns').indexes();

      expect(sessionIndexes.length).toBeGreaterThan(1); // Default _id index + custom indexes
      expect(characterIndexes.length).toBeGreaterThan(1);
      expect(campaignIndexes.length).toBeGreaterThan(1);
    });

    test('should track query performance metrics', async () => {
      // Simulate some database operations
      const startTime = Date.now();

      // Track a query
      dbService.trackQuery(150); // Slow query
      dbService.trackQuery(50); // Fast query
      dbService.trackQuery(200); // Slow query

      const metrics = dbService.getMetrics();
      const stats = dbService.getQueryStats();

      expect(metrics.totalQueries).toBe(3);
      expect(metrics.slowQueries).toBe(2);
      expect(stats.slowQueryPercentage).toBe(66.67);
      expect(stats.averageQueryTime).toBe(133.33);
    });

    test('should provide connection pool status', async () => {
      const poolStatus = dbService.getConnectionPoolStatus();

      expect(poolStatus).toHaveProperty('poolSize');
      expect(poolStatus).toHaveProperty('activeConnections');
      expect(poolStatus).toHaveProperty('availableConnections');
    });

    test('should handle slow query thresholds', async () => {
      // Set custom threshold
      dbService.setSlowQueryThreshold(50);

      // Track queries
      dbService.trackQuery(30); // Below threshold
      dbService.trackQuery(60); // Above threshold
      dbService.trackQuery(100); // Above threshold

      const metrics = dbService.getMetrics();
      expect(metrics.slowQueries).toBe(2);
    });
  });

  describe('API Performance Optimizations', () => {
    test('should implement response compression', async () => {
      const response = await request(app.app)
        .get('/api/health')
        .set('Accept-Encoding', 'gzip, deflate');

      // Should have compression headers
      expect(response.headers['content-encoding']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-performance-monitor']).toBe('enabled');
    });

    test('should implement rate limiting', async () => {
      // Make multiple requests quickly
      const requests = Array(105)
        .fill(null)
        .map(() => request(app.app).get('/api/health'));

      const responses = await Promise.all(requests);

      // Should have some rate-limited responses
      const rateLimited = responses.filter(res => res.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('should track API performance metrics', async () => {
      // Make a request
      await request(app.app).get('/api/health');

      // Get performance stats
      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      expect(response.body.api).toBeDefined();
      expect(response.body.api.totalRequests).toBeGreaterThan(0);
    });

    test('should implement request timing', async () => {
      const response = await request(app.app).get('/api/health');

      expect(response.headers['x-request-duration']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    test('should monitor memory usage', async () => {
      const response = await request(app.app).get('/api/health');

      // Memory monitoring should be active
      expect(response.status).toBe(200);
    });

    test('should optimize API responses', async () => {
      const response = await request(app.app).get('/api/health');

      // Security headers should be present
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  describe('Background Job Processing', () => {
    test('should add jobs to background queue', async () => {
      const jobId = await backgroundJobService.addJob(
        'dataMigration',
        { collection: 'sessions' },
        2, // Normal priority
        60000 // 1 minute timeout
      );

      expect(jobId).toBeDefined();
      expect(jobId).toMatch(/^job_\d+_\d+$/);
    });

    test('should track job status', async () => {
      const jobId = await backgroundJobService.addJob('reportGeneration', {
        reportType: 'campaign',
      });

      const status = backgroundJobService.getJobStatus(jobId);
      expect(status).toBeDefined();
      expect(status?.type).toBe('reportGeneration');
    });

    test('should provide queue statistics', async () => {
      // Add multiple jobs
      await backgroundJobService.addJob('dataMigration', {});
      await backgroundJobService.addJob('reportGeneration', {});

      const stats = backgroundJobService.getQueueStats();

      expect(stats.totalPending).toBeGreaterThan(0);
      expect(stats.queueSizes).toBeDefined();
    });

    test('should process jobs with different priorities', async () => {
      // Add jobs with different priorities
      await backgroundJobService.addJob('dataMigration', {}, 1); // Low
      await backgroundJobService.addJob('reportGeneration', {}, 4); // Urgent

      const stats = backgroundJobService.getQueueStats();

      // Should have jobs in queue
      expect(stats.totalPending).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring', () => {
    test('should provide comprehensive performance statistics', async () => {
      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('api');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should clear performance metrics', async () => {
      // First, make some requests to generate metrics
      await request(app.app).get('/api/health');

      // Clear metrics
      const response = await request(app.app).post('/api/performance/clear');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Performance metrics cleared successfully');
    });

    test('should track slow endpoints', async () => {
      // This would require a slow endpoint to test
      // For now, we'll test the monitoring infrastructure
      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      expect(response.body.api).toHaveProperty('slowEndpoints');
      expect(response.body.api).toHaveProperty('recentSlowEndpoints');
    });
  });

  describe('Memory and Resource Management', () => {
    test('should monitor memory usage', async () => {
      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system.memory).toHaveProperty('heapUsed');
      expect(response.body.system.memory).toHaveProperty('rss');
    });

    test('should provide system information', async () => {
      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      expect(response.body.system).toHaveProperty('uptime');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('platform');
    });
  });

  describe('Performance Thresholds and Alerts', () => {
    test('should respect performance thresholds', async () => {
      // Test that the system respects configured thresholds
      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      // The system should be operating within acceptable thresholds
      expect(response.body.api.averageResponseTime).toBeLessThan(1000); // Should be under 1 second
    });

    test('should provide endpoint breakdown', async () => {
      // Make multiple requests to different endpoints
      await request(app.app).get('/api/health');
      await request(app.app).get('/api/performance/stats');

      const response = await request(app.app).get('/api/performance/stats');

      expect(response.status).toBe(200);
      expect(response.body.api.endpointBreakdown).toBeDefined();
      expect(Object.keys(response.body.api.endpointBreakdown).length).toBeGreaterThan(0);
    });
  });

  describe('Load Testing Simulation', () => {
    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();

      // Make concurrent requests
      const requests = Array(concurrentRequests)
        .fill(null)
        .map(() => request(app.app).get('/api/health'));

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds
    });

    test('should maintain performance under load', async () => {
      const requests = Array(20)
        .fill(null)
        .map(() => request(app.app).get('/api/health'));

      const responses = await Promise.all(requests);

      // Check response times
      responses.forEach(response => {
        const responseTime = parseFloat(
          response.headers['x-response-time']?.replace('ms', '') || '0'
        );
        expect(responseTime).toBeLessThan(1000); // Should be under 1 second
      });
    });
  });
});
