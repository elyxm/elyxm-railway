import { MedusaService } from "@medusajs/utils";
import { randomBytes } from "crypto";
import Invitation from "./models/invitation";
import { CreateInviteDTO, InviteStatus } from "./types/common";

class InvitationModuleService extends MedusaService({
  Invitation,
}) {
  async createInvite(data: CreateInviteDTO) {
    // generate unique token
    const token = randomBytes(32).toString("hex");

    const invite = await this.createInvitations({
      email: data.email,
      token,
      client_id: data.client_id,
      role_id: data.role_id ?? null,
      inviter_id: data.inviter_id,
      expires_at: data.expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
      status: InviteStatus.PENDING,
    });

    return invite;
  }

  async retrieveInviteByToken(token: string) {
    const [invite] = await this.listInvitations({ where: { token } });
    return invite;
  }

  async acceptInvite(token: string, user_id: string) {
    const [invite] = await this.listInvitations({ where: { token } });
    if (!invite) {
      throw new Error("Invalid invitation token");
    }
    if (invite.status !== InviteStatus.PENDING) {
      throw new Error("Invitation already used or expired");
    }
    if (invite.expires_at && invite.expires_at < new Date()) {
      throw new Error("Invitation expired");
    }

    await this.updateInvitations({
      id: invite.id,
      status: InviteStatus.ACCEPTED,
      accepted_at: new Date(),
    });

    return invite;
  }
}

export default InvitationModuleService;
