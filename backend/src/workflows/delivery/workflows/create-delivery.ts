import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/types";
import { createWorkflow, transform, WorkflowData, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createRemoteLinkStep } from "../../../../node_modules/@medusajs/core-flows";
import { DELIVERY_MODULE } from "../../../modules/delivery";
import { DeliveryDTO } from "../../../modules/delivery/types/common";
import { CreateDeliveryDTO } from "../../../modules/delivery/types/mutations";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import { createDeliveryStep } from "../steps";

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
