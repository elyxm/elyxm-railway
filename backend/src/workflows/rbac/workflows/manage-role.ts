import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { CheckPermissionInput, checkPermissionStep, ListRolesInput, listRolesStep } from "../steps";

export const listRolesWorkflowId = "list-roles-workflow";
export const checkPermissionWorkflowId = "check-permission-workflow";

export const listRolesWorkflow = createWorkflow(listRolesWorkflowId, function (input: WorkflowData<ListRolesInput>) {
  const result = listRolesStep(input);
  return new WorkflowResponse(result);
});

export const checkPermissionWorkflow = createWorkflow(
  checkPermissionWorkflowId,
  function (input: WorkflowData<CheckPermissionInput>) {
    const result = checkPermissionStep(input);
    return new WorkflowResponse(result);
  }
);
