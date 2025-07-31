import { model } from "@medusajs/utils";
import { ActionType, ResourceType } from "../types/common";
import RolePermission from "./role-permission";

const Permission = model.define("permission", {
  id: model
    .id({
      prefix: "perm",
    })
    .primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  resource: model.enum(ResourceType),
  action: model.enum(ActionType),
  description: model.text().nullable(),
  roles: model.hasMany(() => RolePermission, {
    mappedBy: "permission",
  }),
});

export default Permission;
