import { model } from "@medusajs/framework/utils";
import Restaurant from "./restaurant";

const RestaurantAdmin = model.define("restaurant_admin", {
  id: model
    .id({
      prefix: "resadm",
    })
    .primaryKey(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  email: model.text().unique(),
  avatar_url: model.text().nullable(),
  restaurant: model.belongsTo(() => Restaurant, {
    mappedBy: "admins",
  }),
});

export default RestaurantAdmin;
