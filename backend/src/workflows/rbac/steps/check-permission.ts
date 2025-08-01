import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { RBAC_MODULE, RbacModuleService } from "../../../modules/rbac";
import {
  ActionType,
  generatePermissionSlug,
  ListUserRolesOptions,
  ResourceType,
  UserRoleDTO,
} from "../../../modules/rbac/types/common";

export type CheckPermissionInput = {
  userId: string;
  resource: ResourceType;
  action: ActionType;
  clientId?: string;
};

export const checkPermissionStepId = "check-permission-step";

const checkPermission = createStep(
  checkPermissionStepId,
  async (
    { userId, resource, action, clientId }: CheckPermissionInput,
    { container }
  ): Promise<StepResponse<boolean>> => {
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);
    const permissionSlug = generatePermissionSlug(resource, action);
    const manageSlug = generatePermissionSlug(resource, ActionType.MANAGE);

    const userRoles = (await rbacService.listUserRoles({
      where: { user_id: userId, ...(clientId && { client_id: clientId }) },
      relations: ["role", "role.permissions", "role.permissions.permission"],
    } as ListUserRolesOptions)) as UserRoleDTO[];

    const hasPermission = userRoles.some((userRole) =>
      userRole.role.permissions?.some(
        (rp) => rp.permission.slug === permissionSlug || rp.permission.slug === manageSlug
      )
    );

    return new StepResponse(hasPermission);
  }
);

export default checkPermission;
