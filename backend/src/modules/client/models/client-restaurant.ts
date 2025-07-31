import { model } from "@medusajs/utils";
import Client from "./client";

const ClientRestaurant = model.define("client_restaurant", {
  id: model
    .id({
      prefix: "clires",
    })
    .primaryKey(),
  client: model.belongsTo(() => Client, {
    mappedBy: "restaurants",
  }),
  restaurant_id: model.text(),
  role: model.text().default("member"),
});

export default ClientRestaurant;
