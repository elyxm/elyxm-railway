import { Module } from "@medusajs/framework/utils";
import DeliveryModuleService from "./service";

export const DELIVERY_MODULE = "delivery";

export default Module(DELIVERY_MODULE, {
  service: DeliveryModuleService,
});

export * from "./types";
