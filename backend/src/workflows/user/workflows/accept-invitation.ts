import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { acceptInvitationStep, createAuthIdentityStep, createUserAccountStep } from "../steps";

export type AcceptInvitationWorkflowInput = {
  token: string;
  user_data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  };
};

export const acceptInvitationWorkflowId = "accept-invitation";

const acceptInvitationWorkflow = createWorkflow(
  acceptInvitationWorkflowId,
  function (input: WorkflowData<AcceptInvitationWorkflowInput>): WorkflowResponse<{
    message: string;
    result: {
      invitation: any[];
      user: any;
    };
  }> {
    // Step 1: Accept the invitation
    const acceptedInvite = acceptInvitationStep(input);

    // Step 2: Create user account and assign role
    const userAccountData = {
      email: input.user_data.email,
      first_name: input.user_data.first_name,
      last_name: input.user_data.last_name,
      client_id: acceptedInvite.client_id,
      role_id: acceptedInvite.role_id || undefined,
    };

    const userResult = createUserAccountStep(userAccountData);

    // Step 3: Create auth identity with password
    const authIdentity = createAuthIdentityStep({
      email: input.user_data.email,
      password: input.user_data.password,
      user_id: userResult.user.id,
    });

    return new WorkflowResponse({
      message: "Invitation accepted successfully",
      result: {
        invitation: [
          {
            id: acceptedInvite.id,
            email: acceptedInvite.email,
            client_id: acceptedInvite.client_id,
            role_id: acceptedInvite.role_id,
          },
        ],
        user: { id: userResult.user.id, email: userResult.user.email },
      },
    });
  }
);

export default acceptInvitationWorkflow;
