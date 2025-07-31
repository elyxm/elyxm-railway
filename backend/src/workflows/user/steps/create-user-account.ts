import { ModuleRegistrationName } from "@medusajs/utils";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { RBAC_MODULE, RbacModuleService } from "../../../modules/rbac";

export const createUserAccountStepId = "create-user-account-step";

export type CreateUserAccountStepInput = {
  email: string;
  first_name: string;
  last_name: string;
  client_id: string;
  role_id?: string;
};

const createUserAccountStep = createStep(
  createUserAccountStepId,
  async function (data: CreateUserAccountStepInput, { container }) {
    const userService = container.resolve(ModuleRegistrationName.USER);
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);

    // Create the user
    const user = await userService.createUsers({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    });

    // Assign role if provided
    if (data.role_id) {
      await rbacService.assignRoleToUser(user.id, data.role_id, data.client_id, "system");
    }

    return new StepResponse(
      {
        user,
        roleAssigned: !!data.role_id,
      },
      {
        userId: user.id,
        email: user.email,
      }
    );
  },
  async function (input: any, { container }) {
    if (!input) {
      return;
    }

    const userService = container.resolve(ModuleRegistrationName.USER);
    const rbacService: RbacModuleService = container.resolve(RBAC_MODULE);

    // If the workflow fails, clean up:
    // 1. Remove any assigned roles
    if (input.role_id) {
      await rbacService.removeRoleFromUser(input.userId, input.role_id, input.client_id);
    }

    // 2. Delete the created user
    await userService.softDeleteUsers([input.userId]);
  }
);

export default createUserAccountStep;
