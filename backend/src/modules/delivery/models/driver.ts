import { model } from "@medusajs/utils";
import DeliveryDriver from "./delivery-driver";

const Driver = model.define("driver", {
  id: model
    .id({
      prefix: "drv",
    })
    .primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  email: model.text(),
  phone: model.text(),
  avatar_url: model.text().nullable(),
  deliveryDriver: model.hasMany(() => DeliveryDriver, {
    mappedBy: "driver",
  }),
});

export default Driver;
