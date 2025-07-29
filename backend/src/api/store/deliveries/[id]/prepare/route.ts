import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { awaitStartPreparationStepId } from "workflows/delivery/steps/await-start-preparation";
import { DeliveryStatus } from "../../../../../modules";
import { updateDeliveryWorkflow } from "../../../../../workflows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const data = {
    id,
    delivery_status: DeliveryStatus.RESTAURANT_PREPARING,
  };

  const updatedDelivery = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToSucceed: awaitStartPreparationStepId,
      },
    })
    .catch((error) => {
      return MedusaError.Types.UNEXPECTED_STATE;
    });

  return res.status(200).json({ delivery: updatedDelivery });
}
