import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RBAC_MODULE, RbacModuleService } from "../../modules/rbac";
import { ActionType, ResourceType } from "../../modules/rbac/types/common";

// Extended request interface for permission context
interface PermissionRequest extends MedusaRequest {
  permissionContext?: {
    userId: string;
    clientId?: string;
    resource: ResourceType;
    action: ActionType;
    hasPermission: boolean;
    isPlatformAdmin?: boolean;
  };
  clientContext?: {
    userId: string;
    clientIds: string[];
    isPlatformUser: boolean;
  };
  auth?: {
    actor_id?: string;
  };
}

// Permission checking middleware factory
export const requirePermission = (
  resource: ResourceType,
  action: ActionType,
  options: {
    extractClientId?: (req: PermissionRequest) => string | undefined;
    allowPlatformAdmin?: boolean;
  } = {}
) => {
  return async (req: PermissionRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    try {
      const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);

      // Try to get user ID from different auth contexts
      const userId =
        req.auth?.actor_id ||
        (req as any).auth_context?.actor_id ||
        (req as any).user?.user_id ||
        (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Extract client ID from request if extractor provided
      const clientId = options.extractClientId ? options.extractClientId(req) : undefined;

      // Check if user has the required permission
      const hasPermission = await rbacService.userHasPermission(userId, resource, action, clientId);

      if (hasPermission) {
        // Add permission context to request
        req.permissionContext = {
          userId,
          clientId,
          resource,
          action,
          hasPermission: true,
        };
        return next();
      }

      // If platform admin is allowed, check for platform admin permissions
      if (options.allowPlatformAdmin) {
        const isPlatformAdmin = await rbacService.userHasPermission(userId, ResourceType.CLIENT, ActionType.MANAGE);

        if (isPlatformAdmin) {
          req.permissionContext = {
            userId,
            clientId,
            resource,
            action,
            hasPermission: true,
            isPlatformAdmin: true,
          };
          return next();
        }
      }

      return res.status(403).json({
        message: `Permission denied. Required: ${resource}:${action}`,
        resource,
        action,
        clientId,
      });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
};

// Client context extraction middleware
export const extractClientContext = async (req: PermissionRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);

    // Try to get user ID from different auth contexts
    const userId =
      req.auth?.actor_id || (req as any).auth_context?.actor_id || (req as any).user?.user_id || (req as any).user?.id;

    if (userId) {
      // Get user's client contexts
      const userRoles = await rbacService.getUserRolesForClient(userId);
      const clientIds = [...new Set(userRoles.map((ur: any) => ur.client_id).filter(Boolean))];

      req.clientContext = {
        userId,
        clientIds,
        isPlatformUser: userRoles.some((ur: any) => ur.role.is_global),
      };
    }

    next();
  } catch (error) {
    console.error("Client context extraction error:", error);
    next();
  }
};

// Helper to extract client ID from URL parameters
export const extractClientIdFromParams = (req: PermissionRequest): string | undefined => {
  return req.params?.client_id || (req.query?.client_id as string);
};

// Helper to extract client ID from request body
export const extractClientIdFromBody = (req: PermissionRequest): string | undefined => {
  return (req.body as any)?.client_id;
};
