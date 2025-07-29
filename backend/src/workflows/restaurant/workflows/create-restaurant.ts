import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createRestaurantStep } from "../";
import { CreateRestaurantDTO } from "../../../modules";

const createRestaurantWorkflowId = "create-restaurant-workflow";

const createRestaurantWorkflow = createWorkflow(createRestaurantWorkflowId, function (input: CreateRestaurantDTO) {
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

export default createRestaurantWorkflow;
