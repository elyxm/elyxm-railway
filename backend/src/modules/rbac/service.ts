import { MedusaService } from "@medusajs/utils";
import { Permission, Role, RolePermission, UserRole } from "./models";

class RbacModuleService extends MedusaService({
  Role,
  Permission,
  UserRole,
  RolePermission,
}) {}

export default RbacModuleService;
