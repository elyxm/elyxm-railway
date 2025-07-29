import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { awaitPickUpStepId } from "workflows/delivery/steps/await-pick-up";
import { DeliveryStatus } from "../../../../../modules";
import { updateDeliveryWorkflow } from "../../../../../workflows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const data = {
    id,
    delivery_status: DeliveryStatus.IN_TRANSIT,
  };

  const updatedDelivery = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToSucceed: awaitPickUpStepId,
      },
    })
    .catch((error) => {
      console.log(error);
      return MedusaError.Types.UNEXPECTED_STATE;
    });

  return res.status(200).json({ delivery: updatedDelivery });
}
