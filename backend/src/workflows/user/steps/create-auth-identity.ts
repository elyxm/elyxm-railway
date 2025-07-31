import { ModuleRegistrationName } from "@medusajs/utils";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";

export const createAuthIdentityStepId = "create-auth-identity-step";

export type CreateAuthIdentityStepInput = {
  email: string;
  password: string;
  user_id: string;
};

const createAuthIdentityStep = createStep(
  createAuthIdentityStepId,
  async function (data: CreateAuthIdentityStepInput, { container }) {
    const authService = container.resolve(ModuleRegistrationName.AUTH);

    // Use the auth provider's register method to properly hash the password
    const authIdentity = await authService.register("emailpass", {
      body: {
        email: data.email,
        password: data.password,
      },
    });

    if (!authIdentity.success) {
      throw new Error(`Failed to create auth identity: ${authIdentity.error}`);
    }

    if (!authIdentity.authIdentity) {
      throw new Error("Auth identity was not created successfully");
    }

    // Update the auth identity with app_metadata to link it to the user
    const updatedAuthIdentity = await authService.updateAuthIdentities({
      id: authIdentity.authIdentity.id,
      app_metadata: {
        user_id: data.user_id,
      },
    });

    return new StepResponse(updatedAuthIdentity, {
      authIdentityId: updatedAuthIdentity.id,
      userId: data.user_id,
    });
  },
  async function (input: any, { container }) {
    if (!input) {
      return;
    }

    const authService = container.resolve(ModuleRegistrationName.AUTH);

    // If the workflow fails, delete the created auth identity
    await authService.deleteAuthIdentities([input.authIdentityId]);
  }
);

export default createAuthIdentityStep;
