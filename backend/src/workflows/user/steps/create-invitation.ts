import { ModuleRegistrationName } from "@medusajs/utils";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { randomBytes } from "crypto";
import { INVITATION_MODULE, InvitationModuleService } from "../../../modules";
import { CreateInviteDTO, InviteStatus } from "../../../modules/invitation/types/common";
import { RBAC_MODULE, RbacModuleService } from "../../../modules/rbac";

export const createInvitationStepId = "create-invitation-step";

const createInvitationStep = createStep(
  createInvitationStepId,
  async function (data: CreateInviteDTO, { container }) {
    const invitationService: InvitationModuleService = container.resolve(INVITATION_MODULE);
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);

    // Generate token
    const token = randomBytes(32).toString("hex");

    // Handle role assignment by slug if provided
    let roleId = data.role_id;
    if (data.role_slug && !data.role_id) {
      const roles = await rbacService.listRoles({
        slug: data.role_slug,
      });
      if (roles.length > 0) {
        roleId = roles[0].id;
      } else {
        throw new Error(`Role with slug '${data.role_slug}' not found`);
      }
    }

    // Create the invitation using basic service method
    const invite = await invitationService.createInvitations({
      email: data.email,
      token,
      client_id: data.client_id,
      role_id: roleId,
      inviter_id: data.inviter_id,
      expires_at: data.expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
      status: InviteStatus.PENDING,
    });

    // Emit event to trigger email notification
    const eventBus = container.resolve(ModuleRegistrationName.EVENT_BUS);
    await eventBus.emit({
      name: "invite.created",
      data: {
        id: invite.id,
        email: invite.email,
        token: invite.token,
      },
    });

    return new StepResponse(invite, {
      inviteId: invite.id,
      email: invite.email,
      token: invite.token,
    });
  },
  async function (input: any, { container }) {
    if (!input) {
      return;
    }

    const invitationService: InvitationModuleService = container.resolve(INVITATION_MODULE);

    // Delete the invitation if the workflow fails
    await invitationService.softDeleteInvitations([input.inviteId]);
  }
);

export default createInvitationStep;
