import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ModuleRegistrationName } from "@medusajs/utils";
import zod from "zod";

const bodySchema = zod.object({
  email: zod.string().email(),
  role_id: zod.string().optional(),
  role_slug: zod.string().optional(), // New field to support role assignment by slug
  expires_at: zod
    .union([zod.date(), zod.string()])
    .optional()
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
});

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const clientId = req.params.id;
    if (!clientId) {
      return res.status(400).json({ message: "client_id param is required" });
    }
    const { email, role_id, role_slug, expires_at } = bodySchema.parse(req.body);

    // Validate that only one of role_id or role_slug is provided
    if (role_id && role_slug) {
      return res.status(400).json({
        message: "Validation error",
        error: "Cannot provide both role_id and role_slug. Use one or the other.",
      });
    }

    const inviterId =
      (req as any).auth?.actor_id ||
      (req as any).auth_context?.actor_id ||
      (req as any).user?.user_id ||
      (req as any).user?.id;
    if (!inviterId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Use workflow to create invitation and send email
    const workflowEngine = req.scope.resolve(ModuleRegistrationName.WORKFLOW_ENGINE);

    const { result } = await workflowEngine.run("create-invitation", {
      input: {
        email,
        client_id: clientId,
        role_id,
        role_slug,
        inviter_id: inviterId,
        expires_at: expires_at ?? undefined,
      },
    });

    return res.status(201).json({ invite: result });
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }

    // Handle duplicate invitation error
    if (error instanceof Error && error.message.includes("pending invitation already exists")) {
      return res.status(409).json({
        message: "Duplicate invitation",
        error: error.message,
      });
    }

    console.error("Error creating invitation:", error);
    return res.status(500).json({
      message: "Failed to create invitation",
      error: (error as Error).message,
    });
  }
}
