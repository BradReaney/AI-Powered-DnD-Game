/**
 * Performance configuration settings
 */

export interface PerformanceConfig {
  database: {
    slowQueryThreshold: number;
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    keepAlive: boolean;
    keepAliveInitialDelay: number;
    compression: boolean;
    retryWrites: boolean;
    writeConcern: string;
  };
  api: {
    slowEndpointThreshold: number;
    maxConcurrentJobs: number;
    rateLimitWindowMs: number;
    rateLimitMax: number;
    compressionLevel: number;
    compressionThreshold: number;
    enableCaching: boolean;
    cacheTTL: number;
  };
  monitoring: {
    enablePerformanceMonitoring: boolean;
    enableMemoryMonitoring: boolean;
    enableQueryMonitoring: boolean;
    metricsRetentionPeriod: number;
    logSlowQueries: boolean;
    logSlowEndpoints: boolean;
    performanceAlertThreshold: number;
  };
  optimization: {
    enableBackgroundJobs: boolean;
    enableRequestQueuing: boolean;
    enableResponseCompression: boolean;
    enableCaching: boolean;
    enableIndexing: boolean;
    enableConnectionPooling: boolean;
  };
}

/**
 * Default performance configuration
 */
export const defaultPerformanceConfig: PerformanceConfig = {
  database: {
    slowQueryThreshold: 100, // 100ms
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000, // 30 seconds
    keepAlive: true,
    keepAliveInitialDelay: 300000, // 5 minutes
    compression: true,
    retryWrites: true,
    writeConcern: 'majority',
  },
  api: {
    slowEndpointThreshold: 1000, // 1 second
    maxConcurrentJobs: 5,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    compressionLevel: 6,
    compressionThreshold: 1024, // 1KB
    enableCaching: true,
    cacheTTL: 300000, // 5 minutes
  },
  monitoring: {
    enablePerformanceMonitoring: true,
    enableMemoryMonitoring: true,
    enableQueryMonitoring: true,
    metricsRetentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    logSlowQueries: true,
    logSlowEndpoints: true,
    performanceAlertThreshold: 2000, // 2 seconds
  },
  optimization: {
    enableBackgroundJobs: true,
    enableRequestQueuing: true,
    enableResponseCompression: true,
    enableCaching: true,
    enableIndexing: true,
    enableConnectionPooling: true,
  },
};

/**
 * Production performance configuration
 */
export const productionPerformanceConfig: PerformanceConfig = {
  ...defaultPerformanceConfig,
  database: {
    ...defaultPerformanceConfig.database,
    maxPoolSize: 50,
    minPoolSize: 10,
    slowQueryThreshold: 50, // Stricter threshold for production
  },
  api: {
    ...defaultPerformanceConfig.api,
    slowEndpointThreshold: 500, // Stricter threshold for production
    maxConcurrentJobs: 10,
    rateLimitMax: 200,
  },
  monitoring: {
    ...defaultPerformanceConfig.monitoring,
    performanceAlertThreshold: 1000, // Stricter threshold for production
  },
};

/**
 * Development performance configuration
 */
export const developmentPerformanceConfig: PerformanceConfig = {
  ...defaultPerformanceConfig,
  database: {
    ...defaultPerformanceConfig.database,
    maxPoolSize: 10,
    minPoolSize: 2,
    slowQueryThreshold: 200, // More lenient for development
  },
  api: {
    ...defaultPerformanceConfig.api,
    slowEndpointThreshold: 2000, // More lenient for development
    maxConcurrentJobs: 3,
    rateLimitMax: 50,
  },
  monitoring: {
    ...defaultPerformanceConfig.monitoring,
    performanceAlertThreshold: 5000, // More lenient for development
  },
};

/**
 * Get performance configuration based on environment
 */
export function getPerformanceConfig(environment: string = 'development'): PerformanceConfig {
  switch (environment.toLowerCase()) {
    case 'production':
      return productionPerformanceConfig;
    case 'development':
      return developmentPerformanceConfig;
    default:
      return defaultPerformanceConfig;
  }
}

/**
 * Performance thresholds for different operations
 */
export const PerformanceThresholds = {
  // Database operations
  DATABASE: {
    SLOW_QUERY: 100, // 100ms
    VERY_SLOW_QUERY: 500, // 500ms
    CRITICAL_QUERY: 1000, // 1 second
  },

  // API endpoints
  API: {
    SLOW_ENDPOINT: 1000, // 1 second
    VERY_SLOW_ENDPOINT: 3000, // 3 seconds
    CRITICAL_ENDPOINT: 5000, // 5 seconds
  },

  // Memory usage
  MEMORY: {
    HIGH_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB
    CRITICAL_MEMORY_USAGE: 500 * 1024 * 1024, // 500MB
  },

  // CPU usage
  CPU: {
    HIGH_CPU_USAGE: 80, // 80%
    CRITICAL_CPU_USAGE: 95, // 95%
  },
};

/**
 * Performance optimization strategies
 */
export const OptimizationStrategies = {
  // Database optimization
  DATABASE: {
    INDEX_CREATION: 'Create indexes for frequently queried fields',
    QUERY_OPTIMIZATION: 'Optimize database queries and use aggregation pipelines',
    CONNECTION_POOLING: 'Use connection pooling to reduce connection overhead',
    COMPRESSION: 'Enable data compression for network transfers',
    CACHING: 'Implement query result caching for frequently accessed data',
  },

  // API optimization
  API: {
    RESPONSE_COMPRESSION: 'Compress API responses to reduce bandwidth',
    RATE_LIMITING: 'Implement rate limiting to prevent abuse',
    CACHING: 'Cache API responses for static or infrequently changing data',
    BACKGROUND_JOBS: 'Process heavy operations in background jobs',
    REQUEST_QUEUING: 'Queue requests during high load periods',
  },

  // Memory optimization
  MEMORY: {
    STREAMING: 'Use streaming for large data processing',
    PAGINATION: 'Implement pagination for large result sets',
    CLEANUP: 'Regular cleanup of unused data and connections',
    MONITORING: 'Monitor memory usage and implement alerts',
  },
};

/**
 * Performance monitoring alerts
 */
export const PerformanceAlerts = {
  // Database alerts
  DATABASE: {
    SLOW_QUERIES: 'Multiple slow queries detected',
    CONNECTION_POOL_EXHAUSTED: 'Database connection pool is exhausted',
    HIGH_MEMORY_USAGE: 'Database memory usage is high',
    REPLICA_LAG: 'Database replica lag is high',
  },

  // API alerts
  API: {
    SLOW_ENDPOINTS: 'Multiple slow endpoints detected',
    HIGH_ERROR_RATE: 'API error rate is high',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded by multiple clients',
    HIGH_MEMORY_USAGE: 'API memory usage is high',
  },

  // System alerts
  SYSTEM: {
    HIGH_CPU_USAGE: 'System CPU usage is high',
    HIGH_MEMORY_USAGE: 'System memory usage is high',
    DISK_SPACE_LOW: 'Disk space is running low',
    NETWORK_LATENCY: 'Network latency is high',
  },
};

export default getPerformanceConfig;
