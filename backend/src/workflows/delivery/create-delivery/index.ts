import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createDeliveryStep } from "./steps";

export type CreateDeliveryWorkflowInput = {
  cart_id: string;
  restaurant_id: string;
};

export const createRestaurantWorkflow = createWorkflow(
  "create-delivery",
  function (input: CreateDeliveryWorkflowInput) {
    const restaurant = createDeliveryStep({
      cart_id: input.cart_id,
      restaurant_id: input.restaurant_id,
    });

    return new WorkflowResponse(restaurant);
  }
);
