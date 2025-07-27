import { Module } from "@medusajs/utils";
import RestaurantService from "./service";

export const RESTAURANT_MODULE = "restaurantModuleService";

export default Module(RESTAURANT_MODULE, {
  service: RestaurantService,
});
