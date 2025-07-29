import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { DeliveryStatus } from "../../../../../modules";
import { updateDeliveryWorkflow } from "../../../../../workflows";
import { notifyRestaurantStepId } from "../../../../../workflows/delivery/steps/notify-restaurant";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const data = {
    id,
    delivery_status: DeliveryStatus.RESTAURANT_DECLINED,
  };

  const updatedDelivery = await updateDeliveryWorkflow(req.scope)
    .run({
      input: {
        data,
        stepIdToFail: notifyRestaurantStepId,
      },
    })
    .catch((error) => {
      return MedusaError.Types.UNEXPECTED_STATE;
    });

  return res.status(200).json({ delivery: updatedDelivery });
}
