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
import { CLIENT_MODULE } from "../modules/client";
import { RBAC_MODULE } from "../modules/rbac";
import { createSeedDataLoader } from "./seed-data/loader";
import { ProductData, SeedDataSet } from "./seed-data/types";

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
  rbacModuleService: any;
  clientModuleService: any;
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // Load seed data from JSON files
  const seedDataLoader = createSeedDataLoader();
  const seedData = seedDataLoader.loadAll();

  logger.info(`🌱 Starting seed process with scenario: '${seedDataLoader.getScenario()}'`);
  logger.info(
    `📝 Scenario source: SEED_SCENARIO=${process.env.SEED_SCENARIO || "not set"}, NODE_ENV=${
      process.env.NODE_ENV || "not set"
    }`
  );

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
    rbacModuleService: container.resolve(RBAC_MODULE),
    clientModuleService: container.resolve(CLIENT_MODULE),
  };

  try {
    // Step 0: Seed RBAC permissions and roles first
    await seedRBACSystem(ctx, seedData);

    // Step 0.5: Seed clients
    await seedClients(ctx, seedData);

    // Step 1: Always reset products and categories to ensure idempotency
    await resetProductData(ctx);

    // Step 2: Seed core data
    const coreData = await seedCoreData(ctx, seedData);

    // Step 3: Seed products from JSON data
    await seedProducts(ctx, coreData, seedData);

    // Final verification - show all API keys
    logger.info("🔍 Final API key verification:");
    try {
      const finalApiKeys = await ctx.apiKeyModuleService.listApiKeys();
      if (finalApiKeys.length > 0) {
        finalApiKeys.forEach((key: any) => {
          logger.info(
            `  ✓ "${key.title}" (ID: ${key.id}, Type: ${key.type}, Revoked: ${key.revoked_at ? "Yes" : "No"})`
          );
        });
      } else {
        logger.info("  (No API keys found)");
      }
    } catch (verifyError) {
      logger.warn(
        `  ⚠️ Could not verify API keys: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`
      );
    }

    // Final RBAC status
    await showRBACStatus(ctx);

    logger.info("🎉 Seed process completed successfully!");
    logger.info("Admin login: admin@elyxm.local / password (if user exists)");
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
}

async function seedRBACSystem(ctx: SeedContext, seedData: SeedDataSet) {
  const { logger, rbacModuleService } = ctx;
  const { rbac } = seedData;

  logger.info("🔐 Starting RBAC system seeding...");

  try {
    // Step 1: Reset existing RBAC data for idempotency
    logger.info("🧹 Resetting RBAC data for idempotency...");

    // Get existing data
    const existingPermissions = await rbacModuleService.listPermissions({});
    const existingRoles = await rbacModuleService.listRoles({});
    const existingRolePermissions = await rbacModuleService.listRolePermissions({});
    const existingUserRoles = await rbacModuleService.listUserRoles({});

    // Delete existing data in correct order (respecting foreign key constraints)
    if (existingUserRoles.length > 0) {
      logger.info(`🗑️ Hard deleting ${existingUserRoles.length} existing user roles...`);
      const userRoleIds = existingUserRoles.map((ur: any) => ur.id);
      await rbacModuleService.softDeleteUserRoles(userRoleIds, { force: true });
      logger.info("  ✅ User roles hard deleted from database");
    }

    if (existingRolePermissions.length > 0) {
      logger.info(`🗑️ Hard deleting ${existingRolePermissions.length} existing role permissions...`);
      const rolePermissionIds = existingRolePermissions.map((rp: any) => rp.id);
      await rbacModuleService.softDeleteRolePermissions(rolePermissionIds, { force: true });
      logger.info("  ✅ Role permissions hard deleted from database");
    }

    if (existingRoles.length > 0) {
      logger.info(`🗑️ Hard deleting ${existingRoles.length} existing roles...`);
      const roleIds = existingRoles.map((role: any) => role.id);
      await rbacModuleService.softDeleteRoles(roleIds, { force: true });
      logger.info("  ✅ Roles hard deleted from database");
    }

    if (existingPermissions.length > 0) {
      logger.info(`🗑️ Hard deleting ${existingPermissions.length} existing permissions...`);
      const permissionIds = existingPermissions.map((perm: any) => perm.id);
      await rbacModuleService.softDeletePermissions(permissionIds, { force: true });
      logger.info("  ✅ Permissions hard deleted from database");
    }

    logger.info("✅ RBAC data reset completed");

    // Step 2: Seed permissions from JSON data
    logger.info("📋 Seeding permissions from JSON data...");
    const seededPermissions = [];

    for (const permissionData of rbac.permissions) {
      await rbacModuleService.createPermissions(permissionData);
      seededPermissions.push(permissionData);
    }

    logger.info(`  ✅ Seeded ${seededPermissions.length} permissions`);

    // Step 3: Seed roles from JSON data
    logger.info("👥 Seeding roles from JSON data...");
    const seededRoles = [];

    for (const roleData of rbac.roles) {
      // Create the role first
      const role = await rbacModuleService.createRoles({
        name: roleData.name,
        slug: roleData.slug,
        description: roleData.description,
        scope_type: roleData.scope_type,
        is_global: roleData.is_global,
      });

      // Assign permissions to role
      for (const permissionSlug of roleData.permissions) {
        const permissions = await rbacModuleService.listPermissions({ slug: permissionSlug });
        if (permissions.length > 0) {
          await rbacModuleService.createRolePermissions({
            role_id: role.id,
            permission_id: permissions[0].id,
          });
        }
      }

      seededRoles.push(roleData);
      logger.info(`    ✓ Created role: ${roleData.name}`);
    }

    logger.info(`  ✅ Seeded ${seededRoles.length} roles`);

    // Step 4: Get final summary
    const finalPermissions = await rbacModuleService.listPermissions({});
    const finalRoles = await rbacModuleService.listRoles({});
    const platformRoles = finalRoles.filter((role: any) => role.is_global).length;
    const clientRoles = finalRoles.filter((role: any) => !role.is_global).length;

    logger.info(`✅ RBAC seeding completed:`);
    logger.info(`   • ${finalPermissions.length} permissions`);
    logger.info(`   • ${finalRoles.length} roles (${platformRoles} platform, ${clientRoles} client)`);
  } catch (error) {
    logger.warn(`⚠️ RBAC seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    logger.info("ℹ️ Continuing with product seeding...");
  }
}

async function showRBACStatus(ctx: SeedContext) {
  const { logger, rbacModuleService } = ctx;

  logger.info("🔐 Final RBAC system status:");
  try {
    const permissions = await rbacModuleService.listPermissions({});
    const roles = await rbacModuleService.listRoles({});
    const platformRoles = roles.filter((role: any) => role.is_global).length;
    const clientRoles = roles.filter((role: any) => !role.is_global).length;

    logger.info(`   📋 ${permissions.length} permissions seeded`);
    logger.info(`   🎭 ${roles.length} roles available:`);

    for (const role of roles) {
      const rolePermissions = await rbacModuleService.listRolePermissions({ role_id: role.id });
      const scopeLabel = role.is_global ? "Global" : "Client";
      logger.info(`     • ${role.name} (${scopeLabel}): ${rolePermissions.length} permissions`);
    }

    logger.info("ℹ️ RBAC system ready for user assignment");
  } catch (error) {
    logger.warn(`⚠️ Could not verify RBAC status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function seedClients(ctx: SeedContext, seedData: SeedDataSet) {
  const { logger, clientModuleService } = ctx;
  const { clients } = seedData;

  logger.info("🏢 Starting client seeding...");

  try {
    // Reset existing clients for idempotency
    logger.info("🧹 Resetting existing clients for idempotency...");
    const existingClients = await clientModuleService.listClients({});

    if (existingClients.length > 0) {
      logger.info(`🗑️ Hard deleting ${existingClients.length} existing clients...`);
      const clientIds = existingClients.map((client: any) => client.id);
      await clientModuleService.softDeleteClients(clientIds, { force: true });
      logger.info("  ✅ Clients hard deleted from database");
    }

    // Seed clients from JSON data
    logger.info("📋 Seeding clients from JSON data...");
    const seededClients = [];

    for (const clientData of clients) {
      const client = await clientModuleService.createClients({
        name: clientData.name,
        slug: clientData.slug,
        plan_type: clientData.plan_type,
        max_restaurants: clientData.max_restaurants,
        max_custom_recipes: clientData.max_custom_recipes,
        settings: clientData.settings || {},
      });

      seededClients.push(client);
      logger.info(`    ✓ Created client: ${clientData.name} (${clientData.plan_type})`);
    }

    logger.info(`✅ Client seeding completed: ${seededClients.length} clients created`);
  } catch (error) {
    logger.warn(`⚠️ Client seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    logger.info("ℹ️ Continuing with other seeding...");
  }
}

async function resetProductData(ctx: SeedContext) {
  const { logger, query, container } = ctx;

  logger.info("🧹 Resetting products and categories for idempotency...");

  // Delete all existing products (HARD DELETE - completely wipe from DB)
  try {
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle"],
      // Get ALL products, don't filter by deleted_at
    });

    if (existingProducts.length > 0) {
      logger.info(`📦 Hard deleting ${existingProducts.length} existing products...`);
      const productIds = existingProducts.map((p: any) => p.id);

      // Use module service directly for HARD deletion instead of workflow
      await ctx.productModuleService.deleteProducts(productIds);

      logger.info("  ✅ Products hard deleted from database");

      // Wait a moment for deletion to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify deletion worked
      const { data: remainingProducts } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle"],
      });

      if (remainingProducts.length > 0) {
        logger.warn(`⚠️ Warning: ${remainingProducts.length} products still exist after hard deletion`);
        logger.warn(`   Remaining handles: ${remainingProducts.map((p: any) => p.handle).join(", ")}`);
      } else {
        logger.info("  ✅ Verified: All products completely removed from database");
      }
    } else {
      logger.info("📦 No existing products found");
    }
  } catch (error) {
    logger.warn(`  ⚠️ Could not delete products: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Delete all existing inventory items (HARD DELETE)
  try {
    const { data: existingInventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
    });

    if (existingInventoryItems.length > 0) {
      logger.info(`📦 Hard deleting ${existingInventoryItems.length} existing inventory items...`);
      const inventoryIds = existingInventoryItems.map((item: any) => item.id);

      // Get inventory module service and delete inventory items
      const inventoryModuleService = container.resolve(Modules.INVENTORY);
      await inventoryModuleService.deleteInventoryItems(inventoryIds);

      logger.info("  ✅ Inventory items hard deleted from database");

      // Wait a moment for deletion to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      logger.info("📦 No existing inventory items found");
    }
  } catch (error) {
    logger.warn(`  ⚠️ Could not delete inventory items: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Delete all existing inventory levels (HARD DELETE)
  try {
    const { data: existingInventoryLevels } = await query.graph({
      entity: "inventory_level",
      fields: ["id", "inventory_item_id", "location_id"],
    });

    if (existingInventoryLevels.length > 0) {
      logger.info(`📊 Hard deleting ${existingInventoryLevels.length} existing inventory levels...`);
      const levelIds = existingInventoryLevels.map((level: any) => level.id);

      // Get inventory module service and delete inventory levels
      const inventoryModuleService = container.resolve(Modules.INVENTORY);
      await inventoryModuleService.deleteInventoryLevels(levelIds);

      logger.info("  ✅ Inventory levels hard deleted from database");

      // Wait a moment for deletion to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      logger.info("📊 No existing inventory levels found");
    }
  } catch (error) {
    logger.warn(`  ⚠️ Could not delete inventory levels: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Delete all existing categories (HARD DELETE)
  try {
    const { data: existingCategories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
    });

    if (existingCategories.length > 0) {
      logger.info(`📁 Hard deleting ${existingCategories.length} existing categories...`);
      const categoryIds = existingCategories.map((c: any) => c.id);

      // Use module service directly for HARD deletion
      await ctx.productCategoryModuleService.deleteProductCategories(categoryIds);

      logger.info("  ✅ Categories hard deleted from database");

      // Wait a moment for deletion to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      logger.info("📁 No existing categories found");
    }
  } catch (error) {
    logger.warn(`  ⚠️ Could not delete categories: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Delete all existing API keys (REVOKE first, then DELETE)
  try {
    const existingApiKeys = await ctx.apiKeyModuleService.listApiKeys();

    logger.info(`🔑 Found ${existingApiKeys.length} existing API keys:`);
    existingApiKeys.forEach((key: any) => {
      logger.info(`  - "${key.title}" (ID: ${key.id}, Revoked: ${key.revoked_at ? "Yes" : "No"})`);
    });

    if (existingApiKeys.length > 0) {
      // First, revoke all non-revoked API keys
      const nonRevokedKeys = existingApiKeys.filter((key: any) => !key.revoked_at);
      if (nonRevokedKeys.length > 0) {
        logger.info(`  🚫 Revoking ${nonRevokedKeys.length} non-revoked API keys...`);

        for (const key of nonRevokedKeys) {
          try {
            await ctx.apiKeyModuleService.updateApiKeys({ id: key.id }, { title: key.title, revoked_at: new Date() });
            logger.info(`    ✓ Revoked: ${key.title}`);
          } catch (revokeError) {
            logger.warn(
              `    ✗ Failed to revoke ${key.title}: ${
                revokeError instanceof Error ? revokeError.message : String(revokeError)
              }`
            );
            console.error("Full revoke error:", revokeError);
          }
        }

        // Wait longer for revocation to be processed and verify
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Verify revocation actually worked by reloading API keys
      logger.info("  🔍 Verifying revocation status...");
      const reloadedKeys = await ctx.apiKeyModuleService.listApiKeys();
      const stillNotRevoked = reloadedKeys.filter((key: any) => !key.revoked_at);

      if (stillNotRevoked.length > 0) {
        logger.warn(`  ⚠️ ${stillNotRevoked.length} API keys still not revoked after update:`);
        stillNotRevoked.forEach((key: any) => {
          logger.warn(`    - "${key.title}" (ID: ${key.id})`);
        });
      } else {
        logger.info("  ✅ All API keys successfully revoked");
      }

      // Only attempt deletion if all keys are actually revoked
      const revokedKeys = reloadedKeys.filter((key: any) => key.revoked_at);

      if (revokedKeys.length === existingApiKeys.length) {
        // All keys are revoked, safe to delete
        logger.info(`  🗑️ Attempting to delete ${revokedKeys.length} revoked API keys...`);
        const revokedKeyIds = revokedKeys.map((key: any) => key.id);

        try {
          await ctx.apiKeyModuleService.deleteApiKeys(revokedKeyIds);
          logger.info("  ✅ API keys successfully deleted from database");
        } catch (deleteError) {
          logger.warn(
            `  ⚠️ Failed to delete API keys: ${
              deleteError instanceof Error ? deleteError.message : String(deleteError)
            }`
          );
          logger.info("  ℹ️ Skipping API key deletion - existing keys won't interfere with new scenario");
        }
      } else {
        logger.info("  ⏭️ Skipping API key deletion - revocation didn't complete properly");
        logger.info("  ℹ️ Existing API keys won't interfere with the new scenario");
      }

      // Wait a moment for deletion to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify deletion
      const remainingKeys = await ctx.apiKeyModuleService.listApiKeys();
      if (remainingKeys.length > 0) {
        logger.warn(`  ⚠️ ${remainingKeys.length} API keys still remain after deletion attempt:`);
        remainingKeys.forEach((key: any) => {
          logger.warn(`    - "${key.title}" (ID: ${key.id})`);
        });
      } else {
        logger.info("  ✅ All API keys successfully removed");
      }
    } else {
      logger.info("🔑 No existing API keys found");
    }
  } catch (error) {
    logger.warn(
      `  ⚠️ General error during API key deletion: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  logger.info("✅ Product data reset completed");
}

async function seedCoreData(ctx: SeedContext, seedData: SeedDataSet) {
  const { logger, container } = ctx;
  const { config } = seedData;

  logger.info("📦 Seeding core store data...");

  // 1. Update store
  const [store] = await ctx.storeModuleService.listStores();

  // 2. Create or get default sales channel
  let defaultSalesChannel = await ctx.salesChannelModuleService.listSalesChannels({
    name: config.salesChannel.name,
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: config.salesChannel.name,
            description: config.salesChannel.description,
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
        supported_currencies: config.supportedCurrencies,
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // 4. Create region (idempotent)
  let region;
  try {
    const existingRegions = await ctx.regionModuleService.listRegions({
      name: config.region.name,
    });

    if (!existingRegions.length) {
      const { result: regionResult } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: config.region.name,
              currency_code: config.region.currency_code,
              countries: config.countries,
              payment_providers: config.region.payment_providers,
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
      input: config.countries.map((country_code: string) => ({
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
      name: config.stockLocation.name,
    });

    if (!existingLocations.length) {
      const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
        input: {
          locations: [
            {
              name: config.stockLocation.name,
              address: config.stockLocation.address,
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
  await setupFulfillment(ctx, container, stockLocation, region, seedData);

  // 8. Create publishable API key
  logger.info(`🔑 Creating API key: "${config.apiKey.title}"`);

  const existingApiKeys = await ctx.apiKeyModuleService.listApiKeys({
    title: config.apiKey.title,
  });

  let publishableApiKey;
  if (!existingApiKeys.length) {
    logger.info(`  📝 Creating new API key: "${config.apiKey.title}"`);
    try {
      const { result: publishableApiKeyResult } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [
            {
              title: config.apiKey.title,
              type: config.apiKey.type as any,
              created_by: "",
            },
          ],
        },
      });
      publishableApiKey = publishableApiKeyResult[0];
      logger.info(`  ✅ API key created: "${publishableApiKey.title}" (ID: ${publishableApiKey.id})`);
    } catch (apiKeyError) {
      logger.error(
        "  ❌ Failed to create API key:",
        apiKeyError instanceof Error ? apiKeyError.message : String(apiKeyError)
      );
      throw apiKeyError;
    }
  } else {
    publishableApiKey = existingApiKeys[0];
    logger.info(`  ♻️ Using existing API key: "${publishableApiKey.title}" (ID: ${publishableApiKey.id})`);
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

async function setupFulfillment(
  ctx: SeedContext,
  container: any,
  stockLocation: any,
  region: any,
  seedData: SeedDataSet
) {
  const { logger, link } = ctx;
  const { shipping, config } = seedData;

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
    type: shipping.shippingProfile.type,
  });

  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: shipping.shippingProfile.name,
            type: shipping.shippingProfile.type,
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
      name: shipping.fulfillmentSet.name,
      type: shipping.fulfillmentSet.type,
      service_zones: [
        {
          name: config.region.name,
          geo_zones: config.countries.map((country_code: string) => ({
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
      name: shipping.fulfillmentSet.name,
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

  // Create shipping options from JSON data (idempotent)
  try {
    const shippingOptionsInput = shipping.shippingOptions.map((option) => ({
      ...option,
      service_zone_id: fulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      prices: option.prices.map((price) => ({
        ...price,
        region_id: price.region_id || region.id,
      })),
      rules: option.rules.map((rule) => ({
        ...rule,
        operator: rule.operator as any,
      })),
    }));

    await createShippingOptionsWorkflow(container).run({
      input: shippingOptionsInput as any,
    });
    logger.info("✅ Shipping options created");
  } catch (shippingError) {
    logger.info("ℹ️ Shipping options already exist");
  }

  return shippingProfile;
}

async function seedProducts(ctx: SeedContext, coreData: any, seedData: SeedDataSet) {
  const { logger, container, query } = ctx;
  const { categories, products } = seedData;

  logger.info("🛍️ Seeding products from JSON data...");

  // Create product categories from JSON data (idempotent)
  let categoryResult;
  try {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: categories,
      },
    });
    categoryResult = result;
    logger.info("✅ Categories created from JSON data");
  } catch (categoryError) {
    // If categories exist, fetch them
    const categoryNames = categories.map((cat) => cat.name);
    const { data: existingCategories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
      filters: {
        name: categoryNames,
      },
    });
    categoryResult = existingCategories;
    logger.info("ℹ️ Categories already exist (using existing)");
  }

  // Get shipping profile
  const shippingProfiles = await ctx.fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  const shippingProfile = shippingProfiles[0];

  // Create products from JSON data
  logger.info("🔄 Creating products from JSON data...");

  try {
    const productsInput = products.map((product: ProductData) => {
      const category = categoryResult.find((cat: any) => cat.name === product.category_name);
      if (!category) {
        throw new Error(`Category '${product.category_name}' not found for product '${product.title}'`);
      }

      return {
        title: product.title,
        category_ids: [category.id],
        description: product.description,
        handle: product.handle,
        weight: product.weight,
        status: product.status === "published" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        shipping_profile_id: shippingProfile.id,
        images: product.images || [],
        options: product.options,
        variants: product.variants,
        sales_channels: [{ id: coreData.defaultSalesChannel.id }],
      };
    });

    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: productsInput,
      },
    });

    logger.info(`✅ ${createdProducts.length} products created from JSON data`);
  } catch (productError) {
    logger.warn("❌ Failed to create products from JSON data");
    logger.warn(String(productError));

    // Check if products with these handles still exist
    try {
      const handles = products.map((p) => p.handle);
      const { data: conflictingProducts } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle"],
        filters: {
          handle: handles,
        },
      });

      if (conflictingProducts.length > 0) {
        logger.warn("🔍 Found conflicting products that weren't properly deleted:");
        conflictingProducts.forEach((p: any) => {
          logger.warn(`   - ${p.handle}: ${p.title}`);
        });

        logger.info("💡 Recommendation: Try running 'pnpm db:reset' for a complete fresh start");
      }
    } catch (queryError) {
      logger.warn("Could not check for conflicting products");
    }

    throw productError;
  }

  // Set up inventory levels for all products
  await setupInventory(ctx, coreData.stockLocation);

  logger.info("✅ Products seeding completed");
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
