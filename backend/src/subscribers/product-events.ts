import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { ICacheService } from "@medusajs/types";
import { ModuleRegistrationName } from "@medusajs/utils";
import { DEFAULT_CACHE_DURATION, PRODUCTS_CACHE_VERSION_KEY } from "../lib/constants";

export default async function productEventsHandler({ container }: SubscriberArgs<Record<string, any>>) {
  const cacheService: ICacheService = container.resolve(ModuleRegistrationName.CACHE);
  const logger = container.resolve("logger");

  let cacheVersion = await cacheService.get<number>(PRODUCTS_CACHE_VERSION_KEY);

  // Simply increment the cache version without trying to delete old keys
  // The cache middleware will naturally ignore stale cached entries since
  // they'll have old version numbers in their keys
  const newCacheVersion = (cacheVersion || 0) + 1;

  logger.info(`[${new Date().toISOString()}] Busting product cache. New version: ${newCacheVersion}`);
  await cacheService.set(PRODUCTS_CACHE_VERSION_KEY, newCacheVersion, DEFAULT_CACHE_DURATION);
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
  ],
  context: {
    subscriberId: "product-events-handler",
  },
};
