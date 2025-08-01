import { MedusaService } from "@medusajs/utils";
import { Permission, Role, RolePermission, UserRole } from "./models";
import { ActionType, ResourceType, generatePermissionSlug } from "./types/common";

class RbacModuleService extends MedusaService({
  Role,
  Permission,
  UserRole,
  RolePermission,
}) {
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

  async getRolePermissions(roleId: string) {
    return await this.listRolePermissions({
      where: { role_id: roleId },
      relations: ["permission"],
    });
  }

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

  async assignRoleToUser(userId: string, roleId: string, clientId: string, assignedBy: string) {
    return await this.createUserRoles({
      user_id: userId,
      role_id: roleId,
      client_id: clientId,
      assigned_by: assignedBy,
    });
  }

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
}

export default RbacModuleService;
