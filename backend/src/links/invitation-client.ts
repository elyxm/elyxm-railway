import { defineLink } from "@medusajs/utils";
import ClientModule from "../modules/client";
import InvitationModule from "../modules/invitation";

export default defineLink(InvitationModule.linkable.invitation, ClientModule.linkable.client);
