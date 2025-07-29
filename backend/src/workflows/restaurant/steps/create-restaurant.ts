import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import RestaurantModuleService from "../../../modules/restaurant/service";
import { CreateRestaurantDTO } from "../../../modules/restaurant/types/mutations";

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
