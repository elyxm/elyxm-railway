import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import validateInvitationStep from "../steps/validate-invitation";

export type ValidateInvitationWorkflowInput = {
  token: string;
};

export const validateInvitationWorkflowId = "validate-invitation";

const validateInvitationWorkflow = createWorkflow(
  validateInvitationWorkflowId,
  function (input: WorkflowData<ValidateInvitationWorkflowInput>): WorkflowResponse<{
    invitation: any;
  }> {
    // Step 1: Validate the invitation
    const validatedInvite = validateInvitationStep(input);

    return new WorkflowResponse({
      invitation: validatedInvite,
    });
  }
);

export default validateInvitationWorkflow;
