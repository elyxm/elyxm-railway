import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { RBAC_MODULE, RbacModuleService } from "../../../modules/rbac";
import { ListRolesOptions, RoleDTO } from "../../../modules/rbac/types/common";

export type ListRolesInput = {
  filters?: Record<string, any>;
  config?: ListRolesOptions;
};

export const listRolesStepId = "list-roles-step";

const listRoles = createStep(
  listRolesStepId,
  async ({ filters = {}, config = {} }: ListRolesInput, { container }): Promise<StepResponse<[RoleDTO[], number]>> => {
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);
    const [roles, count] = await rbacService.listAndCountRoles(filters, config);
    return new StepResponse([roles, count]);
  }
);

export default listRoles;
