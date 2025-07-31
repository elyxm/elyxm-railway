import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { INVITATION_MODULE, InvitationModuleService } from "../../../modules/invitation";
import { InviteStatus } from "../../../modules/invitation/types/common";

export const validateInvitationStepId = "validate-invitation-step";

export type ValidateInvitationStepInput = {
  token: string;
};

const validateInvitationStep = createStep(
  validateInvitationStepId,
  async function (data: ValidateInvitationStepInput, { container }) {
    const invitationService: InvitationModuleService = container.resolve(INVITATION_MODULE);

    // Retrieve the invitation by token using basic service method
    const invites = await invitationService.listInvitations({
      token: data.token,
    });

    const invite = invites[0];

    if (!invite) {
      throw new Error("Invalid invitation token");
    }

    // Validate invitation status
    if (invite.status !== InviteStatus.PENDING) {
      throw new Error("Invitation already used or expired");
    }

    // Check if invitation has expired
    if (invite.expires_at && invite.expires_at < new Date()) {
      throw new Error("Invitation expired");
    }

    return new StepResponse(invite, {
      inviteId: invite.id,
      email: invite.email,
      clientId: invite.client_id,
      roleId: invite.role_id,
    });
  },
  async function (input: any, { container }) {
    // No compensation needed for validation step
    console.log("Validate invitation step compensation: no action needed");
  }
);

export default validateInvitationStep;
