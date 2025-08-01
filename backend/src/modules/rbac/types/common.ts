import { FindConfig } from "@medusajs/types";
import RbacModuleService from "../service";

export enum ScopeType {
  GLOBAL = "global",
  CLIENT = "client",
  RESTAURANT = "restaurant",
}

export enum ResourceType {
  RESTAURANT = "restaurant",
  DRIVER = "driver",
  DELIVERY = "delivery",
  ROLE = "role",
  PERMISSION = "permission",
  CLIENT = "client",
  COCKTAIL = "cocktail",
  INGREDIENT = "ingredient",
  USER = "user",
}

export enum ActionType {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
  ASSIGN = "assign",
}

export interface RoleDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  scope_type: ScopeType;
  scope_id?: string | null;
  is_global: boolean;
  permissions?: RolePermissionDTO[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface PermissionDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  resource: ResourceType;
  action: ActionType;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface RolePermissionDTO {
  id: string;
  role_id: string;
  permission_id: string;
  permission: PermissionDTO;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface UserRoleDTO {
  id: string;
  user_id: string;
  role_id: string;
  client_id?: string | null;
  assigned_by: string;
  role: RoleDTO;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export const generatePermissionSlug = (resource: ResourceType, action: ActionType): string => {
  return `${resource}.${action}`;
};

declare module "@medusajs/types" {
  export interface ModuleImplementations {
    rbacModuleService: RbacModuleService;
  }
}

export type ListRolesOptions = FindConfig<RoleDTO>;
export type ListUserRolesOptions = FindConfig<UserRoleDTO>;
export type ListPermissionsOptions = FindConfig<PermissionDTO>;
export type ListRolePermissionsOptions = FindConfig<RolePermissionDTO>;
