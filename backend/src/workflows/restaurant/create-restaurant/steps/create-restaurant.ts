import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { RESTAURANT_MODULE } from "modules/restaurant";
import RestaurantModuleService from "modules/restaurant/service";
import { CreateRestaurantWorkflowInput } from "..";

export const createRestaurantStepId = "create-restaurant";

const createRestaurantStep = createStep(
  createRestaurantStepId,
  async (data: CreateRestaurantWorkflowInput, { container }) => {
    const restaurantModuleService: RestaurantModuleService = container.resolve(RESTAURANT_MODULE);

    const restaurant = await restaurantModuleService.createRestaurants(data);

    return new StepResponse(restaurant, restaurant.id);
  },
  function (input, { container }) {
    if (!input) {
      return;
    }
    const restaurantModuleService: RestaurantModuleService = container.resolve(RESTAURANT_MODULE);

    return restaurantModuleService.deleteRestaurants([input]);
  }
);

export default createRestaurantStep;
