import { defineLink } from "@medusajs/framework/utils";
import RestaurantModule from "@medusajs/medusa/product";
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
