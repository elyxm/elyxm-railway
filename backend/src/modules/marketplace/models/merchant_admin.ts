import { model } from "@medusajs/framework/utils";
import Merchant from "./merchant";

const MerchantAdmin = model.define("merchant_admin", {
  id: model.id().primaryKey(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  email: model.text().unique(),
  merchant: model.belongsTo(() => Merchant, {
    mappedBy: "admins",
  }),
});

export default MerchantAdmin;
