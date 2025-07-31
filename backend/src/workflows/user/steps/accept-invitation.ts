import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { INVITATION_MODULE, InvitationModuleService } from "../../../modules/invitation";
import { InviteStatus } from "../../../modules/invitation/types/common";

export const acceptInvitationStepId = "accept-invitation-step";

export type AcceptInvitationStepInput = {
  token: string;
  user_data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  };
};

const acceptInvitationStep = createStep(
  acceptInvitationStepId,
  async function (data: AcceptInvitationStepInput, { container }) {
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

    // Update invitation status to accepted using basic service method
    await invitationService.updateInvitations({
      id: invite.id,
      status: InviteStatus.ACCEPTED,
      accepted_at: new Date(),
    });

    // Use the original invitation data since update might not return full object
    const updatedInvite = {
      ...invite,
      status: InviteStatus.ACCEPTED,
      accepted_at: new Date(),
    };

    // TODO: Create user account and assign role
    // This will be implemented in the next step

    return new StepResponse(updatedInvite, {
      inviteId: updatedInvite.id,
      email: updatedInvite.email,
      clientId: updatedInvite.client_id,
      roleId: updatedInvite.role_id,
    });
  },
  async function (input: any, { container }) {
    if (!input) {
      return;
    }

    const invitationService: InvitationModuleService = container.resolve(INVITATION_MODULE);

    // If the workflow fails, we could potentially revert the invitation status
    // For now, we'll leave it as accepted since the user account creation failed
    console.log("Accept invitation step compensation: invitation was accepted but user creation failed");
  }
);

export default acceptInvitationStep;
