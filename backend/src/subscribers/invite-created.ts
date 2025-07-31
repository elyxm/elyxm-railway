import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { INotificationModuleService } from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import { BACKEND_URL } from "../lib/constants";
import { INVITATION_MODULE, InvitationModuleService } from "../modules";
import { EmailTemplates } from "../modules/email-notifications/templates";

export default async function userInviteHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);
  const invitationModuleService: InvitationModuleService = container.resolve(INVITATION_MODULE);
  const [invite] = await invitationModuleService.listInvitations({ where: { id: data.id } });

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: "email",
      template: EmailTemplates.INVITE_USER,
      data: {
        emailOptions: {
          replyTo: "info@example.com",
          subject: "You've been invited to Medusa!",
        },
        inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
        preview: "The administration dashboard awaits...",
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
};
