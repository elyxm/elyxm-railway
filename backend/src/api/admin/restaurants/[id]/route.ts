import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/utils";
import zod from "zod";
import { RESTAURANT_MODULE, RestaurantModuleService, UpdateRestaurantsDTO } from "../../../../modules";

const updateSchema = zod
  .object({
    name: zod.string().optional(),
    handle: zod.string().optional(),
    description: zod.string().optional(),
    is_open: zod.boolean().optional(),
    phone: zod.string().optional(),
    email: zod.string().optional(),
    address: zod.string().optional(),
    image_url: zod.string().optional(),
  })
  .strict();

// GET individual restaurant
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    console.log(`Admin: Fetching restaurant with ID: ${id}`);

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const restaurantQuery = {
      entity: "restaurant",
      fields: [
        "id",
        "name",
        "handle",
        "description",
        "is_open",
        "address",
        "phone",
        "email",
        "image_url",
        "created_at",
        "updated_at",
        "products.*",
        "products.categories.*",
        "products.variants.*",
        "products.variants.calculated_price.*",
      ],
      filters: { id },
      context: {
        products: {
          variants: {
            calculated_price: QueryContext({
              currency_code: req.query.currency_code || "eur",
            }),
          },
        },
      },
    };

    const { data: restaurants } = await query.graph(restaurantQuery);

    if (!restaurants || restaurants.length === 0) {
      console.log(`Admin: Restaurant not found with ID: ${id}`);
      return res.status(404).json({ message: "Restaurant not found" });
    }

    console.log(`Admin: Found restaurant: ${restaurants[0].name}`);
    return res.status(200).json({ restaurant: restaurants[0] });
  } catch (error) {
    console.error("Admin: Error fetching restaurant:", error);
    return res.status(500).json({
      message: "Failed to fetch restaurant",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// PUT update restaurant
export async function PUT(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    console.log(`Admin: Updating restaurant with ID: ${id}`, JSON.stringify(req.body, null, 2));

    const validatedBody = updateSchema.parse(req.body) as Partial<UpdateRestaurantsDTO>;

    if (!validatedBody || Object.keys(validatedBody).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    const restaurantService: RestaurantModuleService = req.scope.resolve(RESTAURANT_MODULE);

    const updateData: UpdateRestaurantsDTO = {
      id,
      ...validatedBody,
    };

    const restaurant = await restaurantService.updateRestaurants(updateData);
    console.log(`Admin: Restaurant updated successfully: ${restaurant.name}`);

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Admin: Error updating restaurant:", error);

    if (error instanceof zod.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Failed to update restaurant",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// DELETE restaurant
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    console.log(`Admin: Deleting restaurant with ID: ${id}`);

    const restaurantService: RestaurantModuleService = req.scope.resolve(RESTAURANT_MODULE);

    await restaurantService.deleteRestaurants([id]);
    console.log(`Admin: Restaurant deleted successfully: ${id}`);

    return res.status(200).json({
      message: "Restaurant deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Admin: Error deleting restaurant:", error);
    return res.status(500).json({
      message: "Failed to delete restaurant",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
