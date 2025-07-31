import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { INotificationModuleService } from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import { BACKEND_URL } from "../lib/constants";
import { EmailTemplates } from "../modules/email-notifications/templates";

export default async function userInviteHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);

  // Use the data directly from the event instead of querying the database
  const { id, email, token } = data;

  try {
    await notificationModuleService.createNotifications({
      to: email,
      channel: "email",
      template: EmailTemplates.INVITE_USER,
      data: {
        emailOptions: {
          replyTo: "info@example.com",
          subject: "You've been invited to Medusa!",
        },
        inviteLink: `${BACKEND_URL}/custom/public/invite?token=${token}`,
        preview: "The administration dashboard awaits...",
      },
    });
    console.log("Email notification sent for invitation:", id);
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
};
