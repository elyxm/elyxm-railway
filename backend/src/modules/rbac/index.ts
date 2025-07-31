import { Module } from "@medusajs/utils";
import RbacModuleService from "./service";

export const RBAC_MODULE = "rbac";

export default Module(RBAC_MODULE, {
  service: RbacModuleService,
});

export * from "./types";

export { default as RbacModuleService } from "./service";
