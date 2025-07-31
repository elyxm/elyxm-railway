import { model } from "@medusajs/utils";
import Permission from "./permission";
import Role from "./role";

const RolePermission = model.define("role_permission", {
  id: model
    .id({
      prefix: "rolperm",
    })
    .primaryKey(),
  role: model.belongsTo(() => Role, {
    mappedBy: "permissions",
  }),
  permission: model.belongsTo(() => Permission, {
    mappedBy: "roles",
  }),
});

export default RolePermission;
