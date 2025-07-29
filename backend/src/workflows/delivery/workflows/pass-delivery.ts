import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { DeliveryDTO } from "../../../modules";
import { deleteDeliveryDriversStep } from "../steps";

export type PassDeliveryWorkflowInput = {
  driver_id: string;
  delivery_id: string;
};

export const passDeliveryWorkflowId = "pass-delivery-workflow";

const passDeliveryWorkflow = createWorkflow(
  passDeliveryWorkflowId,
  function (input: WorkflowData<PassDeliveryWorkflowInput>) {
    // Delete the delivery drivers as they are no longer needed
    deleteDeliveryDriversStep({
      delivery_id: input.delivery_id,
      driver_id: input.driver_id,
    });

    return new WorkflowResponse({} as DeliveryDTO);
  }
);

export default passDeliveryWorkflow;
