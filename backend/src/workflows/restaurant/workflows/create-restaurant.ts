import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { CreateRestaurantDTO } from "../../../modules/restaurant/types/mutations";
import { createRestaurantStep } from "../steps";

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
