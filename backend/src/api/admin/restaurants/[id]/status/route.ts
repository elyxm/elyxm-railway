import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import zod from "zod";
import { RESTAURANT_MODULE, RestaurantModuleService } from "../../../../../modules";

const schema = zod.object({
  is_open: zod.boolean(),
});

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    console.log(`Admin: Updating restaurant status for ID: ${id}`, JSON.stringify(req.body, null, 2));

    const { is_open } = schema.parse(req.body);

    const restaurantService: RestaurantModuleService = req.scope.resolve(RESTAURANT_MODULE);

    const restaurant = await restaurantService.updateRestaurants({
      id,
      is_open,
    });

    console.log(`Admin: Restaurant status updated: ${restaurant.name} is now ${is_open ? "open" : "closed"}`);
    return res.status(200).json({
      message: `Restaurant ${is_open ? "opened" : "closed"} successfully`,
      restaurant,
    });
  } catch (error) {
    console.error("Admin: Error updating restaurant status:", error);

    if (error instanceof zod.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Failed to update restaurant status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
