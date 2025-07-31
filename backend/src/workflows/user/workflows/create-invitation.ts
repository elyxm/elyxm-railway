import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import createInvitationStep from "../steps/create-invitation";

export type CreateInvitationWorkflowInput = {
  email: string;
  client_id: string;
  role_id?: string;
  inviter_id: string;
  expires_at?: Date;
};

export const createInvitationWorkflowId = "create-invitation";

const createInvitationWorkflow = createWorkflow(
  createInvitationWorkflowId,
  function (input: WorkflowData<CreateInvitationWorkflowInput>) {
    const invite = createInvitationStep(input);

    return new WorkflowResponse(invite);
  }
);

export default createInvitationWorkflow;
