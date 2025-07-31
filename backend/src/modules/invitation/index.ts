import { Module } from "@medusajs/utils";
import InvitationModuleService from "./service";

export const INVITATION_MODULE = "invitation";

export default Module(INVITATION_MODULE, {
  service: InvitationModuleService,
});

export { default as InvitationModuleService } from "./service";
export * from "./types";
