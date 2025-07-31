import UserModule from "@medusajs/medusa/user";
import { defineLink } from "@medusajs/utils";
import InvitationModule from "../modules/invitation";

export default defineLink(InvitationModule.linkable.invitation, UserModule.linkable.user);
