import { LinkDefinition } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createWorkflow, transform, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createDeliveryStep } from "../";
import { createRemoteLinkStep } from "../../../../node_modules/@medusajs/core-flows";
import { CreateDeliveryDTO, DELIVERY_MODULE, DeliveryDTO, RESTAURANT_MODULE } from "../../../modules";

export const createDeliveryWorkflowId = "create-delivery-workflow";

const createDeliveryWorkflow = createWorkflow(
  createDeliveryWorkflowId,
  (input: WorkflowData<CreateDeliveryDTO>): WorkflowResponse<DeliveryDTO> => {
    const delivery = createDeliveryStep();

    const links = transform(
      {
        input,
        delivery,
      },
      (data): LinkDefinition[] => [
        {
          [DELIVERY_MODULE]: {
            delivery_id: data.delivery.id,
          },
          [Modules.CART]: {
            cart_id: data.input.cart_id,
          },
        },
        {
          [RESTAURANT_MODULE]: {
            restaurant_id: data.input.restaurant_id,
          },
          [DELIVERY_MODULE]: {
            delivery_id: data.delivery.id,
          },
        },
      ]
    );

    createRemoteLinkStep(links);

    return new WorkflowResponse(delivery);
  }
);

export default createDeliveryWorkflow;
