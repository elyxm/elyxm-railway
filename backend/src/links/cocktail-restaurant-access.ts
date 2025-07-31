import { defineLink } from "@medusajs/utils";
import CocktailModule from "../modules/cocktail";
import RestaurantModule from "../modules/restaurant";

export default defineLink(
  CocktailModule.linkable.cocktail,
  {
    linkable: RestaurantModule.linkable.restaurant,
    isList: true,
  },
  {
    database: {
      table: "cocktail_restaurant_access",
      extraColumns: {
        granted_by: {
          type: "text",
          nullable: false,
        },
        granted_at: {
          type: "datetime",
          nullable: false,
        },
      },
    },
  }
);
