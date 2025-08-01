import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import createRoleStep, { CreateRoleDTO } from "../steps/create-role";

export const createRoleWorkflowId = "create-role-workflow";

const createRoleWorkflow = createWorkflow(createRoleWorkflowId, function (input: WorkflowData<CreateRoleDTO>) {
  const result = createRoleStep(input);
  return new WorkflowResponse(result);
});

export default createRoleWorkflow;
