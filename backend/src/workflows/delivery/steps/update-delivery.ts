import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import DeliveryModuleService from "../../../modules/delivery/service";
import { UpdateDeliveryDTO } from "../../../modules/delivery/types/mutations";

type UpdateDeliveryStepInput = {
  data: UpdateDeliveryDTO;
};

export const updateDeliveryStepId = "update-delivery-step";

const updateDeliveryStep = createStep(updateDeliveryStepId, async (input: UpdateDeliveryStepInput, { container }) => {
  const deliveryModuleService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

  const delivery = await deliveryModuleService.updateDeliveries([input.data]).then((res) => res[0]);

  if (!delivery) {
    throw new Error("Delivery not found");
  }

  const updatedDelivery = await deliveryModuleService.retrieveDelivery(delivery.id, {
    relations: ["items", "restaurant"],
  });

  return new StepResponse(updatedDelivery, delivery.id);
});

export default updateDeliveryStep;
