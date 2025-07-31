import { model } from "@medusajs/utils";
import { ScopeType } from "../types/common";
import RolePermission from "./role-permission";
import UserRole from "./user-role";

const Role = model.define("role", {
  id: model
    .id({
      prefix: "role",
    })
    .primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  description: model.text().nullable(),
  scope_type: model.enum(ScopeType).default(ScopeType.CLIENT),
  scope_id: model.text().nullable(),
  is_global: model.boolean().default(false),
  userRoles: model.hasMany(() => UserRole, {
    mappedBy: "role",
  }),
  permissions: model.hasMany(() => RolePermission, {
    mappedBy: "role",
  }),
});

export default Role;
