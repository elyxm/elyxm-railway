import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { DeliveryStatus } from "../../../../../modules";
import { updateDeliveryWorkflow } from "../../../../../workflows";
import { notifyRestaurantStepId } from "../../../../../workflows/delivery/steps/notify-restaurant";

const DEFAULT_PROCESSING_TIME = 30 * 60 * 1000; // 30 min

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const eta = new Date(new Date().getTime() + DEFAULT_PROCESSING_TIME);

  const data = {
    id,
    delivery_status: DeliveryStatus.RESTAURANT_ACCEPTED,
    eta,
  };

  const { result: updatedDelivery } = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToSucceed: notifyRestaurantStepId,
      },
    })
    .catch((error: Error) => {
      // Log the full error for debugging purposes
      console.error("Workflow execution failed:", error);
      // Throw a new MedusaError to be handled by the centralized middleware
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An unexpected error occurred while accepting the delivery: ${error.message}`
      );
    });

  return res.status(200).json({ delivery: updatedDelivery });
}
