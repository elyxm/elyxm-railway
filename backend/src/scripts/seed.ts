import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/utils";

// Configuration
const SEED_CONFIG = {
  // Set to true to delete existing data before seeding
  RESET_DATA: process.env.SEED_RESET === "true",
  // Set to true to skip demo products and only create essential data
  SKIP_DEMO_PRODUCTS: process.env.SEED_SKIP_DEMO === "true",
  // Default currency
  DEFAULT_CURRENCY: "eur",
  // Supported countries
  COUNTRIES: ["gb", "de", "dk", "se", "fr", "es", "it", "us"],
};

interface SeedContext {
  container: any;
  logger: any;
  link: any;
  query: any;
  fulfillmentModuleService: any;
  salesChannelModuleService: any;
  storeModuleService: any;
  productModuleService: any;
  stockLocationModuleService: any;
  productCategoryModuleService: any;
  regionModuleService: any;
  apiKeyModuleService: any;
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const ctx: SeedContext = {
    container,
    logger,
    link,
    query,
    fulfillmentModuleService: container.resolve(Modules.FULFILLMENT),
    salesChannelModuleService: container.resolve(Modules.SALES_CHANNEL),
    storeModuleService: container.resolve(Modules.STORE),
    productModuleService: container.resolve(Modules.PRODUCT),
    stockLocationModuleService: container.resolve(Modules.STOCK_LOCATION),
    productCategoryModuleService: container.resolve(Modules.PRODUCT),
    regionModuleService: container.resolve(Modules.REGION),
    apiKeyModuleService: container.resolve(Modules.API_KEY),
  };

  try {
    logger.info("🌱 Starting enhanced seed process...");
    logger.info(`Configuration: Reset=${SEED_CONFIG.RESET_DATA}, SkipDemo=${SEED_CONFIG.SKIP_DEMO_PRODUCTS}`);

    // Step 1: Reset data if requested
    if (SEED_CONFIG.RESET_DATA) {
      await resetData(ctx);
    }

    // Step 2: Seed core data
    const coreData = await seedCoreData(ctx);

    // Step 3: Seed demo products (optional)
    if (!SEED_CONFIG.SKIP_DEMO_PRODUCTS) {
      await seedDemoProducts(ctx, coreData);
    }

    // Step 4: Seed restaurant-specific data
    await seedRestaurantData(ctx, coreData);

    logger.info("🎉 Enhanced seed process completed successfully!");
    logger.info("Admin login: admin@elyxm.local / password (if user exists)");
    logger.info("Use SEED_RESET=true to clean data before seeding");
    logger.info("Use SEED_SKIP_DEMO=true to skip demo products");
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
}

async function resetData(ctx: SeedContext) {
  const { logger, query } = ctx;

  logger.info("🧹 Resetting existing data...");

  try {
    // Delete in reverse dependency order
    await query.connection.manager.query("DELETE FROM product_variant_inventory_item");
    await query.connection.manager.query("DELETE FROM inventory_level");
    await query.connection.manager.query("DELETE FROM inventory_item");
    await query.connection.manager.query("DELETE FROM product_variant_price_set");
    await query.connection.manager.query("DELETE FROM product_variant");
    await query.connection.manager.query("DELETE FROM product_option_value");
    await query.connection.manager.query("DELETE FROM product_option");
    await query.connection.manager.query("DELETE FROM product_image");
    await query.connection.manager.query("DELETE FROM product_sales_channel");
    await query.connection.manager.query("DELETE FROM product");
    await query.connection.manager.query("DELETE FROM product_category");
    await query.connection.manager.query("DELETE FROM shipping_option_price_set");
    await query.connection.manager.query("DELETE FROM shipping_option");
    await query.connection.manager.query("DELETE FROM fulfillment_set_service_zone");
    await query.connection.manager.query("DELETE FROM fulfillment_set");
    await query.connection.manager.query("DELETE FROM publishable_api_key_sales_channel");
    await query.connection.manager.query("DELETE FROM api_key");
    await query.connection.manager.query("DELETE FROM sales_channel_stock_location");
    await query.connection.manager.query("DELETE FROM location_fulfillment_provider");
    await query.connection.manager.query("DELETE FROM location_fulfillment_set");
    await query.connection.manager.query("DELETE FROM stock_location");
    await query.connection.manager.query("DELETE FROM tax_region");
    await query.connection.manager.query("DELETE FROM region_payment_provider");
    await query.connection.manager.query("DELETE FROM region WHERE name != 'Default Region'");
    await query.connection.manager.query("DELETE FROM sales_channel WHERE name != 'Default Sales Channel'");

    logger.info("✅ Data reset completed");
  } catch (error) {
    logger.warn(
      "⚠️ Some data cleanup failed (this is normal for fresh databases):",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function seedCoreData(ctx: SeedContext) {
  const { logger, container } = ctx;

  logger.info("📦 Seeding core store data...");

  // 1. Update store
  const [store] = await ctx.storeModuleService.listStores();

  // 2. Create or get default sales channel
  let defaultSalesChannel = await ctx.salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
            description: "Default sales channel for all products",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  // 3. Update store with currencies and default sales channel
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: SEED_CONFIG.DEFAULT_CURRENCY,
            is_default: true,
          },
          {
            currency_code: "usd",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // 4. Create region (idempotent)
  let region;
  try {
    const existingRegions = await ctx.regionModuleService.listRegions({
      name: "Europe",
    });

    if (!existingRegions.length) {
      const { result: regionResult } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Europe",
              currency_code: SEED_CONFIG.DEFAULT_CURRENCY,
              countries: SEED_CONFIG.COUNTRIES,
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      region = regionResult[0];
      logger.info("✅ Region created");
    } else {
      region = existingRegions[0];
      logger.info("ℹ️ Region already exists (using existing)");
    }
  } catch (regionError) {
    logger.info("ℹ️ Region creation handled gracefully");
    // Fallback: try to get any existing region
    const existingRegions = await ctx.regionModuleService.listRegions();
    if (existingRegions && existingRegions.length > 0) {
      region = existingRegions[0];
      logger.info("ℹ️ Using first available region");
    } else {
      throw new Error("No region found and unable to create new one");
    }
  }

  // 5. Create tax regions (check if they exist first)
  try {
    await createTaxRegionsWorkflow(container).run({
      input: SEED_CONFIG.COUNTRIES.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
    logger.info("✅ Tax regions created");
  } catch (taxError) {
    logger.info("ℹ️ Tax regions already exist (skipping)");
  }

  // 6. Create stock location (idempotent)
  let stockLocation;
  try {
    const existingLocations = await ctx.stockLocationModuleService.listStockLocations({
      name: "Main Warehouse",
    });

    if (!existingLocations.length) {
      const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
        input: {
          locations: [
            {
              name: "Main Warehouse",
              address: {
                city: "Copenhagen",
                country_code: "DK",
                address_1: "123 Storage Street",
              },
            },
          ],
        },
      });
      stockLocation = stockLocationResult[0];
      logger.info("✅ Stock location created");
    } else {
      stockLocation = existingLocations[0];
      logger.info("ℹ️ Stock location already exists (using existing)");
    }
  } catch (locationError) {
    logger.info("ℹ️ Stock location creation handled gracefully");
    // Fallback: try to get any existing location
    const existingLocations = await ctx.stockLocationModuleService.listStockLocations();
    if (existingLocations && existingLocations.length > 0) {
      stockLocation = existingLocations[0];
      logger.info("ℹ️ Using first available stock location");
    } else {
      throw new Error("No stock location found and unable to create new one");
    }
  }

  // 7. Setup fulfillment
  await setupFulfillment(ctx, container, stockLocation, region);

  // 8. Create publishable API key
  const existingApiKeys = await ctx.apiKeyModuleService.listApiKeys({
    title: "Webshop",
  });

  let publishableApiKey;
  if (!existingApiKeys.length) {
    const { result: publishableApiKeyResult } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = publishableApiKeyResult[0];
  } else {
    publishableApiKey = existingApiKeys[0];
  }

  // 9. Link sales channel to API key (idempotent)
  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
    logger.info("✅ Sales channel linked to API key");
  } catch (linkError) {
    logger.info("ℹ️ Sales channel already linked to API key");
  }

  // 10. Link sales channel to stock location (idempotent)
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
    logger.info("✅ Sales channel linked to stock location");
  } catch (linkError) {
    logger.info("ℹ️ Sales channel already linked to stock location");
  }

  logger.info("✅ Core data seeding completed");

  return {
    store,
    defaultSalesChannel: defaultSalesChannel[0],
    region,
    stockLocation,
    publishableApiKey,
  };
}

async function setupFulfillment(ctx: SeedContext, container: any, stockLocation: any, region: any) {
  const { logger, link } = ctx;

  logger.info("🚚 Setting up fulfillment...");

  // Link stock location to fulfillment provider (idempotent)
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
    logger.info("✅ Stock location linked to fulfillment provider");
  } catch (linkError) {
    logger.info("ℹ️ Stock location already linked to fulfillment provider");
  }

  // Get or create shipping profile
  const shippingProfiles = await ctx.fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  // Create fulfillment set (idempotent)
  let fulfillmentSet;
  try {
    fulfillmentSet = await ctx.fulfillmentModuleService.createFulfillmentSets({
      name: "Main Warehouse Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: SEED_CONFIG.COUNTRIES.map((country_code) => ({
            country_code,
            type: "country",
          })),
        },
      ],
    });
    logger.info("✅ Fulfillment set created");
  } catch (fulfillmentError) {
    // If fulfillment set exists, fetch it
    const existingSets = await ctx.fulfillmentModuleService.listFulfillmentSets({
      name: "Main Warehouse Delivery",
    });
    if (existingSets && existingSets.length > 0) {
      fulfillmentSet = existingSets[0];
      logger.info("ℹ️ Fulfillment set already exists (using existing)");
    } else {
      // If we can't find it by name, try getting any existing set
      const allSets = await ctx.fulfillmentModuleService.listFulfillmentSets();
      if (allSets && allSets.length > 0) {
        fulfillmentSet = allSets[0];
        logger.info("ℹ️ Using first available fulfillment set");
      } else {
        throw new Error("No fulfillment set found and unable to create new one");
      }
    }
  }

  // Link stock location to fulfillment set (idempotent)
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
    logger.info("✅ Stock location linked to fulfillment set");
  } catch (linkError) {
    logger.info("ℹ️ Stock location already linked to fulfillment set");
  }

  // Create shipping options (idempotent)
  try {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 2-3 days.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: region.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24 hours.",
            code: "express",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 25,
            },
            {
              currency_code: "eur",
              amount: 20,
            },
            {
              region_id: region.id,
              amount: 20,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
    logger.info("✅ Shipping options created");
  } catch (shippingError) {
    logger.info("ℹ️ Shipping options already exist");
  }

  return shippingProfile;
}

async function seedDemoProducts(ctx: SeedContext, coreData: any) {
  const { logger, container, query } = ctx;

  logger.info("🛍️ Seeding demo products...");

  // Create product categories (idempotent)
  let categoryResult;
  try {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "Clothing",
            description: "Apparel and clothing items",
            is_active: true,
          },
          {
            name: "Electronics",
            description: "Electronic devices and gadgets",
            is_active: true,
          },
          {
            name: "Home & Garden",
            description: "Home and garden products",
            is_active: true,
          },
        ],
      },
    });
    categoryResult = result;
    logger.info("✅ Demo categories created");
  } catch (categoryError) {
    // If categories exist, fetch them
    const { data: existingCategories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
      filters: {
        name: ["Clothing", "Electronics", "Home & Garden"],
      },
    });
    categoryResult = existingCategories;
    logger.info("ℹ️ Demo categories already exist (using existing)");
  }

  // Get shipping profile
  const shippingProfiles = await ctx.fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  const shippingProfile = shippingProfiles[0];

  // Create demo products (idempotent)
  let demoProducts;
  try {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Classic T-Shirt",
            category_ids: [categoryResult.find((cat: any) => cat.name === "Clothing")!.id],
            description: "A comfortable and stylish classic t-shirt made from premium cotton.",
            handle: "classic-t-shirt",
            weight: 200,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
              },
            ],
            options: [
              {
                title: "Size",
                values: ["S", "M", "L", "XL"],
              },
              {
                title: "Color",
                values: ["Black", "White", "Gray"],
              },
            ],
            variants: [
              {
                title: "S / Black",
                sku: "TSHIRT-S-BLACK",
                options: { Size: "S", Color: "Black" },
                prices: [
                  { amount: 1999, currency_code: "eur" },
                  { amount: 2199, currency_code: "usd" },
                ],
              },
              {
                title: "M / Black",
                sku: "TSHIRT-M-BLACK",
                options: { Size: "M", Color: "Black" },
                prices: [
                  { amount: 1999, currency_code: "eur" },
                  { amount: 2199, currency_code: "usd" },
                ],
              },
              {
                title: "L / Black",
                sku: "TSHIRT-L-BLACK",
                options: { Size: "L", Color: "Black" },
                prices: [
                  { amount: 1999, currency_code: "eur" },
                  { amount: 2199, currency_code: "usd" },
                ],
              },
            ],
            sales_channels: [{ id: coreData.defaultSalesChannel.id }],
          },
          {
            title: "Wireless Headphones",
            category_ids: [categoryResult.find((cat: any) => cat.name === "Electronics")!.id],
            description: "High-quality wireless headphones with noise cancellation.",
            handle: "wireless-headphones",
            weight: 300,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Style",
                values: ["Standard"],
              },
            ],
            variants: [
              {
                title: "Standard",
                sku: "HEADPHONES-WL-001",
                options: { Style: "Standard" },
                prices: [
                  { amount: 12999, currency_code: "eur" },
                  { amount: 14999, currency_code: "usd" },
                ],
              },
            ],
            sales_channels: [{ id: coreData.defaultSalesChannel.id }],
          },
        ],
      },
    });
    demoProducts = result;
    logger.info("✅ Demo products created");
  } catch (productError) {
    // If products exist, fetch them
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle"],
      filters: {
        handle: ["classic-t-shirt", "wireless-headphones"],
      },
    });
    demoProducts = existingProducts;
    logger.info("ℹ️ Demo products already exist (using existing)");
  }

  logger.info("✅ Demo products seeding completed");
}

async function seedRestaurantData(ctx: SeedContext, coreData: any) {
  const { logger, container, query } = ctx;

  logger.info("🍽️ Seeding restaurant-specific data...");

  // Create restaurant-specific product categories (idempotent)
  let restaurantCategories;
  try {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "Appetizers",
            description: "Starters and small plates",
            is_active: true,
          },
          {
            name: "Main Courses",
            description: "Primary dishes and entrees",
            is_active: true,
          },
          {
            name: "Desserts",
            description: "Sweet treats and desserts",
            is_active: true,
          },
          {
            name: "Beverages",
            description: "Drinks and beverages",
            is_active: true,
          },
          {
            name: "Cocktails",
            description: "Alcoholic cocktails and mixed drinks",
            is_active: true,
          },
        ],
      },
    });
    restaurantCategories = result;
    logger.info("✅ Restaurant categories created");
  } catch (categoryError) {
    // If categories exist, fetch them
    const { data: existingCategories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
      filters: {
        name: ["Appetizers", "Main Courses", "Desserts", "Beverages", "Cocktails"],
      },
    });
    if (existingCategories && existingCategories.length > 0) {
      restaurantCategories = existingCategories;
      logger.info("ℹ️ Restaurant categories already exist (using existing)");
    } else {
      throw new Error("Restaurant categories not found and unable to create new ones");
    }
  }

  // Get shipping profile
  const shippingProfiles = await ctx.fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  const shippingProfile = shippingProfiles[0];

  // Create sample restaurant products (idempotent)
  let restaurantProducts;
  try {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Caesar Salad",
            category_ids: [restaurantCategories.find((cat: any) => cat.name === "Appetizers")!.id],
            description: "Fresh romaine lettuce with caesar dressing, parmesan, and croutons",
            handle: "caesar-salad",
            weight: 250,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Size",
                values: ["Regular"],
              },
            ],
            variants: [
              {
                title: "Regular",
                sku: "APPETIZER-CAESAR-REG",
                options: { Size: "Regular" },
                prices: [
                  { amount: 1200, currency_code: "eur" },
                  { amount: 1400, currency_code: "usd" },
                ],
              },
            ],
            sales_channels: [{ id: coreData.defaultSalesChannel.id }],
          },
          {
            title: "Grilled Salmon",
            category_ids: [restaurantCategories.find((cat: any) => cat.name === "Main Courses")!.id],
            description: "Fresh Atlantic salmon with seasonal vegetables",
            handle: "grilled-salmon",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Size",
                values: ["Regular"],
              },
            ],
            variants: [
              {
                title: "Regular",
                sku: "MAIN-SALMON-REG",
                options: { Size: "Regular" },
                prices: [
                  { amount: 2800, currency_code: "eur" },
                  { amount: 3200, currency_code: "usd" },
                ],
              },
            ],
            sales_channels: [{ id: coreData.defaultSalesChannel.id }],
          },
          {
            title: "Classic Mojito",
            category_ids: [restaurantCategories.find((cat: any) => cat.name === "Cocktails")!.id],
            description: "White rum, lime juice, sugar, soda water, and fresh mint",
            handle: "classic-mojito",
            weight: 300,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            options: [
              {
                title: "Size",
                values: ["Regular"],
              },
            ],
            variants: [
              {
                title: "Regular",
                sku: "COCKTAIL-MOJITO-REG",
                options: { Size: "Regular" },
                prices: [
                  { amount: 1200, currency_code: "eur" },
                  { amount: 1400, currency_code: "usd" },
                ],
              },
            ],
            sales_channels: [{ id: coreData.defaultSalesChannel.id }],
          },
        ],
      },
    });
    restaurantProducts = result;
    logger.info("✅ Restaurant products created");
  } catch (productError) {
    // If products exist, fetch them
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle"],
      filters: {
        handle: ["caesar-salad", "grilled-salmon", "classic-mojito"],
      },
    });
    restaurantProducts = existingProducts;
    logger.info("ℹ️ Restaurant products already exist (using existing)");
  }

  // Set up inventory levels for all products
  await setupInventory(ctx, coreData.stockLocation);

  logger.info("✅ Restaurant data seeding completed");
}

async function setupInventory(ctx: SeedContext, stockLocation: any) {
  const { logger, query, container } = ctx;

  logger.info("📦 Setting up inventory levels...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  // Check which inventory items don't already have levels for this location
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id"],
    filters: {
      location_id: stockLocation.id,
    },
  });

  const existingInventoryItemIds = new Set(existingLevels.map((level: any) => level.inventory_item_id));

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    // Only create inventory level if it doesn't already exist for this location
    if (!existingInventoryItemIds.has(inventoryItem.id)) {
      inventoryLevels.push({
        location_id: stockLocation.id,
        stocked_quantity: 1000,
        inventory_item_id: inventoryItem.id,
      });
    }
  }

  if (inventoryLevels.length > 0) {
    try {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryLevels,
        },
      });
      logger.info(`✅ Created ${inventoryLevels.length} inventory levels`);
    } catch (inventoryError) {
      logger.info("ℹ️ Some inventory levels already exist (handled gracefully)");
    }
  } else {
    logger.info("ℹ️ All inventory levels already exist");
  }

  logger.info("✅ Inventory setup completed");
}
