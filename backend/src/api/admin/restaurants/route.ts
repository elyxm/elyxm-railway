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
    console.log("Admin: Fetching restaurants...", req.query);

    const {
      currency_code = "eur",
      limit = "20",
      offset = "0",
      order = "created_at:desc",
      q,
      is_open,
      phone,
      email,
      address,
      created_at,
      updated_at,
      ...otherFilters
    } = req.query;

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Build filters object
    const filters: any = { ...otherFilters };

    // Handle search query
    if (q) {
      filters.$or = [
        { name: { $ilike: `%${q}%` } },
        { description: { $ilike: `%${q}%` } },
        { email: { $ilike: `%${q}%` } },
        { address: { $ilike: `%${q}%` } },
      ];
    }

    // Handle boolean filters
    if (is_open !== undefined) {
      filters.is_open = is_open === "true";
    }

    // Handle text filters
    if (phone) {
      if (phone === "true") {
        filters.phone = { $ne: null };
      } else if (phone === "false") {
        filters.phone = null;
      }
    }

    if (email) {
      if (email === "true") {
        filters.email = { $ne: null };
      } else if (email === "false") {
        filters.email = null;
      }
    }

    // Handle date filters
    if (created_at) {
      try {
        const dateFilter = JSON.parse(created_at as string);
        if (dateFilter.gte || dateFilter.lte) {
          filters.created_at = dateFilter;
        }
      } catch (e) {
        console.warn("Invalid created_at filter:", created_at);
      }
    }

    if (updated_at) {
      try {
        const dateFilter = JSON.parse(updated_at as string);
        if (dateFilter.gte || dateFilter.lte) {
          filters.updated_at = dateFilter;
        }
      } catch (e) {
        console.warn("Invalid updated_at filter:", updated_at);
      }
    }

    // Parse pagination
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Parse ordering
    let orderBy: any = {};
    if (order) {
      const [field, direction] = (order as string).split(":");
      orderBy[field] = direction === "desc" ? "DESC" : "ASC";
    }

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
      filters,
      pagination: {
        skip: offsetNum,
        take: limitNum,
        order: orderBy,
      },
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

    const { data: restaurants, metadata } = await query.graph(restaurantsQuery);
    console.log(`Admin: Found ${restaurants?.length || 0} restaurants (total: ${metadata?.count || 0})`);

    return res.status(200).json({
      restaurants,
      count: metadata?.count || 0,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error("Admin: Error fetching restaurants:", error);
    return res.status(500).json({
      message: "Failed to fetch restaurants",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
