import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ModuleRegistrationName } from "@medusajs/utils";
import { acceptInvitationWorkflowId, validateInvitationWorkflowId } from "../../../../workflows/user/workflows";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Invalid invitation token",
        error: "Token is required",
      });
    }

    // Use workflow to validate invitation
    const workflowEngine = req.scope.resolve(ModuleRegistrationName.WORKFLOW_ENGINE);

    const { result } = await workflowEngine.run(validateInvitationWorkflowId, {
      input: {
        token,
      },
    });

    // Return invitation details (without sensitive data like token)
    return res.status(200).json({
      invitation: {
        id: result.invitation.id,
        email: result.invitation.email,
        client_id: result.invitation.client_id,
        role_id: result.invitation.role_id,
        status: result.invitation.status,
        expires_at: result.invitation.expires_at,
        created_at: result.invitation.created_at,
      },
      message: "Invitation is valid",
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return res.status(500).json({
      message: "Failed to validate invitation",
      error: (error as Error).message,
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { token } = req.query;
    const body = req.body as {
      user_data?: { email?: string; password?: string; first_name?: string; last_name?: string };
    };
    const { user_data } = body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Invalid invitation token",
        error: "Token is required in URL parameters",
      });
    }

    if (!user_data || !user_data.email || !user_data.password || !user_data.first_name || !user_data.last_name) {
      return res.status(400).json({
        message: "Invalid user data",
        error: "Email, password, first_name, and last_name are required",
      });
    }

    // Use workflow to accept invitation and create user account
    const workflowEngine = req.scope.resolve(ModuleRegistrationName.WORKFLOW_ENGINE);

    const { result } = await workflowEngine.run(acceptInvitationWorkflowId, {
      input: {
        token,
        user_data: {
          email: user_data.email,
          password: user_data.password,
          first_name: user_data.first_name,
          last_name: user_data.last_name,
        },
      },
    });

    return res.status(200).json({
      message: "Invitation accepted successfully",
      result: {
        invitation: result.invitation,
        user: result.user,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return res.status(500).json({
      message: "Failed to accept invitation",
      error: (error as Error).message,
    });
  }
}
