import CartModule from "@medusajs/medusa/cart";
import { defineLink } from "@medusajs/utils";
import DeliveryModule from "../modules/delivery";

export default defineLink(DeliveryModule.linkable.delivery, CartModule.linkable.cart);
