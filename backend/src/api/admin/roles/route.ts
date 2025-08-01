import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CreateRoleDTO } from "../../../workflows/rbac/steps/create-role";
import createRoleWorkflow from "../../../workflows/rbac/workflows/create-role";
import { listRolesWorkflow } from "../../../workflows/rbac/workflows/manage-role";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // Get pagination parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get search query
    const search = req.query.q as string;

    // Get filter parameters
    const filters: Record<string, any> = {};
    if (req.query.scope_type) {
      filters.scope_type = req.query.scope_type;
    }
    if (req.query.is_global !== undefined) {
      filters.is_global = req.query.is_global === "true";
    }

    // Get sort parameters
    let order: { [key: string]: "ASC" | "DESC" } | undefined;
    if (req.query.order) {
      const [field, direction] = (req.query.order as string).split(":");
      order = { [field]: direction === "desc" ? "DESC" : "ASC" };
    }

    const { result } = await listRolesWorkflow(req.scope).run({
      input: {
        filters,
        config: {
          skip: offset,
          take: limit,
          relations: ["permissions", "permissions.permission"],
          order,
        },
      },
    });

    const [roles, count] = result;

    return res.json({
      roles,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      message: "Failed to fetch roles",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as CreateRoleDTO;

    const { result: role } = await createRoleWorkflow(req.scope).run({
      input: body,
    });

    return res.json({
      role,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({
      message: "Failed to create role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
