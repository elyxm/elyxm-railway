import { model } from "@medusajs/framework/utils";
import RestaurantAdmin from "./restaurant-admin";

const Restaurant = model.define("restaurant", {
  id: model
    .id({
      prefix: "res",
    })
    .primaryKey(),
  handle: model.text().unique(),
  is_open: model.boolean().default(false),
  name: model.text(),
  description: model.text().nullable(),
  phone: model.text().nullable(),
  email: model.text().nullable(),
  address: model.text().nullable(),
  image_url: model.text().nullable(),
  admins: model.hasMany(() => RestaurantAdmin, {
    mapBy: "restaurant",
  }),
});

export default Restaurant;
