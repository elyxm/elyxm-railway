import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RBAC_MODULE, RbacModuleService } from "../../../../modules/rbac";
import { ScopeType } from "../../../../modules/rbac/types/common";

interface UpdateRoleBody {
  name?: string;
  slug?: string;
  description?: string | null;
  scope_type?: ScopeType;
  scope_id?: string | null;
  is_global?: boolean;
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);
    const { id } = req.params;

    const roles = await rbacService.listRoles({
      where: { id },
      relations: ["permissions", "permissions.permission"],
    });

    if (!roles.length) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    return res.json({
      role: roles[0],
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return res.status(500).json({
      message: "Failed to fetch role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);
    const { id } = req.params;
    const body = req.body as UpdateRoleBody;

    const roles = await rbacService.updateRoles([
      {
        id,
        name: body.name,
        slug: body.slug,
        description: body.description,
        scope_type: body.scope_type,
        scope_id: body.scope_id,
        is_global: body.is_global,
      },
    ]);

    return res.json({
      role: roles[0],
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      message: "Failed to update role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);
    const { id } = req.params;

    await rbacService.deleteRoles([id]);

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting role:", error);
    return res.status(500).json({
      message: "Failed to delete role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
