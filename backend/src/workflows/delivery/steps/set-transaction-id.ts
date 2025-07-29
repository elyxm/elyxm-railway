import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE, DeliveryModuleService } from "../../../modules";

export type SetTransactionIdStepInput = {
  delivery_id: string;
};

export const setTransactionIdStepId = "set-transaction-id-step";

const setTransactionIdStep = createStep(
  setTransactionIdStepId,
  async function (deliveryId: string, { container, context }) {
    const service: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    const delivery = await service.updateDeliveries({
      id: deliveryId,
      transaction_id: context.transactionId,
    });

    return new StepResponse(delivery, delivery.id);
  },
  async function (delivery_id: string | undefined, { container }) {
    if (!delivery_id) {
      return;
    }

    const service: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    await service.updateDeliveries({
      id: delivery_id,
      transaction_id: null,
    });
  }
);

export default setTransactionIdStep;
