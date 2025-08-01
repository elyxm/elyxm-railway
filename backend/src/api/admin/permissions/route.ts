import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RBAC_MODULE, RbacModuleService } from "../../../modules/rbac";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rbacService: RbacModuleService = req.scope.resolve(RBAC_MODULE);

    // Get pagination parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get search query
    const search = req.query.q as string;

    // Get filter parameters
    const filters: Record<string, any> = {};
    if (req.query.resource) {
      filters.resource = req.query.resource;
    }
    if (req.query.action) {
      filters.action = req.query.action;
    }

    // Get sort parameters
    let order: { [key: string]: "ASC" | "DESC" } | undefined;
    if (req.query.order) {
      const [field, direction] = (req.query.order as string).split(":");
      order = { [field]: direction === "desc" ? "DESC" : "ASC" };
    }

    // Get permissions with pagination
    const permissions = await rbacService.listPermissions({
      where: filters,
      skip: offset,
      take: limit,
      order,
    });

    return res.json({
      permissions,
      count: permissions.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return res.status(500).json({
      message: "Failed to fetch permissions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
