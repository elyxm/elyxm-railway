import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { ICacheService } from "@medusajs/types";
import { ModuleRegistrationName } from "@medusajs/utils";
import { createCacheHelper } from "../api/utils/cache-helper";
import { CACHE_CONFIGS } from "../lib/constants";

export default async function productEventsHandler({ container }: SubscriberArgs<Record<string, any>>) {
  const cacheService: ICacheService = container.resolve(ModuleRegistrationName.CACHE);
  const logger = container.resolve("logger");

  // Create cache helper for products
  const productCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.PRODUCTS, { logger });

  // Bust the product cache - this will increment the version
  await productCacheHelper.bustCache();
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
