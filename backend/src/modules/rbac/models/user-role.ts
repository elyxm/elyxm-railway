import { model } from "@medusajs/utils";
import Role from "./role";

const UserRole = model.define("user_role", {
  id: model
    .id({
      prefix: "usrole",
    })
    .primaryKey(),
  user_id: model.text(),
  client_id: model.text().nullable(),
  assigned_by: model.text(),
  role: model.belongsTo(() => Role, {
    mappedBy: "userRoles",
  }),
});

export default UserRole;
