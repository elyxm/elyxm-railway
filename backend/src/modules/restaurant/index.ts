import { Module } from "@medusajs/utils";
import RestaurantModuleService from "./service";

export const RESTAURANT_MODULE = "restaurant";

export default Module(RESTAURANT_MODULE, {
  service: RestaurantModuleService,
});

export * from "./types";

export { default as RestaurantModuleService } from "./service";
