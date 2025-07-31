import { ActionType, ResourceType } from "../../modules/rbac/types/common";
import {
  extractClientContext,
  extractClientIdFromBody,
  extractClientIdFromParams,
  requirePermission,
} from "../utils/permission-middleware";

// Define route configuration type based on what MedusaJS expects
interface AdminRouteConfig {
  matcher: string;
  method?: string[];
  middlewares?: Array<(req: any, res: any, next: any) => any>;
}

/**
 * Route-specific permission configurations for admin endpoints.
 * This keeps the main middleware file clean and provides centralized
 * permission management for all admin routes.
 */
export const ADMIN_ROUTE_PERMISSIONS: AdminRouteConfig[] = [
  // Client Management Routes (Platform Admin Only)
  {
    matcher: "/admin/clients**",
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.CLIENT, ActionType.READ, {
        allowPlatformAdmin: true,
      }),
    ],
  },

  // Cocktail Management Routes
  {
    matcher: "/admin/cocktails**",
    method: ["GET"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.COCKTAIL, ActionType.READ, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/cocktails**",
    method: ["POST"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.COCKTAIL, ActionType.CREATE, {
        extractClientId: extractClientIdFromBody,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/cocktails/*",
    method: ["PUT", "PATCH"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.COCKTAIL, ActionType.UPDATE, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/cocktails/*",
    method: ["DELETE"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.COCKTAIL, ActionType.DELETE, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },

  // Ingredient Management Routes
  {
    matcher: "/admin/ingredients**",
    method: ["GET"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.INGREDIENT, ActionType.READ, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/ingredients**",
    method: ["POST"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.INGREDIENT, ActionType.CREATE, {
        extractClientId: extractClientIdFromBody,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/ingredients/*",
    method: ["PUT", "PATCH"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.INGREDIENT, ActionType.UPDATE, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/ingredients/*",
    method: ["DELETE"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.INGREDIENT, ActionType.DELETE, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },

  // Role Management Routes (Platform Admin Only)
  {
    matcher: "/admin/roles**",
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.ROLE, ActionType.READ, {
        allowPlatformAdmin: true,
      }),
    ],
  },

  // User Management Routes
  {
    matcher: "/admin/users**",
    method: ["GET"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.USER, ActionType.READ, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/users/*/assign-role",
    method: ["POST"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.USER, ActionType.ASSIGN, {
        extractClientId: extractClientIdFromBody,
        allowPlatformAdmin: true,
      }),
    ],
  },

  // Restaurant Management Routes
  {
    matcher: "/admin/restaurants**",
    method: ["GET"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.RESTAURANT, ActionType.READ, {
        extractClientId: extractClientIdFromParams,
        allowPlatformAdmin: true,
      }),
    ],
  },
  {
    matcher: "/admin/restaurants**",
    method: ["POST"],
    middlewares: [
      extractClientContext,
      requirePermission(ResourceType.RESTAURANT, ActionType.CREATE, {
        extractClientId: extractClientIdFromBody,
        allowPlatformAdmin: true,
      }),
    ],
  },
];

/**
 * Helper function to get all admin route permission configurations.
 * This can be imported and spread into the main middleware routes array.
 */
export function getAdminRoutePermissions(): AdminRouteConfig[] {
  return ADMIN_ROUTE_PERMISSIONS;
}

/**
 * Helper function to get permission configurations for specific resource types.
 * Useful for dynamic route generation or testing.
 */
export function getRoutePermissionsForResource(resource: ResourceType): AdminRouteConfig[] {
  return ADMIN_ROUTE_PERMISSIONS.filter((route) => route.matcher.includes(resource));
}
