import { model } from "@medusajs/utils";
import Restaurant from "./restaurant";

const RestaurantAdmin = model.define("restaurant_admin", {
  id: model
    .id({
      prefix: "resadm",
    })
    .primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  email: model.text().unique(),
  phone: model.text().nullable(),
  avatar_url: model.text().nullable(),
  restaurant: model.belongsTo(() => Restaurant, {
    mappedBy: "admins",
  }),
});

export default RestaurantAdmin;
