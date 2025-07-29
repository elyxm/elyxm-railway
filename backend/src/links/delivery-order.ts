import OrderModule from "@medusajs/medusa/order";
import { defineLink } from "@medusajs/utils";
import DeliveryModule from "../modules/delivery";

export default defineLink(DeliveryModule.linkable.delivery, {
  linkable: OrderModule.linkable.order.id,
  isList: true,
});
