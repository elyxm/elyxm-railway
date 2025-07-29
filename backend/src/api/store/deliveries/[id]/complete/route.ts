import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { DeliveryStatus } from "../../../../../modules";
import { updateDeliveryWorkflow } from "../../../../../workflows";
import { awaitDeliveryStepId } from "../../../../../workflows/delivery/steps/await-delivery";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const data = {
    id,
    delivery_status: DeliveryStatus.DELIVERED,
    delivered_at: new Date(),
  };

  const { result: updatedDelivery } = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToSucceed: awaitDeliveryStepId,
      },
    })
    .catch((error: Error) => {
      // Log the full error for debugging purposes
      console.error("Workflow execution failed:", error);
      // Throw a new MedusaError to be handled by the centralized middleware
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An unexpected error occurred while completing the delivery: ${error.message}`
      );
    });

  return res.status(200).json({ delivery: updatedDelivery });
}
