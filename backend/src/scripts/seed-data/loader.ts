import { readFileSync } from "fs";
import { join } from "path";
import {
  ClientData,
  PermissionData,
  ProductCategory,
  ProductData,
  RBACData,
  RoleData,
  SeedConfig,
  SeedDataSet,
  ShippingData,
} from "./types";

export class SeedDataLoader {
  private basePath: string;
  private scenario: string;

  constructor(scenario: string = "default") {
    this.scenario = scenario;
    this.basePath = join(__dirname, scenario);
  }

  /**
   * Load a JSON file and parse it with type checking
   */
  private loadJsonFile<T>(filename: string): T {
    try {
      const filePath = join(this.basePath, filename);
      const fileContent = readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent) as T;
    } catch (error) {
      throw new Error(
        `Failed to load ${filename} for scenario '${this.scenario}': ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Load the configuration file
   */
  loadConfig(): SeedConfig {
    return this.loadJsonFile<SeedConfig>("config.json");
  }

  /**
   * Load the categories file
   */
  loadCategories(): ProductCategory[] {
    return this.loadJsonFile<ProductCategory[]>("categories.json");
  }

  /**
   * Load the products file
   */
  loadProducts(): ProductData[] {
    return this.loadJsonFile<ProductData[]>("products.json");
  }

  /**
   * Load the shipping configuration file
   */
  loadShipping(): ShippingData {
    return this.loadJsonFile<ShippingData>("shipping.json");
  }

  /**
   * Load the permissions file
   */
  loadPermissions(): PermissionData[] {
    return this.loadJsonFile<PermissionData[]>("permissions.json");
  }

  /**
   * Load the roles file
   */
  loadRoles(): RoleData[] {
    return this.loadJsonFile<RoleData[]>("roles.json");
  }

  /**
   * Load the clients file
   */
  loadClients(): ClientData[] {
    return this.loadJsonFile<ClientData[]>("clients.json");
  }

  /**
   * Load RBAC data (permissions and roles)
   */
  loadRBAC(): RBACData {
    return {
      permissions: this.loadPermissions(),
      roles: this.loadRoles(),
    };
  }

  /**
   * Load all seed data as a complete dataset
   */
  loadAll(): SeedDataSet {
    return {
      config: this.loadConfig(),
      categories: this.loadCategories(),
      products: this.loadProducts(),
      shipping: this.loadShipping(),
      rbac: this.loadRBAC(),
      clients: this.loadClients(),
    };
  }

  /**
   * Get the current scenario name
   */
  getScenario(): string {
    return this.scenario;
  }

  /**
   * Check if a scenario exists by attempting to load its config
   */
  static scenarioExists(scenario: string): boolean {
    try {
      const loader = new SeedDataLoader(scenario);
      loader.loadConfig();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available scenarios by checking directory structure
   */
  static getAvailableScenarios(): string[] {
    const fs = require("fs");
    const path = require("path");

    const seedDataPath = __dirname;

    try {
      const items = fs.readdirSync(seedDataPath, { withFileTypes: true });
      return items
        .filter((item: any) => item.isDirectory())
        .map((item: any) => item.name)
        .filter((name: string) => this.scenarioExists(name));
    } catch {
      return ["default"];
    }
  }
}

/**
 * Get the seed data scenario from environment variable or default
 */
export function getSeedScenario(): string {
  const scenario = process.env.SEED_SCENARIO || (process.env.NODE_ENV === "test" ? "testing" : "default");

  if (!SeedDataLoader.scenarioExists(scenario)) {
    console.warn(`Seed scenario '${scenario}' not found, falling back to 'default'`);
    return "default";
  }

  return scenario;
}

/**
 * Create a seed data loader for the current scenario
 */
export function createSeedDataLoader(scenario?: string): SeedDataLoader {
  const actualScenario = scenario || getSeedScenario();
  return new SeedDataLoader(actualScenario);
}
