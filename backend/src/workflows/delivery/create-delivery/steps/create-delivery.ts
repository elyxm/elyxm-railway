import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE } from "modules/delivery";
import DeliveryModuleService from "modules/delivery/service";
import { CreateDeliveryWorkflowInput } from "..";

export const createDeliveryStepId = "create-delivery";

const createDeliveryStep = createStep(
  createDeliveryStepId,
  async (data: CreateDeliveryWorkflowInput, { container }) => {
    const deliveryModuleService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    const delivery = await deliveryModuleService.createDeliveries(data);

    return new StepResponse(delivery, delivery.id);
  },
  function (input, { container }) {
    if (!input) {
      return;
    }
    const deliveryModuleService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    return deliveryModuleService.deleteDeliveries([input]);
  }
);

export default createDeliveryStep;
