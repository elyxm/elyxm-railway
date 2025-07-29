import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import {
  DELIVERY_MODULE,
  DeliveryModuleService,
  RESTAURANT_MODULE,
  RestaurantModuleService,
} from "../../../../modules";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { user_id, actor_type } = req.user as {
    user_id: string;
    actor_type: "restaurant" | "driver";
  };

  if (actor_type === "restaurant") {
    const service: RestaurantModuleService = req.scope.resolve(RESTAURANT_MODULE);
    const user = await service.retrieveRestaurantAdmin(user_id);
    return res.json({ user });
  }

  if (actor_type === "driver") {
    const service: DeliveryModuleService = req.scope.resolve(DELIVERY_MODULE);
    const user = await service.retrieveDriver(user_id);
    return res.json({ user });
  }

  return res.status(404).json({ message: "User not found" });
};
