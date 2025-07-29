import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { awaitPreparationStepId } from "workflows/delivery/steps/await-preparation";
import { DeliveryStatus } from "../../../../../modules";
import { updateDeliveryWorkflow } from "../../../../../workflows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const data = {
    id,
    delivery_status: DeliveryStatus.READY_FOR_PICKUP,
  };

  const updatedDelivery = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToSucceed: awaitPreparationStepId,
      },
    })
    .catch((error) => {
      return MedusaError.Types.UNEXPECTED_STATE;
    });

  return res.status(200).json({ delivery: updatedDelivery });
}
