import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/utils";
import zod from "zod";
import { CreateRestaurantDTO } from "../../../modules";
import { createRestaurantWorkflow } from "../../../workflows";

const schema = zod
  .object({
    name: zod.string(),
    handle: zod.string(),
    description: zod.string().optional(),
    is_open: zod.boolean().optional(),
    phone: zod.string().optional(),
    email: zod.string().optional(),
    address: zod.string().optional(),
    image_url: zod.string().optional(),
  })
  .required({
    name: true,
    handle: true,
  });

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    console.log("Admin: Received restaurant creation request:", JSON.stringify(req.body, null, 2));

    const validatedBody = schema.parse(req.body) as CreateRestaurantDTO;
    console.log("Admin: Validated body:", JSON.stringify(validatedBody, null, 2));

    console.log("Admin: Starting restaurant creation workflow...");
    const { result: restaurant } = await createRestaurantWorkflow(req.scope).run({
      input: validatedBody,
    });

    console.log("Admin: Restaurant created successfully:", JSON.stringify(restaurant, null, 2));
    return res.status(201).json({ message: "Restaurant created", restaurant });
  } catch (error) {
    console.error("Admin: Error creating restaurant:", error);
    console.error("Admin: Error stack:", error instanceof Error ? error.stack : "No stack trace");

    if (error instanceof zod.ZodError) {
      console.log("Admin: Validation errors:", error.errors);
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Failed to create restaurant",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    console.log("Admin: Fetching restaurants...");

    const { currency_code = "eur", ...queryFilters } = req.query;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const restaurantsQuery = {
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
      filters: queryFilters,
      context: {
        products: {
          variants: {
            calculated_price: QueryContext({
              currency_code,
            }),
          },
        },
      },
    };

    const { data: restaurants } = await query.graph(restaurantsQuery);
    console.log(`Admin: Found ${restaurants?.length || 0} restaurants`);

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Admin: Error fetching restaurants:", error);
    return res.status(500).json({
      message: "Failed to fetch restaurants",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
