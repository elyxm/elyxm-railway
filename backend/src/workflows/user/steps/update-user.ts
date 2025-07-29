import { MedusaError } from "@medusajs/utils";
import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import {
  DELIVERY_MODULE,
  DeliveryModuleService,
  DriverDTO,
  RESTAURANT_MODULE,
  RestaurantAdminDTO,
  RestaurantModuleService,
  UpdateRestaurantAdminsDTO,
  UpdateRestaurantsDTO,
} from "../../../modules";

type UpdateUserStepInput = (UpdateRestaurantsDTO | UpdateRestaurantAdminsDTO) & {
  actor_type: "restaurant" | "driver";
};

export const updateUserStepId = "update-user-step";

const updateUserStep = createStep(
  updateUserStepId,
  async (
    input: UpdateUserStepInput,
    { container }
  ): Promise<StepResponse<RestaurantAdminDTO | DriverDTO, UpdateUserStepInput>> => {
    const { actor_type, ...data } = input;

    if (actor_type === "restaurant") {
      const service: RestaurantModuleService = container.resolve(RESTAURANT_MODULE);

      const compensationData = {
        ...(await service.retrieveRestaurantAdmin(data.id)),
        actor_type: "restaurant" as "restaurant",
      };

      const restaurantAdmin = (await service.updateRestaurantAdmins(data)) as RestaurantAdminDTO;

      return new StepResponse(restaurantAdmin, compensationData);
    }

    if (actor_type === "driver") {
      const service: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

      const compensationData = {
        ...(await service.retrieveDriver(data.id)),
        actor_type: "driver" as "driver",
      };

      const driver = (await service.updateDrivers(data)) as DriverDTO;

      return new StepResponse(driver, compensationData);
    }

    throw MedusaError.Types.INVALID_DATA;
  },
  function (input: UpdateUserStepInput | undefined, { container }) {
    if (!input) {
      return;
    }
    const { actor_type, ...data } = input;

    if (actor_type === "restaurant") {
      const service: RestaurantModuleService = container.resolve(RESTAURANT_MODULE);

      return service.updateRestaurantAdmins(data);
    }

    if (actor_type === "driver") {
      const service: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

      return service.updateDrivers(data);
    }
  }
);

export default updateUserStep;
