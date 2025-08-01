import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { RBAC_MODULE, RbacModuleService } from "../../../modules/rbac";
import { ScopeType } from "../../../modules/rbac/types/common";

export type CreateRoleDTO = {
  name: string;
  slug: string;
  description?: string | null;
  scope_type: ScopeType;
  scope_id?: string | null;
  is_global: boolean;
};

export const createRoleStepId = "create-role-step";

const createRoleStep = createStep(
  createRoleStepId,
  async (data: CreateRoleDTO, { container }) => {
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);

    const role = await rbacService.createRoles(data);

    return new StepResponse(role, role.id);
  },
  function (input, { container }) {
    if (!input) {
      return;
    }
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);

    return rbacService.deleteRoles([input]);
  }
);

export default createRoleStep;
