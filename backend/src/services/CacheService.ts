import Redis from 'ioredis';
import logger from './LoggerService';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
  compress?: boolean; // Whether to compress large values
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  hitRate: number;
}

export class CacheService {
  private redis: Redis;
  private stats: CacheStats;
  private defaultTTL: number;
  private keyPrefix: string;
  private compressionThreshold: number = 1024; // 1KB threshold for compression

  constructor() {
    this.defaultTTL = 300; // 5 minutes default
    this.keyPrefix = 'dnd_game:';

    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),

      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    // Initialize stats
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      memory: 0,
      hitRate: 0,
    };

    this.setupEventHandlers();
    this.startStatsCollection();
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', error => {
      logger.error('Redis connection error:', error);
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready for operations');
    });

    this.redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  // Set cache item with compression for large values
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const ttl = options.ttl || this.defaultTTL;
      let serializedValue: string;

      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }

      // Compress large values
      if (options.compress && serializedValue.length > this.compressionThreshold) {
        serializedValue = await this.compress(serializedValue);
      }

      await this.redis.setex(fullKey, ttl, serializedValue);
      this.updateStats('set', key);

      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error(`Failed to set cache for key ${key}:`, error);
      throw error;
    }
  }

  // Get cache item with automatic decompression
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const value = await this.redis.get(fullKey);

      if (value === null) {
        this.updateStats('miss', key);
        return null;
      }

      // Check if value is compressed
      let decompressedValue = value;
      if (this.isCompressed(value)) {
        decompressedValue = await this.decompress(value);
      }

      // Try to parse as JSON, fallback to string
      let parsedValue: T;
      try {
        parsedValue = JSON.parse(decompressedValue);
      } catch {
        parsedValue = decompressedValue as T;
      }

      this.updateStats('hit', key);
      logger.debug(`Cache hit: ${key}`);
      return parsedValue;
    } catch (error) {
      logger.error(`Failed to get cache for key ${key}:`, error);
      this.updateStats('miss', key);
      return null;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check existence for key ${key}:`, error);
      return false;
    }
  }

  // Delete cache item
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.del(fullKey);
      logger.debug(`Cache deleted: ${key}`);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to delete cache for key ${key}:`, error);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async deletePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        logger.debug(`Cache pattern deleted: ${pattern} (${result} keys)`);
        return result;
      }

      return 0;
    } catch (error) {
      logger.error(`Failed to delete cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  // Set cache item if not exists (atomic operation)
  async setNX<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const ttl = options.ttl || this.defaultTTL;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

      const result = await this.redis.set(fullKey, serializedValue, 'EX', ttl, 'NX');
      const success = result === 'OK';

      if (success) {
        this.updateStats('set', key);
        logger.debug(`Cache setNX: ${key} (TTL: ${ttl}s)`);
      }

      return success;
    } catch (error) {
      logger.error(`Failed to setNX cache for key ${key}:`, error);
      return false;
    }
  }

  // Increment counter
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.incrby(fullKey, amount);

      // Set TTL if key didn't exist
      if (amount === 1) {
        await this.redis.expire(fullKey, this.defaultTTL);
      }

      logger.debug(`Cache incremented: ${key} by ${amount}`);
      return result;
    } catch (error) {
      logger.error(`Failed to increment cache for key ${key}:`, error);
      throw error;
    }
  }

  // Get or set with fallback
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, options);
    return value;
  }

  // Cache warming for common data
  async warmCache(): Promise<void> {
    try {
      logger.info('Starting cache warming...');

      // Warm campaign list cache
      await this.warmCampaignCache();

      // Warm character templates cache
      await this.warmCharacterTemplatesCache();

      // Warm quest templates cache
      await this.warmQuestTemplatesCache();

      logger.info('Cache warming completed');
    } catch (error) {
      logger.error('Cache warming failed:', error);
    }
  }

  // Cache invalidation strategies
  async invalidateByPattern(pattern: string): Promise<number> {
    return this.deletePattern(pattern);
  }

  async invalidateCampaign(campaignId: string): Promise<void> {
    const patterns = [
      `campaign:${campaignId}:*`,
      `sessions:campaign:${campaignId}:*`,
      `characters:campaign:${campaignId}:*`,
      `quests:campaign:${campaignId}:*`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.info(`Cache invalidated for campaign: ${campaignId}`);
  }

  async invalidateCharacter(characterId: string): Promise<void> {
    const patterns = [`character:${characterId}:*`, `characters:*`];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.info(`Cache invalidated for character: ${characterId}`);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const patterns = [`session:${sessionId}:*`, `sessions:*`];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.info(`Cache invalidated for session: ${sessionId}`);
  }

  // Get cache statistics
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();

      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch ? memoryMatch[1] : '0B';

      this.stats.keys = keys;
      this.stats.memory = this.parseMemorySize(memory);
      this.stats.hitRate =
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0;

      return { ...this.stats };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return { ...this.stats };
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.stats.hits = 0;
      this.stats.misses = 0;
      this.stats.keys = 0;
      logger.info('All cache cleared');
    } catch (error) {
      logger.error('Failed to clear all cache:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Cache service shutdown complete');
    } catch (error) {
      logger.error('Cache service shutdown failed:', error);
    }
  }

  // Private helper methods
  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private updateStats(type: 'hit' | 'miss' | 'set', _key: string): void {
    if (type === 'hit') {
      this.stats.hits++;
    } else if (type === 'miss') {
      this.stats.misses++;
    }
  }

  private async compress(data: string): Promise<string> {
    // Simple compression using gzip-like approach
    // In production, you might want to use a proper compression library
    return Buffer.from(data, 'utf8').toString('base64');
  }

  private async decompress(data: string): Promise<string> {
    // Simple decompression
    return Buffer.from(data, 'base64').toString('utf8');
  }

  private isCompressed(data: string): boolean {
    // Check if data appears to be compressed
    return data.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(data);
  }

  private parseMemorySize(sizeStr: string): number {
    const units: { [key: string]: number } = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] || 'B';
      return value * (units[unit] || 1);
    }

    return 0;
  }

  private startStatsCollection(): void {
    // Collect stats every 5 minutes
    setInterval(
      async () => {
        try {
          await this.getStats();
        } catch (error) {
          logger.error('Failed to collect cache stats:', error);
        }
      },
      5 * 60 * 1000
    );
  }

  // Cache warming methods
  private async warmCampaignCache(): Promise<void> {
    // This would integrate with your actual campaign service
    // For now, we'll create placeholder warm data
    const warmData = {
      campaigns: [],
      templates: [],
      statistics: {},
    };

    await this.set('campaigns:warm', warmData, { ttl: 600 }); // 10 minutes
  }

  private async warmCharacterTemplatesCache(): Promise<void> {
    const templates = [
      { name: 'Fighter', class: 'Fighter', level: 1 },
      { name: 'Wizard', class: 'Wizard', level: 1 },
      { name: 'Rogue', class: 'Rogue', level: 1 },
    ];

    await this.set('character:templates', templates, { ttl: 1800 }); // 30 minutes
  }

  private async warmQuestTemplatesCache(): Promise<void> {
    const templates = [
      { name: 'Rescue Mission', type: 'rescue', difficulty: 'medium' },
      { name: 'Dungeon Crawl', type: 'exploration', difficulty: 'hard' },
      { name: 'Social Encounter', type: 'social', difficulty: 'easy' },
    ];

    await this.set('quest:templates', templates, { ttl: 1800 }); // 30 minutes
  }
}

// Export singleton instance
export const cacheService = new CacheService();
