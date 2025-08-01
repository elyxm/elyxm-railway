import { MedusaError } from "@medusajs/utils";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { CreateDriverInput, CreateRestaurantAdminInput } from "../";
import {
  DELIVERY_MODULE,
  DeliveryModuleService,
  DriverDTO,
  RESTAURANT_MODULE,
  RestaurantAdminDTO,
  RestaurantModuleService,
} from "../../../modules";

type CreateUserStepInput = (CreateRestaurantAdminInput | CreateDriverInput) & {
  actor_type: "restaurant" | "driver";
};

type CompensationStepInput = {
  id: string;
  actor_type: string;
};

export const createUserStepId = "create-user-step";

const createUserStep = createStep(
  createUserStepId,
  async (
    input: CreateUserStepInput,
    { container }
  ): Promise<StepResponse<RestaurantAdminDTO | DriverDTO, CompensationStepInput>> => {
    if (input.actor_type === "restaurant") {
      const service: RestaurantModuleService = container.resolve(RESTAURANT_MODULE);

      const restaurantAdmin = await service.createRestaurantAdmins(input as CreateRestaurantAdminInput);

      const compensationData = {
        id: restaurantAdmin.id,
        actor_type: "restaurant",
      };

      return new StepResponse(restaurantAdmin as RestaurantAdminDTO, compensationData);
    }

    if (input.actor_type === "driver") {
      const service: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

      const driver = await service.createDrivers(input as CreateDriverInput);

      const driverWithAvatar = await service.updateDrivers({
        id: driver.id,
        avatar_url: `https://robohash.org/${driver.id}?size=40x40&set=set1&bgset=bg1`,
      });

      const compensationData = {
        id: driverWithAvatar.id,
        actor_type: "driver",
      };

      return new StepResponse(driverWithAvatar as DriverDTO, compensationData);
    }

    throw MedusaError.Types.INVALID_DATA;
  },
  function (compensationInput, { container }) {
    if (!compensationInput) {
      return;
    }
    if (compensationInput.actor_type === "restaurant") {
      const service: RestaurantModuleService = container.resolve(RESTAURANT_MODULE);

      return service.deleteRestaurantAdmins(compensationInput.id);
    }

    if (compensationInput.actor_type === "driver") {
      const service: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

      return service.deleteDrivers(compensationInput.id);
    }
  }
);

export default createUserStep;
