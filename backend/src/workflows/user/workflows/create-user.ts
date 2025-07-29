import { createWorkflow, transform, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { setAuthAppMetadataStep } from "../../../../node_modules/@medusajs/core-flows";
import createUserStep from "../steps/create-user";

export type CreateRestaurantAdminInput = {
  restaurant_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type CreateDriverInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
};

export type CreateUserWorkflowInput = {
  user: (CreateRestaurantAdminInput | CreateDriverInput) & {
    actor_type: "restaurant" | "driver";
  };
  auth_identity_id: string;
};

export const createUserWorkflowId = "create-user-workflow";

const createUserWorkflow = createWorkflow(
  createUserWorkflowId,
  function (input: WorkflowData<CreateUserWorkflowInput>) {
    let user = createUserStep(input.user);

    const authUserInput = transform({ input, user }, ({ input, user }) => {
      const data = {
        authIdentityId: input.auth_identity_id,
        actorType: input.user.actor_type,
        key: input.user.actor_type === "restaurant" ? "restaurant_id" : "driver_id",
        value: user.id,
      };

      return data;
    });

    setAuthAppMetadataStep(authUserInput);

    return new WorkflowResponse(user);
  }
);

export default createUserWorkflow;
