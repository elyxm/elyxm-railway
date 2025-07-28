import { defineLink } from "@medusajs/framework/utils";
import CartModule from "@medusajs/medusa/cart";
import DeliveryModule from "@modules/delivery";

export default defineLink(DeliveryModule.linkable.delivery, CartModule.linkable.cart);
