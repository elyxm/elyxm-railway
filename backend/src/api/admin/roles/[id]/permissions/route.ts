import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RBAC_MODULE, RbacModuleService } from "../../../../../modules/rbac";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);
    const { id } = req.params;

    const permissions = await rbacService.getRolePermissions(id);

    return res.json({
      permissions,
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({
      message: "Failed to fetch role permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

interface AssignPermissionsBody {
  permission_ids: string[];
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);
    const { id } = req.params;
    const { permission_ids } = req.body as AssignPermissionsBody;

    // First, get existing permissions
    const existingPermissions = await rbacService.getRolePermissions(id);
    const existingPermissionIds = existingPermissions.map((rp) => rp.permission.id);

    // Find permissions to add and remove
    const permissionsToAdd = permission_ids.filter((pid) => !existingPermissionIds.includes(pid));
    const permissionsToRemove = existingPermissionIds.filter((pid) => !permission_ids.includes(pid));

    // Remove permissions that are no longer needed
    if (permissionsToRemove.length > 0) {
      await rbacService.deleteRolePermissions(
        existingPermissions.filter((rp) => permissionsToRemove.includes(rp.permission.id)).map((rp) => rp.id)
      );
    }

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      await rbacService.createRolePermissions(
        permissionsToAdd.map((pid) => ({
          role_id: id,
          permission_id: pid,
        }))
      );
    }

    // Get updated permissions
    const updatedPermissions = await rbacService.getRolePermissions(id);

    return res.json({
      permissions: updatedPermissions,
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return res.status(500).json({
      message: "Failed to update role permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);
    const { id } = req.params;
    const { permission_id } = req.params;

    // Get the role permission to delete
    const permissions = await rbacService.getRolePermissions(id);
    const rolePermission = permissions.find((rp) => rp.permission.id === permission_id);

    if (!rolePermission) {
      return res.status(404).json({
        message: "Role permission not found",
      });
    }

    // Delete the role permission
    await rbacService.deleteRolePermissions([rolePermission.id]);

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting role permission:", error);
    return res.status(500).json({
      message: "Failed to delete role permission",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
