import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RBAC_MODULE, RbacModuleService } from "../../../../modules/rbac";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);

    // Get user ID from authentication context
    const userId =
      (req as any).auth?.actor_id ||
      (req as any).auth_context?.actor_id ||
      (req as any).user?.user_id ||
      (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get client ID from query parameters or header
    const clientId = (req.query?.client_id as string) || (req.headers["x-client-id"] as string);

    // Get user permissions
    const permissions = await rbacService.getUserPermissions(userId, clientId);

    // Get user roles
    const userRoles = await rbacService.getUserRolesForClient(userId, clientId);

    // Generate feature flags based on permissions
    const featureFlags = {
      // Cocktail Management Features
      canCreateCocktails: permissions.includes("cocktail:create") || permissions.includes("cocktail:manage"),
      canEditCocktails: permissions.includes("cocktail:update") || permissions.includes("cocktail:manage"),
      canDeleteCocktails: permissions.includes("cocktail:delete") || permissions.includes("cocktail:manage"),
      canViewCocktails: permissions.includes("cocktail:read") || permissions.includes("cocktail:manage"),

      // Ingredient Management Features
      canCreateIngredients: permissions.includes("ingredient:create") || permissions.includes("ingredient:manage"),
      canEditIngredients: permissions.includes("ingredient:update") || permissions.includes("ingredient:manage"),
      canDeleteIngredients: permissions.includes("ingredient:delete") || permissions.includes("ingredient:manage"),
      canViewIngredients: permissions.includes("ingredient:read") || permissions.includes("ingredient:manage"),

      // Access Control Features
      canGrantCocktailAccess: permissions.includes("cocktail:assign"),
      canGrantIngredientAccess: permissions.includes("ingredient:assign"),

      // Client Management Features (Platform Admin)
      canManageClients: permissions.includes("client:manage"),
      canCreateClients: permissions.includes("client:create"),
      canViewClients: permissions.includes("client:read") || permissions.includes("client:manage"),
      canEditClients: permissions.includes("client:update") || permissions.includes("client:manage"),

      // Role Management Features (Platform Admin)
      canManageRoles: permissions.includes("role:manage"),
      canCreateRoles: permissions.includes("role:create"),
      canViewRoles: permissions.includes("role:read") || permissions.includes("role:manage"),
      canAssignRoles: permissions.includes("role:assign") || permissions.includes("user:assign"),

      // User Management Features
      canViewUsers: permissions.includes("user:read") || permissions.includes("user:manage"),
      canCreateUsers: permissions.includes("user:create") || permissions.includes("user:manage"),
      canEditUsers: permissions.includes("user:update") || permissions.includes("user:manage"),
      canAssignUserRoles: permissions.includes("user:assign"),

      // Restaurant Management Features
      canViewRestaurants: permissions.includes("restaurant:read") || permissions.includes("restaurant:manage"),
      canCreateRestaurants: permissions.includes("restaurant:create") || permissions.includes("restaurant:manage"),
      canEditRestaurants: permissions.includes("restaurant:update") || permissions.includes("restaurant:manage"),
      canAssignRestaurants: permissions.includes("restaurant:assign"),

      // Context-specific flags
      isPlatformUser: userRoles.some((ur: any) => ur.role.is_global),
      isClientUser: userRoles.some((ur: any) => !ur.role.is_global),
      hasGlobalPermissions: userRoles.some((ur: any) => ur.role.is_global),
    };

    // Role information
    const roleInfo = userRoles.map((ur: any) => ({
      roleId: ur.role.id,
      roleName: ur.role.name,
      roleSlug: ur.role.slug,
      scopeType: ur.role.scope_type,
      isGlobal: ur.role.is_global,
      clientId: ur.client_id,
    }));

    return res.json({
      userId,
      clientId,
      permissions,
      featureFlags,
      roles: roleInfo,
      context: {
        isPlatformUser: featureFlags.isPlatformUser,
        isClientUser: featureFlags.isClientUser,
        hasGlobalPermissions: featureFlags.hasGlobalPermissions,
      },
    });
  } catch (error) {
    console.error("Permission check error:", error);
    return res.status(500).json({
      message: "Failed to get user permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
