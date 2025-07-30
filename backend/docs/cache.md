# Versioned Caching System

This document describes the versioned caching system implemented for the Medusa 2.0 application. The system provides automatic cache invalidation through versioning, eliminating the need for manual key management or complex deletion patterns.

## Overview

The caching system consists of:

- **VersionedCacheHelper**: Core class that handles cache operations
- **Cache Configurations**: Predefined configs for different data types
- **Automatic Versioning**: Cache entries are automatically versioned to handle invalidation
- **Query-based Caching**: Support for caching API responses based on query parameters

## How It Works

1. **Version-based Keys**: Each cache entry includes a version number in its key
2. **Cache Busting**: When data changes, the version is incremented, making old entries stale
3. **Natural Cleanup**: Old entries are ignored (not actively deleted) and expire via TTL
4. **Query Hashing**: Query parameters are hashed to create consistent cache keys

## Core Components

### VersionedCacheHelper Class

Located in `backend/src/api/utils/cache-helper.ts`, this class provides:

- `getCacheVersion()` - Get current version, initializing if needed
- `bustCache()` - Increment version to invalidate all entries
- `generateCacheKey(identifier)` - Create versioned key for specific items
- `generateQueryCacheKey(queryParams)` - Create versioned key from query parameters
- `get(identifier)` - Retrieve cached data by identifier
- `getByQuery(queryParams)` - Retrieve cached data by query parameters
- `set(identifier, data)` - Store data with versioned key
- `setByQuery(queryParams, data)` - Store data with query-based key
- `invalidate(identifier)` - Remove specific cached entry
- `logCacheResult(hit, key)` - Log cache hits/misses for debugging

### Cache Configurations

Defined in `backend/src/lib/constants.ts`:

```typescript
export const CACHE_CONFIGS = {
  PRODUCTS: {
    versionKey: "cache:products:version",
    keyPrefix: "cache:products",
  },
  ORDERS: {
    versionKey: "cache:orders:version",
    keyPrefix: "cache:orders",
  },
  CUSTOMERS: {
    versionKey: "cache:customers:version",
    keyPrefix: "cache:customers",
  },
  CATEGORIES: {
    versionKey: "cache:categories:version",
    keyPrefix: "cache:categories",
  },
  COLLECTIONS: {
    versionKey: "cache:collections:version",
    keyPrefix: "cache:collections",
  },
  INVENTORY: {
    versionKey: "cache:inventory:version",
    keyPrefix: "cache:inventory",
  },
};
```

## Usage Examples

### 1. API Endpoint Caching (Middleware)

For caching API responses based on query parameters:

```typescript
import { createCacheHelper } from "../utils/cache-helper";
import { CACHE_CONFIGS } from "../../lib/constants";

export const ordersCacheMiddleware = async (req, res, next) => {
  const cacheService = req.scope.resolve(ModuleRegistrationName.CACHE);
  const logger = req.scope.resolve("logger");

  // Create cache helper for orders
  const orderCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.ORDERS, { logger });

  // Try to get cached response
  const cachedOrders = await orderCacheHelper.getByQuery(req.query || {});

  if (cachedOrders) {
    const cacheKey = await orderCacheHelper.generateQueryCacheKey(req.query || {});
    orderCacheHelper.logCacheResult(true, cacheKey);
    res.json(cachedOrders);
    return;
  }

  // Cache miss - set up response caching
  const cacheKey = await orderCacheHelper.generateQueryCacheKey(req.query || {});
  orderCacheHelper.logCacheResult(false, cacheKey);

  const originalJsonFn = res.json;
  Object.assign(res, {
    json: async function (body) {
      await orderCacheHelper.setByQuery(req.query || {}, body);
      await originalJsonFn.call(res, body);
    },
  });

  next();
};
```

### 2. Event Subscribers (Cache Busting)

When data changes, bust the cache to invalidate all related entries:

```typescript
import { createCacheHelper } from "../api/utils/cache-helper";
import { CACHE_CONFIGS } from "../lib/constants";

export default async function orderEventsHandler({ container }) {
  const cacheService = container.resolve(ModuleRegistrationName.CACHE);
  const logger = container.resolve("logger");

  // Create cache helper for orders
  const orderCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.ORDERS, { logger });

  // Bust the orders cache - increments version automatically
  await orderCacheHelper.bustCache();
}

export const config = {
  event: ["order.created", "order.updated", "order.deleted", "order.canceled"],
  context: {
    subscriberId: "order-events-handler",
  },
};
```

### 3. Individual Item Caching

For caching specific items by ID:

```typescript
import { createCacheHelper } from "../api/utils/cache-helper";
import { CACHE_CONFIGS } from "../lib/constants";

// In a service or API route
export async function cacheCustomer(customerId: string, customerData: any) {
  const cacheService = container.resolve(ModuleRegistrationName.CACHE);
  const logger = container.resolve("logger");

  const customerCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.CUSTOMERS, { logger });

  // Cache customer data by ID
  await customerCacheHelper.set(customerId, customerData);
}

export async function getCachedCustomer(customerId: string) {
  const cacheService = container.resolve(ModuleRegistrationName.CACHE);

  const customerCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.CUSTOMERS);

  // Get cached customer by ID
  return await customerCacheHelper.get(customerId);
}
```

### 4. Workflow Step Caching

For caching data within workflow steps:

```typescript
import { createStep } from "@medusajs/framework/workflows-sdk";
import { createCacheHelper } from "../api/utils/cache-helper";
import { CACHE_CONFIGS } from "../lib/constants";

const cacheInventoryStep = createStep("cache-inventory-data", async ({ itemId, inventoryData }, { container }) => {
  const cacheService = container.resolve(ModuleRegistrationName.CACHE);

  const inventoryCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.INVENTORY);

  // Cache inventory data for quick lookup
  await inventoryCacheHelper.set(itemId, inventoryData);

  return { cached: true };
});
```

### 5. Custom Cache Configuration

To add a new cache type, update the `CACHE_CONFIGS` in `constants.ts`:

```typescript
export const CACHE_CONFIGS = {
  // ... existing configs
  PROMOTIONS: {
    versionKey: "cache:promotions:version",
    keyPrefix: "cache:promotions",
  },
  SHIPPING: {
    versionKey: "cache:shipping:version",
    keyPrefix: "cache:shipping",
  },
} as const;
```

Then use it like any other cache config:

```typescript
const promotionCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.PROMOTIONS, { logger });
```

## Benefits

### ✅ **Automatic Versioning**

- No manual cache key management required
- Version increments automatically handle invalidation

### ✅ **Natural Cleanup**

- Old cache entries become stale automatically
- No expensive wildcard deletion operations
- Entries expire naturally via TTL

### ✅ **Type Safety**

- Full TypeScript support with generics
- Compile-time checking of cache configurations

### ✅ **Consistent Pattern**

- Same API across all cache operations
- Standardized approach for all endpoints

### ✅ **Flexible Usage**

- Works with query parameters, IDs, or custom identifiers
- Suitable for API endpoints, services, and workflows

### ✅ **Observable**

- Built-in logging for cache hits/misses
- Easy debugging and monitoring

### ✅ **Performance**

- Avoids expensive key scanning operations
- Efficient query-based caching with SHA256 hashing

## Implementation Checklist

To add caching to a new endpoint:

1. **[ ]** Choose appropriate cache config from `CACHE_CONFIGS`
2. **[ ]** Add middleware to API endpoint using `createCacheHelper()`
3. **[ ]** Create event subscriber to bust cache when data changes
4. **[ ]** Test cache hits/misses with logging
5. **[ ]** Monitor cache performance and adjust TTL if needed

## Migration Notes

### From Previous Implementation

The old caching implementation had issues with:

- ❌ Using `keys()` and `del()` methods not available in Medusa 2.0
- ❌ Manual key deletion causing performance issues
- ❌ Hard-coded cache logic in middleware

The new implementation:

- ✅ Uses only standard `ICacheService` methods (`get`, `set`, `invalidate`)
- ✅ Automatic versioning eliminates manual deletion
- ✅ Reusable helper abstracts cache logic

### Key Changes Made

1. **Removed problematic code**:

   ```typescript
   // Old (broken in Medusa 2.0)
   const keysToDelete = await(cacheService as any).keys(`pattern:*`);
   await(cacheService as any).del(keysToDelete);
   ```

2. **Added version-based invalidation**:

   ```typescript
   // New (works in Medusa 2.0)
   await cacheHelper.bustCache(); // Increments version
   ```

3. **Centralized cache logic**:

   ```typescript
   // Old (repeated everywhere)
   const cacheKey = `products:${version}:${hash}`;

   // New (reusable helper)
   const cacheKey = await cacheHelper.generateQueryCacheKey(query);
   ```

## Configuration

### Environment Variables

- `DEFAULT_CACHE_DURATION`: Cache TTL in seconds (default: 7200 = 2 hours)
- Cache module configuration in `medusa-config.js`

### TTL Considerations

- **Short TTL (5-15 minutes)**: Frequently changing data (inventory, prices)
- **Medium TTL (30-60 minutes)**: Moderately stable data (product info, categories)
- **Long TTL (2-6 hours)**: Stable data (collections, customer profiles)

The default 2-hour TTL works well for most use cases, but can be adjusted per cache helper instance.
