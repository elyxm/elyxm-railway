import { model } from "@medusajs/framework/utils";
import RestaurantAdmin from "./restaurant-admin";

const Restaurant = model.define("restaurant", {
  id: model
    .id({
      prefix: "res",
    })
    .primaryKey(),
  name: model.text(),
  handle: model.text().unique(),
  description: model.text().nullable(),
  is_open: model.boolean().default(false),
  phone: model.text().nullable(),
  email: model.text().nullable(),
  address: model.text().nullable(),
  image_url: model.text().nullable(),
  admins: model.hasMany(() => RestaurantAdmin, {
    mapBy: "restaurant",
  }),
});

export default Restaurant;
