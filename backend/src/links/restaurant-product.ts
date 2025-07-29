import RestaurantModule from "@medusajs/medusa/product";
import { defineLink } from "@medusajs/utils";
import ProductModule from "../modules/restaurant";

export default defineLink(
  ProductModule.linkable.restaurant,
  {
    linkable: RestaurantModule.linkable.product.id,
    isList: true,
  },
  {
    database: {
      table: "restaurant_product",
    },
  }
);
