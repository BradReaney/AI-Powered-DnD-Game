import { Request, Response, NextFunction } from 'express';
import logger from '../services/LoggerService';

export interface PerformanceMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000; // Keep last 1000 requests
  private slowRequestThreshold: number = 1000; // 1 second
  private errorThreshold: number = 500; // 500ms for error requests

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Middleware to monitor request performance
   */
  public monitor() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const originalSend = res.send;

      // Override res.send to capture response time
      res.send = function (body: any) {
        const duration = Date.now() - start;
        const metrics: PerformanceMetrics = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date(),
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        };

        PerformanceMonitor.getInstance().addMetric(metrics);
        PerformanceMonitor.getInstance().checkPerformance(metrics);

        return originalSend.call(this, body);
      };

      next();
    };
  }

  /**
   * Add performance metric
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Check if request performance meets thresholds
   */
  private checkPerformance(metric: PerformanceMetrics): void {
    // Log slow requests
    if (metric.duration > this.slowRequestThreshold) {
      logger.warn(
        `Slow request detected: ${metric.method} ${metric.path} took ${metric.duration}ms`,
        {
          method: metric.method,
          path: metric.path,
          duration: metric.duration,
          statusCode: metric.statusCode,
          userAgent: metric.userAgent,
          ip: metric.ip,
        }
      );
    }

    // Log error requests that are also slow
    if (metric.statusCode >= 400 && metric.duration > this.errorThreshold) {
      logger.error(
        `Slow error request: ${metric.method} ${metric.path} took ${metric.duration}ms`,
        {
          method: metric.method,
          path: metric.path,
          duration: metric.duration,
          statusCode: metric.statusCode,
          userAgent: metric.userAgent,
          ip: metric.ip,
        }
      );
    }
  }

  /**
   * Get performance statistics
   */
  public getStats(): {
    totalRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRequests: number;
    requestsByMethod: { [key: string]: number };
    requestsByPath: { [key: string]: number };
    recentMetrics: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRequests: 0,
        requestsByMethod: {},
        requestsByPath: {},
        recentMetrics: [],
      };
    }

    const totalRequests = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalDuration / totalRequests;

    const slowRequests = this.metrics.filter(m => m.duration > this.slowRequestThreshold).length;
    const errorRequests = this.metrics.filter(m => m.statusCode >= 400).length;

    // Group by method
    const requestsByMethod: { [key: string]: number } = {};
    this.metrics.forEach(m => {
      requestsByMethod[m.method] = (requestsByMethod[m.method] || 0) + 1;
    });

    // Group by path
    const requestsByPath: { [key: string]: number } = {};
    this.metrics.forEach(m => {
      requestsByPath[m.path] = (requestsByPath[m.path] || 0) + 1;
    });

    // Get recent metrics (last 100)
    const recentMetrics = this.metrics.slice(-100);

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      errorRequests,
      requestsByMethod,
      requestsByPath,
      recentMetrics,
    };
  }

  /**
   * Get performance metrics for specific path
   */
  public getPathMetrics(path: string): {
    totalRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRequests: number;
    recentRequests: PerformanceMetrics[];
  } {
    const pathMetrics = this.metrics.filter(m => m.path === path);

    if (pathMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRequests: 0,
        recentRequests: [],
      };
    }

    const totalRequests = pathMetrics.length;
    const totalDuration = pathMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalDuration / totalRequests;

    const slowRequests = pathMetrics.filter(m => m.duration > this.slowRequestThreshold).length;
    const errorRequests = pathMetrics.filter(m => m.statusCode >= 400).length;

    // Get recent requests for this path (last 50)
    const recentRequests = pathMetrics.slice(-50);

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      errorRequests,
      recentRequests,
    };
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    logger.info('Performance metrics cleared');
  }

  /**
   * Set slow request threshold
   */
  public setSlowRequestThreshold(threshold: number): void {
    this.slowRequestThreshold = threshold;
    logger.info(`Slow request threshold set to ${threshold}ms`);
  }

  /**
   * Set error request threshold
   */
  public setErrorThreshold(threshold: number): void {
    this.errorThreshold = threshold;
    logger.info(`Error request threshold set to ${threshold}ms`);
  }
}

export default PerformanceMonitor;
