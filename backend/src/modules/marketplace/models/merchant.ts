import { model } from "@medusajs/framework/utils";
import MerchantAdmin from "./merchant_admin";

const Merchant = model.define("merchant", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  logo: model.text().nullable(),
  admins: model.hasMany(() => MerchantAdmin, {
    mappedBy: "merchant",
  }),
});

export default Merchant;
