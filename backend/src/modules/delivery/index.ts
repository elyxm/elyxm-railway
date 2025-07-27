import { Module } from "@medusajs/utils";
import DeliveryService from "./service";

export const DELIVERY_MODULE = "deliveryModuleService";

export default Module(DELIVERY_MODULE, {
  service: DeliveryService,
});
