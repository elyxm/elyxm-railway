export enum ScopeType {
  GLOBAL = "global",
  CLIENT = "client",
}

export enum ResourceType {
  COCKTAIL = "cocktail",
  INGREDIENT = "ingredient",
  CLIENT = "client",
  USER = "user",
  ROLE = "role",
  RESTAURANT = "restaurant",
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
  description?: string;
  scope_type: ScopeType;
  scope_id?: string;
  is_global: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionDTO {
  id: string;
  name: string;
  slug: string;
  resource: ResourceType;
  action: ActionType;
  description?: string;
}

export interface UserRoleDTO {
  id: string;
  user_id: string;
  role_id: string;
  client_id?: string;
  assigned_by: string;
  created_at: Date;
}
