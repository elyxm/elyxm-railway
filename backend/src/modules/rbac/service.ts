import { MedusaService } from "@medusajs/utils";
import { Permission, Role, RolePermission, UserRole } from "./models";
import { ActionType, generatePermissionSlug, ResourceType, ScopeType } from "./types/common";

class RbacModuleService extends MedusaService({
  Role,
  Permission,
  UserRole,
  RolePermission,
}) {
  // Get user roles for a specific client context
  async getUserRolesForClient(userId: string, clientId?: string) {
    const filters: any = { user_id: userId };
    if (clientId) {
      filters.client_id = clientId;
    }

    return await this.listUserRoles({
      where: filters,
      relations: ["role", "role.permissions", "role.permissions.permission"],
    });
  }

  // Get available roles for a client (global + client-scoped)
  async getAvailableRolesForClient(clientId: string) {
    return await this.listRoles({
      where: [{ scope_type: ScopeType.GLOBAL }, { scope_type: ScopeType.CLIENT, scope_id: clientId }],
      relations: ["permissions", "permissions.permission"],
    });
  }

  // Enhanced permission checking with detailed context
  async userHasPermission(
    userId: string,
    resource: ResourceType,
    action: ActionType,
    clientId?: string
  ): Promise<boolean> {
    const permissionSlug = generatePermissionSlug(resource, action);
    const userRoles = await this.getUserRolesForClient(userId, clientId);

    for (const userRole of userRoles) {
      // Check for specific permission
      if (userRole.role.permissions.some((rp: any) => rp.permission.slug === permissionSlug)) {
        return true;
      }

      // Check for manage permission (implies all other actions)
      const manageSlug = generatePermissionSlug(resource, ActionType.MANAGE);
      if (userRole.role.permissions.some((rp: any) => rp.permission.slug === manageSlug)) {
        return true;
      }
    }
    return false;
  }

  // Check permission by slug (legacy support)
  async userHasPermissionBySlug(userId: string, permissionSlug: string, clientId?: string): Promise<boolean> {
    const userRoles = await this.getUserRolesForClient(userId, clientId);

    for (const userRole of userRoles) {
      if (userRole.role.permissions.some((rp: any) => rp.permission.slug === permissionSlug)) {
        return true;
      }
    }
    return false;
  }

  // Get all permissions for a user in a client context
  async getUserPermissions(userId: string, clientId?: string): Promise<string[]> {
    const userRoles = await this.getUserRolesForClient(userId, clientId);
    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        permissions.add(rolePermission.permission.slug);
      }
    }

    return Array.from(permissions);
  }

  // Assign role to user in client context
  async assignRoleToUser(userId: string, roleId: string, clientId: string, assignedBy: string) {
    return await this.createUserRoles({
      user_id: userId,
      role_id: roleId,
      client_id: clientId,
      assigned_by: assignedBy,
    });
  }

  // Remove role from user
  async removeRoleFromUser(userId: string, roleId: string, clientId?: string) {
    const filters: any = { user_id: userId, role_id: roleId };
    if (clientId) {
      filters.client_id = clientId;
    }

    const userRoles = await this.listUserRoles({ where: filters });
    for (const userRole of userRoles) {
      await this.deleteUserRoles(userRole.id);
    }
  }

  // Get permissions for a role
  async getRolePermissions(roleId: string) {
    return await this.listRolePermissions({
      role_id: roleId,
      relations: ["permission"],
    });
  }
}

export default RbacModuleService;
