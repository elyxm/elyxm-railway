import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { DeliveryDTO, UpdateDeliveryDTO } from "../../../modules";
import { setStepFailedStep, setStepSuccessStep, updateDeliveryStep } from "../steps";

export type WorkflowInput = {
  data: UpdateDeliveryDTO;
  stepIdToSucceed?: string;
  stepIdToFail?: string;
};

export const updateDeliveryWorkflowId = "update-delivery-workflow";

const updateDeliveryWorkflow = createWorkflow(updateDeliveryWorkflowId, function (input: WorkflowData<WorkflowInput>) {
  // Update the delivery with the provided data
  const updatedDelivery = updateDeliveryStep({
    data: input.data,
  });

  // If a stepIdToSucceed is provided, we will set that step as successful
  setStepSuccessStep({
    stepId: input.stepIdToSucceed,
    updatedDelivery: updatedDelivery as unknown as DeliveryDTO,
  });

  // If a stepIdToFail is provided, we will set that step as failed
  setStepFailedStep({
    stepId: input.stepIdToFail,
    updatedDelivery: updatedDelivery as unknown as DeliveryDTO,
  });

  // Return the updated delivery
  return new WorkflowResponse(updatedDelivery);
});

export default updateDeliveryWorkflow;
