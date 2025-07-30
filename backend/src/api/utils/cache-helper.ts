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
 */
export function createCacheHelper(
  cacheService: ICacheService,
  config: CacheKeyConfig,
  options: CacheOptions = {}
): VersionedCacheHelper {
  return new VersionedCacheHelper(cacheService, config, options);
}

/* ========================================================================
 * USAGE EXAMPLES
 * ======================================================================== */

/**
 * Example 1: Generic cache middleware factory for any endpoint
 *
 * Usage:
 * import { CACHE_CONFIGS } from "../../lib/constants";
 * import { createGenericCacheMiddleware } from "./cache-helper";
 *
 * // For orders endpoint
 * const ordersCacheMiddleware = createGenericCacheMiddleware('ORDERS');
 *
 * // For categories endpoint
 * const categoriesCacheMiddleware = createGenericCacheMiddleware('CATEGORIES');
 */
/*
export function createGenericCacheMiddleware(cacheConfigKey: keyof typeof CACHE_CONFIGS) {
  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const cacheService = req.scope.resolve(ModuleRegistrationName.CACHE);
    const logger = req.scope.resolve("logger");

    const cacheHelper = createCacheHelper(
      cacheService,
      CACHE_CONFIGS[cacheConfigKey],
      { logger }
    );

    const cached = await cacheHelper.getByQuery(req.query || {});

    if (cached) {
      const cacheKey = await cacheHelper.generateQueryCacheKey(req.query || {});
      cacheHelper.logCacheResult(true, cacheKey);
      res.json(cached);
      return;
    }

    const cacheKey = await cacheHelper.generateQueryCacheKey(req.query || {});
    cacheHelper.logCacheResult(false, cacheKey);

    const originalJsonFn = res.json;
    Object.assign(res, {
      json: async function (body: any) {
        await cacheHelper.setByQuery(req.query || {}, body);
        await originalJsonFn.call(res, body);
      },
    });

    next();
  };
}
*/

/**
 * Example 2: Cache specific item by ID
 *
 * Usage:
 * const customerCacheHelper = createCacheHelper(
 *   cacheService,
 *   CACHE_CONFIGS.CUSTOMERS,
 *   { logger }
 * );
 *
 * // Cache customer data
 * await customerCacheHelper.set(customerId, customerData);
 *
 * // Get cached customer
 * const customer = await customerCacheHelper.get(customerId);
 */

/**
 * Example 3: Bust cache in subscribers
 *
 * Usage in order-events subscriber:
 *
 * export default async function orderEventsHandler({ container }) {
 *   const cacheService = container.resolve(ModuleRegistrationName.CACHE);
 *   const logger = container.resolve("logger");
 *
 *   const orderCacheHelper = createCacheHelper(
 *     cacheService,
 *     CACHE_CONFIGS.ORDERS,
 *     { logger }
 *   );
 *
 *   await orderCacheHelper.bustCache();
 * }
 */

/**
 * Example 4: Cache in workflows
 *
 * Usage:
 * const step = createStep("cache-data", async ({ data }, { container }) => {
 *   const cacheService = container.resolve(ModuleRegistrationName.CACHE);
 *
 *   const cacheHelper = createCacheHelper(
 *     cacheService,
 *     CACHE_CONFIGS.INVENTORY,
 *     {}
 *   );
 *
 *   await cacheHelper.set(data.itemId, data.inventoryData);
 * });
 */
