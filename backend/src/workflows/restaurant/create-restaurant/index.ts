import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { CreateRestaurantDTO } from "../../../modules/restaurant/types/mutations";
import { createRestaurantStep } from "./steps";

export const createRestaurantWorkflow = createWorkflow("create-restaurant", function (input: CreateRestaurantDTO) {
  const restaurant = createRestaurantStep({
    name: input.name,
    handle: input.handle,
    address: input.address,
    phone: input.phone,
    email: input.email,
    image_url: input.image_url,
  });

  return new WorkflowResponse(restaurant);
});
