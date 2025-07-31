import { defineLink } from "@medusajs/utils";
import ClientModule from "../modules/client";
import CocktailModule from "../modules/cocktail";

export default defineLink(
  CocktailModule.linkable.cocktail,
  {
    linkable: ClientModule.linkable.client,
    isList: true,
  },
  {
    database: {
      table: "cocktail_client_access",
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
