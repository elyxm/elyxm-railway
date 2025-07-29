import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { CreateRestaurantDTO, RESTAURANT_MODULE, RestaurantModuleService } from "../../../modules";

export const createRestaurantStepId = "create-restaurant-step";

const createRestaurantStep = createStep(
  createRestaurantStepId,
  async (data: CreateRestaurantDTO, { container }) => {
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
