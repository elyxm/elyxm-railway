import { OrderDTO } from "@medusajs/types";
import { ModuleRegistrationName } from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";

export const createFulfillmentStepId = "create-fulfillment-step";

const createFulfillmentStep = createStep(
  createFulfillmentStepId,
  async function (order: OrderDTO, { container }) {
    const fulfillmentModuleService = container.resolve(ModuleRegistrationName.FULFILLMENT);

    const items = order.items?.map((lineItem) => {
      return {
        title: lineItem.title,
        sku: lineItem.variant_sku || "",
        quantity: lineItem.quantity,
        barcode: lineItem.variant_barcode || "",
        line_item_id: lineItem.id,
      };
    });

    const fulfillment = await fulfillmentModuleService.createFulfillment({
      provider_id: "manual_manual",
      location_id: "1",
      delivery_address: order.shipping_address!,
      items: items || [],
      labels: [],
      order,
    });

    return new StepResponse(fulfillment, fulfillment.id);
  },
  function (input: string | undefined, { container }) {
    if (!input) {
      return;
    }
    const fulfillmentModuleService = container.resolve(ModuleRegistrationName.FULFILLMENT);

    return fulfillmentModuleService.softDeleteFulfillmentSets([input]);
  }
);

export default createFulfillmentStep;
