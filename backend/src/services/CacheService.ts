import { Redis } from 'ioredis';
import config from '../config';
import logger from './LoggerService';

interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  hitRate: number;
}

export class CacheService {
  private redis: Redis | null = null;
  private stats: CacheStats;
  private defaultTTL: number;
  private keyPrefix: string;
  private compressionThreshold: number = 1024; // 1KB threshold for compression
  private redisAvailable: boolean = false;
  private fallbackCache: Map<string, { value: any; expiry: number }> = new Map();
  private fallbackCleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.defaultTTL = 300; // 5 minutes default
    this.keyPrefix = 'dnd_game:';

    // Initialize stats
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      memory: 0,
      hitRate: 0,
    };

    this.initializeRedis();
    this.startFallbackCleanup();

    // Check if cache should be cleared on startup
    this.checkStartupCacheClear();
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Initialize Redis connection using config
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        lazyConnect: true,
        keepAlive: config.redis.keepAlive,
        connectTimeout: config.redis.connectTimeout,
        commandTimeout: config.redis.commandTimeout,
      });

      this.setupEventHandlers();

      // Test connection
      await this.redis.ping();
      this.redisAvailable = true;
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.warn('Redis connection failed, falling back to in-memory cache:', error);
      this.redisAvailable = false;
      this.redis = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.redis) return;

    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
      this.redisAvailable = true;
    });

    this.redis.on('error', error => {
      logger.error('Redis connection error:', error);
      this.redisAvailable = false;
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready for operations');
      this.redisAvailable = true;
    });

    this.redis.on('close', () => {
      logger.warn('Redis connection closed');
      this.redisAvailable = false;
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
      this.redisAvailable = false;
    });
  }

  private startFallbackCleanup(): void {
    // Clean up expired fallback cache entries every 5 minutes
    this.fallbackCleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [key, entry] of this.fallbackCache.entries()) {
          if (entry.expiry < now) {
            this.fallbackCache.delete(key);
          }
        }
      },
      5 * 60 * 1000
    );
  }

  // Set cache item with compression for large values
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const fullKey = this.getFullKey(key);

      if (this.redisAvailable && this.redis) {
        // Use Redis if available
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
        logger.debug(`Redis cache set: ${key} (TTL: ${ttl}s)`);
      } else {
        // Fallback to in-memory cache
        const expiry = Date.now() + ttl * 1000;
        this.fallbackCache.set(fullKey, { value, expiry });
        this.updateStats('set', key);
        logger.debug(`Fallback cache set: ${key} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      logger.error(`Failed to set cache for key ${key}:`, error);
      // Don't throw error, just log it and continue
      // This prevents Redis failures from breaking the application
    }
  }

  // Get cache item with automatic decompression
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);

      if (this.redisAvailable && this.redis) {
        // Try Redis first
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
        logger.debug(`Redis cache hit: ${key}`);
        return parsedValue;
      } else {
        // Fallback to in-memory cache
        const entry = this.fallbackCache.get(fullKey);
        if (!entry) {
          this.updateStats('miss', key);
          return null;
        }

        // Check if expired
        if (entry.expiry < Date.now()) {
          this.fallbackCache.delete(fullKey);
          this.updateStats('miss', key);
          return null;
        }

        this.updateStats('hit', key);
        logger.debug(`Fallback cache hit: ${key}`);
        return entry.value as T;
      }
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

      if (this.redisAvailable && this.redis) {
        const result = await this.redis.exists(fullKey);
        return result === 1;
      } else {
        // Fallback to in-memory cache
        const entry = this.fallbackCache.get(fullKey);
        if (!entry) return false;

        // Check if expired
        if (entry.expiry < Date.now()) {
          this.fallbackCache.delete(fullKey);
          return false;
        }

        return true;
      }
    } catch (error) {
      logger.error(`Failed to check existence for key ${key}:`, error);
      return false;
    }
  }

  // Delete cache item
  async delete(_key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(_key);

      if (this.redisAvailable && this.redis) {
        const result = await this.redis.del(fullKey);
        logger.debug(`Redis cache deleted: ${_key}`);
        return result === 1;
      } else {
        // Fallback to in-memory cache
        const deleted = this.fallbackCache.delete(fullKey);
        if (deleted) {
          logger.debug(`Fallback cache deleted: ${_key}`);
        }
        return deleted;
      }
    } catch (error) {
      logger.error(`Failed to delete cache for key ${_key}:`, error);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async deletePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = this.getFullKey(pattern);

      if (this.redisAvailable && this.redis) {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          const result = await this.redis.del(...keys);
          logger.debug(`Redis cache pattern deleted: ${pattern} (${result} keys)`);
          return result;
        }
        return 0;
      } else {
        // Fallback to in-memory cache - delete keys that match pattern
        let deletedCount = 0;
        for (const key of this.fallbackCache.keys()) {
          if (key.includes(fullPattern.replace('*', ''))) {
            this.fallbackCache.delete(key);
            deletedCount++;
          }
        }
        logger.debug(`Fallback cache pattern deleted: ${pattern} (${deletedCount} keys)`);
        return deletedCount;
      }
    } catch (error) {
      logger.error(`Failed to delete cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  // Set cache item if not exists (atomic operation)
  async setNX<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const fullKey = this.getFullKey(key);

      if (this.redisAvailable && this.redis) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        const result = await this.redis.set(fullKey, serializedValue, 'EX', ttl, 'NX');
        const success = result === 'OK';

        if (success) {
          this.updateStats('set', key);
          logger.debug(`Redis cache setNX: ${key} (TTL: ${ttl}s)`);
        }

        return success;
      } else {
        // Fallback to in-memory cache
        if (this.fallbackCache.has(fullKey)) {
          return false;
        }

        const expiry = Date.now() + ttl * 1000;
        this.fallbackCache.set(fullKey, { value, expiry });
        this.updateStats('set', key);
        logger.debug(`Fallback cache setNX: ${key} (TTL: ${ttl}s)`);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to setNX cache for key ${key}:`, error);
      return false;
    }
  }

  // Increment counter
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const fullKey = this.getFullKey(key);

      if (this.redisAvailable && this.redis) {
        const result = await this.redis.incrby(fullKey, amount);

        // Set TTL if key didn't exist
        if (amount === 1) {
          await this.redis.expire(fullKey, this.defaultTTL);
        }

        logger.debug(`Redis cache incremented: ${key} by ${amount}`);
        return result;
      } else {
        // Fallback to in-memory cache
        const entry = this.fallbackCache.get(fullKey);
        if (!entry) {
          const result = amount; // If not in cache, it's a new increment
          this.fallbackCache.set(fullKey, {
            value: result,
            expiry: Date.now() + this.defaultTTL * 1000,
          });
          logger.debug(`Fallback cache incremented: ${key} by ${amount} (new entry)`);
          return result;
        }

        const currentValue = entry.value;
        const newValue = (currentValue as number) + amount;
        this.fallbackCache.set(fullKey, { value: newValue, expiry: entry.expiry });
        logger.debug(`Fallback cache incremented: ${key} by ${amount}`);
        return newValue;
      }
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

      // Warm AI response templates cache
      await this.warmAIResponseTemplatesCache();

      // Warm common game mechanics cache
      await this.warmGameMechanicsCache();

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
      if (this.redisAvailable && this.redis) {
        const info = await this.redis.info('memory');
        const keys = await this.redis.dbsize();

        // Parse memory info
        const memoryMatch = info.match(/used_memory_human:(\S+)/);
        const memory = memoryMatch ? memoryMatch[1] : '0B';

        this.stats.keys = keys;
        this.stats.memory = this.parseMemorySize(memory);
      } else {
        // Fallback to in-memory cache stats
        this.stats.keys = this.fallbackCache.size;
        this.stats.memory = 0; // In-memory cache doesn't have Redis memory info
      }

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
      if (this.redisAvailable && this.redis) {
        await this.redis.flushdb();
      }

      // Clear fallback cache
      this.fallbackCache.clear();

      this.stats.hits = 0;
      this.stats.misses = 0;
      this.stats.keys = 0;
      logger.info('All cache cleared');
    } catch (error) {
      logger.error('Failed to clear all cache:', error);
      // Don't throw error, just log it
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (this.redisAvailable && this.redis) {
        await this.redis.ping();
        return true;
      } else {
        // Return true if fallback cache is working
        return true;
      }
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      if (this.redisAvailable && this.redis) {
        await this.redis.quit();
      }

      // Clear fallback cache cleanup interval
      if (this.fallbackCleanupInterval) {
        clearInterval(this.fallbackCleanupInterval);
      }

      // Clear fallback cache
      this.fallbackCache.clear();

      logger.info('Cache service shutdown complete');
    } catch (error) {
      logger.error('Cache service shutdown failed:', error);
    }
  }

  // Private helper methods
  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private updateStats(operation: 'hit' | 'miss' | 'set', _key: string): void {
    switch (operation) {
      case 'hit':
        this.stats.hits++;
        break;
      case 'miss':
        this.stats.misses++;
        break;
      case 'set':
        this.stats.keys++;
        break;
    }
  }

  private async compress(data: string): Promise<string> {
    // Simple compression implementation - in production you might want to use a proper compression library
    return data; // Placeholder for compression logic
  }

  private async decompress(data: string): Promise<string> {
    // Simple decompression implementation - in production you might want to use a proper compression library
    return data; // Placeholder for compression logic
  }

  private isCompressed(_data: string): boolean {
    // Simple compression detection - in production you might want to use proper compression detection
    return false; // Placeholder for compression detection logic
  }

  private parseMemorySize(memoryStr: string): number {
    const units: { [key: string]: number } = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    const match = memoryStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      return Math.round(value * (units[unit] || 1));
    }

    return 0;
  }

  private startStatsCollection(): void {
    // Stats are now updated inline, no need for separate collection
  }

  // Cache warming methods
  private async warmCampaignCache(): Promise<void> {
    try {
      // Warm campaign templates
      const campaignTemplates = [
        { id: 'fantasy', name: 'Fantasy', description: 'Classic fantasy adventure' },
        { id: 'scifi', name: 'Sci-Fi', description: 'Futuristic space adventure' },
        { id: 'horror', name: 'Horror', description: 'Spooky supernatural adventure' },
      ];

      for (const template of campaignTemplates) {
        await this.set(`campaign:templates:${template.id}`, template, { ttl: 3600 });
      }

      logger.debug('Campaign templates cache warmed');
    } catch (error) {
      logger.error('Failed to warm campaign cache:', error);
    }
  }

  private async warmCharacterTemplatesCache(): Promise<void> {
    try {
      // Warm character class templates
      const classTemplates = [
        { id: 'fighter', name: 'Fighter', hitDie: 10, primaryAbility: 'Strength' },
        { id: 'wizard', name: 'Wizard', hitDie: 6, primaryAbility: 'Intelligence' },
        { id: 'rogue', name: 'Rogue', hitDie: 8, primaryAbility: 'Dexterity' },
      ];

      for (const template of classTemplates) {
        await this.set(`character:classes:${template.id}`, template, { ttl: 3600 });
      }

      logger.debug('Character templates cache warmed');
    } catch (error) {
      logger.error('Failed to warm character templates cache:', error);
    }
  }

  private async warmQuestTemplatesCache(): Promise<void> {
    try {
      // Warm quest templates
      const questTemplates = [
        { id: 'rescue', name: 'Rescue Mission', difficulty: 'medium', duration: '2-4 hours' },
        { id: 'exploration', name: 'Exploration', difficulty: 'easy', duration: '1-2 hours' },
        { id: 'combat', name: 'Combat Challenge', difficulty: 'hard', duration: '3-5 hours' },
      ];

      for (const template of questTemplates) {
        await this.set(`quest:templates:${template.id}`, template, { ttl: 3600 });
      }

      logger.debug('Quest templates cache warmed');
    } catch (error) {
      logger.error('Failed to warm quest templates cache:', error);
    }
  }

  private async warmAIResponseTemplatesCache(): Promise<void> {
    try {
      // Warm AI response templates
      const aiTemplates = [
        { id: 'greeting', template: 'Welcome to the adventure, brave {character_name}!' },
        { id: 'combat_start', template: 'The {enemy_type} lunges at you with {weapon}!' },
        { id: 'victory', template: 'Congratulations! You have successfully {achievement}!' },
      ];

      for (const template of aiTemplates) {
        await this.set(`ai:templates:${template.id}`, template, { ttl: 3600 });
      }

      logger.debug('AI response templates cache warmed');
    } catch (error) {
      logger.error('Failed to warm AI response templates cache:', error);
    }
  }

  private async warmGameMechanicsCache(): Promise<void> {
    try {
      // Warm game mechanics
      const gameMechanics = [
        { id: 'skill_checks', name: 'Skill Checks', description: 'D20 + modifier vs DC' },
        { id: 'combat', name: 'Combat', description: 'Initiative, attack, damage' },
        { id: 'saving_throws', name: 'Saving Throws', description: 'D20 + save modifier vs DC' },
      ];

      for (const mechanic of gameMechanics) {
        await this.set(`mechanics:${mechanic.id}`, mechanic, { ttl: 3600 });
      }

      logger.debug('Game mechanics cache warmed');
    } catch (error) {
      logger.error('Failed to warm game mechanics cache:', error);
    }
  }

  // Check if cache should be cleared on startup based on environment variables
  private async checkStartupCacheClear(): Promise<void> {
    try {
      const shouldClearOnStartup = process.env.CACHE_CLEAR_ON_STARTUP === 'true';
      const shouldClearOnDeploy = process.env.CLEAR_CACHE_ON_DEPLOY === 'true';

      if (shouldClearOnStartup || shouldClearOnDeploy) {
        logger.info('Cache clear on startup/deploy enabled, clearing cache...');
        await this.clearAll();

        if (shouldClearOnStartup) {
          logger.info('Cache cleared on startup as per CACHE_CLEAR_ON_STARTUP setting');
        }
        if (shouldClearOnDeploy) {
          logger.info('Cache cleared on startup as per CLEAR_CACHE_ON_DEPLOY setting');
        }
      }
    } catch (error) {
      logger.error('Failed to check startup cache clear settings:', error);
    }
  }

  // Check if we're in a Railway deployment environment
  private isRailwayDeployment(): boolean {
    return !!(
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_ID
    );
  }

  // Clear cache based on deployment patterns
  async clearDeploymentCache(): Promise<void> {
    try {
      if (!this.isRailwayDeployment()) {
        logger.info('Not in Railway deployment environment, skipping deployment cache clear');
        return;
      }

      const clearPatterns = process.env.CACHE_CLEAR_PATTERNS?.split(',') || [];

      if (clearPatterns.length === 0) {
        // If no specific patterns, clear all cache
        await this.clearAll();
        logger.info('Deployment cache clear: All cache cleared');
        return;
      }

      let clearedCount = 0;

      // Clear cache based on patterns
      for (const pattern of clearPatterns) {
        const trimmedPattern = pattern.trim();
        if (trimmedPattern) {
          const count = await this.deletePattern(trimmedPattern);
          clearedCount += count;
          logger.debug(
            `Deployment cache clear: Cleared ${count} keys matching pattern: ${trimmedPattern}`
          );
        }
      }

      logger.info(`Deployment cache clear: Cleared ${clearedCount} keys total`);
    } catch (error) {
      logger.error('Failed to clear deployment cache:', error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
