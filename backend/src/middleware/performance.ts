import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { performance } from 'perf_hooks';
import DatabaseService from '../services/DatabaseService';

/**
 * Performance monitoring interface
 */
interface PerformanceData {
  endpoint: string;
  method: string;
  responseTime: number;
  timestamp: Date;
  statusCode: number;
  userAgent?: string;
  ip?: string;
}

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceData[] = [];
  private slowEndpointThreshold = 1000; // 1 second threshold
  private maxMetrics = 1000; // Keep last 1000 requests

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track API performance
   */
  public trackPerformance(data: PerformanceData): void {
    this.metrics.push(data);

    // Keep only last N metrics for memory efficiency
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow endpoints
    if (data.responseTime > this.slowEndpointThreshold) {
      console.warn(
        `Slow endpoint detected: ${data.method} ${data.endpoint} - ${data.responseTime}ms`
      );
    }
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    totalRequests: number;
    averageResponseTime: number;
    slowEndpoints: number;
    endpointBreakdown: Record<string, { count: number; avgTime: number }>;
    recentSlowEndpoints: PerformanceData[];
  } {
    const totalRequests = this.metrics.length;
    const totalTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = totalRequests > 0 ? totalTime / totalRequests : 0;
    const slowEndpoints = this.metrics.filter(
      m => m.responseTime > this.slowEndpointThreshold
    ).length;

    // Endpoint breakdown
    const endpointBreakdown: Record<string, { count: number; avgTime: number }> = {};
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointBreakdown[key]) {
        endpointBreakdown[key] = { count: 0, avgTime: 0 };
      }
      endpointBreakdown[key].count++;
      endpointBreakdown[key].avgTime = (endpointBreakdown[key].avgTime + metric.responseTime) / 2;
    });

    // Recent slow endpoints
    const recentSlowEndpoints = this.metrics
      .filter(m => m.responseTime > this.slowEndpointThreshold)
      .slice(-10); // Last 10 slow endpoints

    return {
      totalRequests,
      averageResponseTime,
      slowEndpoints,
      endpointBreakdown,
      recentSlowEndpoints,
    };
  }

  /**
   * Clear performance metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Set slow endpoint threshold
   */
  public setSlowEndpointThreshold(threshold: number): void {
    this.slowEndpointThreshold = threshold;
  }
}

// Create singleton instance
const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Response compression middleware
 */
export const compressionMiddleware = compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other responses
    return compression.filter(req, res);
  },
});

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom key generator for better rate limiting
  keyGenerator: req => {
    // Use IP address or user ID if available
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    return Array.isArray(ip) ? ip[0] : ip;
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60), // 15 minutes in seconds
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = performance.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response time
  res.end = function (chunk?: any, encoding?: any): Response {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Track performance metrics
    performanceMonitor.trackPerformance({
      endpoint: req.path,
      method: req.method,
      responseTime,
      timestamp: new Date(),
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.get('x-forwarded-for') || req.connection.remoteAddress,
    });

    // Track database query performance if available
    try {
      const dbService = DatabaseService.getInstance();
      if (dbService.isDatabaseConnected()) {
        dbService.trackQuery(responseTime);
      }
    } catch (error) {
      // Ignore errors in performance tracking
    }

    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
    res.setHeader('X-Performance-Monitor', 'enabled');

    // Call original end function
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Request timing middleware
 */
export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    // Add timing header
    res.setHeader('X-Request-Duration', `${duration.toFixed(2)}ms`);

    // Log slow requests
    if (duration > 1000) {
      // 1 second threshold
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

/**
 * Memory usage monitoring middleware
 */
export const memoryMonitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    // Log significant memory usage
    if (Math.abs(memoryDiff.heapUsed) > 1024 * 1024) {
      // 1MB threshold
      console.info(`Memory usage for ${req.method} ${req.path}:`, {
        heapUsed: `${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        rss: `${(memoryDiff.rss / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  });

  next();
};

/**
 * API response optimization middleware
 */
export const responseOptimizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add cache control headers for static resources
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
  }

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Enable CORS for API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
};

/**
 * Background job processing middleware
 */
export const backgroundJobMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // For long-running operations, process in background
  if (req.path.includes('/api/analytics') || req.path.includes('/api/reports')) {
    // Set appropriate headers for background processing
    res.setHeader('X-Background-Processing', 'enabled');
    res.setHeader('X-Expected-Duration', '5-10 seconds');
  }

  next();
};

/**
 * Get performance statistics endpoint
 */
export const getPerformanceStats = (req: Request, res: Response): void => {
  try {
    const stats = performanceMonitor.getStats();
    const dbService = DatabaseService.getInstance();

    res.json({
      api: stats,
      database: dbService.isDatabaseConnected() ? dbService.getQueryStats() : null,
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get performance statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Clear performance metrics endpoint
 */
export const clearPerformanceMetrics = (req: Request, res: Response): void => {
  try {
    performanceMonitor.clearMetrics();

    const dbService = DatabaseService.getInstance();
    if (dbService.isDatabaseConnected()) {
      dbService.clearMetrics();
    }

    res.json({
      message: 'Performance metrics cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default {
  compressionMiddleware,
  rateLimitMiddleware,
  performanceMiddleware,
  requestTimingMiddleware,
  memoryMonitoringMiddleware,
  responseOptimizationMiddleware,
  backgroundJobMiddleware,
  getPerformanceStats,
  clearPerformanceMetrics,
};
