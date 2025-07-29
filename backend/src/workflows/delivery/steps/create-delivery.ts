import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE, DeliveryDTO, DeliveryModuleService } from "../../../modules";

export const createDeliveryStepId = "create-delivery-step";

const createDeliveryStep = createStep(
  createDeliveryStepId,
  async (data: {}, { container }) => {
    const deliveryModuleService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    const delivery = (await deliveryModuleService.createDeliveries({})) as unknown as DeliveryDTO;

    return new StepResponse(delivery, { delivery_id: delivery.id });
  },
  async function (input, { container }) {
    if (!input) {
      return;
    }

    const deliveryModuleService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    return deliveryModuleService.softDeleteDeliveries(input.delivery_id);
  }
);

export default createDeliveryStep;
