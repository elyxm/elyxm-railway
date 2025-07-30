import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { ICacheService } from "@medusajs/types";
import { ModuleRegistrationName } from "@medusajs/utils";
import { PRODUCTS_CACHE_VERSION_KEY } from "../lib/constants";

export default async function productEventsHandler({ container }: SubscriberArgs<Record<string, any>>) {
  const cacheService: ICacheService = container.resolve(ModuleRegistrationName.CACHE);
  const logger = container.resolve("logger");

  let cacheVersion = await cacheService.get<number>(PRODUCTS_CACHE_VERSION_KEY);
  if (cacheVersion === null) {
    cacheVersion = 1;
  } else {
    cacheVersion++;
  }

  logger.info(`[${new Date().toISOString()}] Busting product cache. New version: ${cacheVersion}`);
  await cacheService.set(PRODUCTS_CACHE_VERSION_KEY, cacheVersion, 24 * 60 * 60); // 24 hours in seconds
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
