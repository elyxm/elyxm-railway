import { ICacheService } from "@medusajs/types";
import { createHash } from "crypto";
import { DEFAULT_CACHE_DURATION } from "../../lib/constants";

export interface CacheOptions {
  ttl?: number;
  logger?: any;
}

export interface CacheKeyConfig {
  versionKey: string;
  keyPrefix: string;
}

/**
 * Versioned Cache Helper
 *
 * Provides a reusable caching strategy with automatic versioning.
 * When data changes, increment the version to invalidate all related cache entries.
 */
export class VersionedCacheHelper {
  constructor(
    private cacheService: ICacheService,
    private config: CacheKeyConfig,
    private options: CacheOptions = {}
  ) {}

  /**
   * Get the current cache version, initializing if needed
   */
  async getCacheVersion(): Promise<number> {
    let version = await this.cacheService.get<number>(this.config.versionKey);
    if (version === null) {
      version = 1;
      await this.cacheService.set(this.config.versionKey, version, this.options.ttl || DEFAULT_CACHE_DURATION);
    }
    return version;
  }

  /**
   * Increment cache version to invalidate all related entries
   */
  async bustCache(): Promise<number> {
    const currentVersion = await this.getCacheVersion();
    const newVersion = currentVersion + 1;

    await this.cacheService.set(this.config.versionKey, newVersion, this.options.ttl || DEFAULT_CACHE_DURATION);

    if (this.options.logger) {
      this.options.logger.info(
        `[${new Date().toISOString()}] Cache busted for ${this.config.keyPrefix}. New version: ${newVersion}`
      );
    }

    return newVersion;
  }

  /**
   * Generate a versioned cache key
   */
  async generateCacheKey(identifier: string): Promise<string> {
    const version = await this.getCacheVersion();
    return `${this.config.keyPrefix}:${version}:${identifier}`;
  }

  /**
   * Generate a versioned cache key from query parameters (for API endpoints)
   */
  async generateQueryCacheKey(queryParams: Record<string, any> = {}): Promise<string> {
    const queryString = JSON.stringify(queryParams);
    const hash = createHash("sha256").update(queryString).digest("hex");
    return this.generateCacheKey(hash);
  }

  /**
   * Get cached data using versioned key
   */
  async get<T>(identifier: string): Promise<T | null> {
    const cacheKey = await this.generateCacheKey(identifier);
    return this.cacheService.get<T>(cacheKey);
  }

  /**
   * Get cached data using query parameters
   */
  async getByQuery<T>(queryParams: Record<string, any> = {}): Promise<T | null> {
    const cacheKey = await this.generateQueryCacheKey(queryParams);
    return this.cacheService.get<T>(cacheKey);
  }

  /**
   * Set cached data using versioned key
   */
  async set<T>(identifier: string, data: T, ttl?: number): Promise<void> {
    const cacheKey = await this.generateCacheKey(identifier);
    await this.cacheService.set(cacheKey, data, ttl || this.options.ttl || DEFAULT_CACHE_DURATION);
  }

  /**
   * Set cached data using query parameters
   */
  async setByQuery<T>(queryParams: Record<string, any>, data: T, ttl?: number): Promise<void> {
    const cacheKey = await this.generateQueryCacheKey(queryParams);
    await this.cacheService.set(cacheKey, data, ttl || this.options.ttl || DEFAULT_CACHE_DURATION);
  }

  /**
   * Invalidate a specific cached entry
   */
  async invalidate(identifier: string): Promise<void> {
    const cacheKey = await this.generateCacheKey(identifier);
    await this.cacheService.invalidate(cacheKey);
  }

  /**
   * Log cache hit/miss for debugging
   */
  logCacheResult(hit: boolean, cacheKey: string): void {
    if (this.options.logger) {
      const status = hit ? "HIT" : "MISS";
      this.options.logger.info(`[${new Date().toISOString()}] Cache ${status} for key: ${cacheKey}`);
    }
  }
}

/**
 * Factory function to create cache helpers for different data types
 *
 * @param cacheService - The Medusa cache service instance
 * @param config - Cache configuration with version key and key prefix
 * @param options - Optional settings like TTL and logger
 * @returns VersionedCacheHelper instance
 *
 * @example
 * ```typescript
 * const cacheHelper = createCacheHelper(
 *   cacheService,
 *   CACHE_CONFIGS.PRODUCTS,
 *   { logger, ttl: 3600 }
 * );
 * ```
 *
 * @see backend/docs/cache.md for complete usage documentation
 */
export function createCacheHelper(
  cacheService: ICacheService,
  config: CacheKeyConfig,
  options: CacheOptions = {}
): VersionedCacheHelper {
  return new VersionedCacheHelper(cacheService, config, options);
}
