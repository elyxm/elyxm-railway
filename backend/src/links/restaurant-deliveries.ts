import { defineLink } from "@medusajs/framework/utils";
import DeliveryModule from "../modules/delivery";
import RestaurantModule from "../modules/restaurant";

export default defineLink(RestaurantModule.linkable.restaurant, {
  linkable: DeliveryModule.linkable.delivery,
  isList: true,
});
