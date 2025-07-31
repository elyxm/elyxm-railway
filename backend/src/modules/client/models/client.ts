import { model } from "@medusajs/utils";
import ClientRestaurant from "./client-restaurant";

const Client = model.define("client", {
  id: model
    .id({
      prefix: "cli",
    })
    .primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  plan_type: model.text().default("basic"),
  max_restaurants: model.number().default(1),
  max_custom_recipes: model.number().default(100),
  settings: model.json().nullable(),
  restaurants: model.hasMany(() => ClientRestaurant, {
    mappedBy: "client",
  }),
});

export default Client;
