import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createRestaurantStep } from "./steps";

export type CreateRestaurantWorkflowInput = {
  name: string;
  handle: string;
  address: string;
  phone: string;
  email: string;
  image_url?: string;
};

export const createRestaurantWorkflow = createWorkflow(
  "create-restaurant",
  function (input: CreateRestaurantWorkflowInput) {
    const restaurant = createRestaurantStep({
      name: input.name,
      handle: input.handle,
      address: input.address,
      phone: input.phone,
      email: input.email,
      image_url: input.image_url,
    });

    return new WorkflowResponse(restaurant);
  }
);
