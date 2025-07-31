import { Module } from "@medusajs/utils";
import ClientModuleService from "./service";

export const CLIENT_MODULE = "client";

export default Module(CLIENT_MODULE, {
  service: ClientModuleService,
});

export * from "./types";

export { default as ClientModuleService } from "./service";
