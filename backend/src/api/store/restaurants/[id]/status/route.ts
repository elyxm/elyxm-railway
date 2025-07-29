import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import zod from "zod";
import { RESTAURANT_MODULE, RestaurantModuleService } from "../../../../../modules";

const schema = zod.object({
  is_open: zod.boolean(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const { is_open } = schema.parse(req.body);

  const restaurantService: RestaurantModuleService = req.scope.resolve(RESTAURANT_MODULE);

  const restaurant = await restaurantService.updateRestaurants({
    id,
    is_open,
  });
  res.status(200).json({ restaurant });
}
