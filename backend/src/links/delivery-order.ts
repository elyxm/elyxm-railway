import { defineLink } from "@medusajs/framework/utils";
import OrderModule from "@medusajs/medusa/order";
import DeliveryModule from "@modules/delivery";

export default defineLink(DeliveryModule.linkable.delivery, {
  linkable: OrderModule.linkable.order.id,
  isList: true,
});
