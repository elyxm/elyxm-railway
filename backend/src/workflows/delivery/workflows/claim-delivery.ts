import { createWorkflow, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { DeliveryDTO, DeliveryStatus } from "../../../modules/delivery/types/common";
import { deleteDeliveryDriversStep, setStepSuccessStep, updateDeliveryStep } from "../steps";
import { findDriverStepId } from "../steps/find-driver";

export type ClaimWorkflowInput = {
  driver_id: string;
  delivery_id: string;
};

export const claimDeliveryWorkflowId = "create-delivery-workflow";

const claimDeliveryWorkflow = createWorkflow(
  claimDeliveryWorkflowId,
  (input: WorkflowData<ClaimWorkflowInput>): WorkflowResponse<DeliveryDTO> => {
    const claimedDelivery = updateDeliveryStep({
      data: {
        id: input.delivery_id,
        driver_id: input.driver_id,
        delivery_status: DeliveryStatus.PICKUP_CLAIMED,
      },
    });

    // Delete the delivery drivers as they are no longer needed
    deleteDeliveryDriversStep({ delivery_id: claimedDelivery.id });

    // Set the step success for the find driver step
    setStepSuccessStep({
      stepId: findDriverStepId,
      updatedDelivery: claimedDelivery as unknown as DeliveryDTO,
    });

    // Return the updated delivery
    return new WorkflowResponse(claimedDelivery as unknown as DeliveryDTO);
  }
);

export default claimDeliveryWorkflow;
