import { MedusaService } from "@medusajs/utils";
import { Permission, Role, RolePermission, UserRole } from "./models";
import { ScopeType } from "./types/common";

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
      relations: ["role", "role.permissions"],
    });
  }

  // Get available roles for a client (global + client-scoped)
  async getAvailableRolesForClient(clientId: string) {
    return await this.listRoles({
      where: [{ scope_type: ScopeType.GLOBAL }, { scope_type: ScopeType.CLIENT, scope_id: clientId }],
      relations: ["permissions"],
    });
  }

  // Check if user has specific permission in client context
  async userHasPermission(userId: string, permissionSlug: string, clientId?: string): Promise<boolean> {
    const userRoles = await this.getUserRolesForClient(userId, clientId);

    for (const userRole of userRoles) {
      if (userRole.role.permissions.some((rp: any) => rp.permission.slug === permissionSlug)) {
        return true;
      }
    }
    return false;
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

  // Get permissions for a role
  async getRolePermissions(roleId: string) {
    return await this.listRolePermissions({
      where: { role_id: roleId },
      relations: ["permission"],
    });
  }
}

export default RbacModuleService;
