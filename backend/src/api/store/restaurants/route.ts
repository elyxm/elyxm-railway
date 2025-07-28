import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError, QueryContext } from "@medusajs/framework/utils";
import { createRestaurantWorkflow, CreateRestaurantWorkflowInput } from "workflows/restaurant/create-restaurant";
import zod from "zod";

const schema = zod.object({
  name: zod.string(),
  handle: zod.string(),
  address: zod.string(),
  phone: zod.string(),
  email: zod.string(),
  image_url: zod.string().optional(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = schema.parse(req.body) as CreateRestaurantWorkflowInput;

  if (!validatedBody) {
    return MedusaError.Types.INVALID_DATA;
  }

  const { result: restaurant } = await createRestaurantWorkflow(req.scope).run({
    input: {
      ...validatedBody,
    },
  });

  return res.status(200).json({ message: "Restaurant created", restaurant });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { currency_code = "eur", ...queryFilters } = req.query;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const restaurantsQuery = {
    entity: "restaurant",
    fields: [
      "id",
      "handle",
      "name",
      "address",
      "phone",
      "email",
      "image_url",
      "is_open",
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

  return res.status(200).json({ restaurants });
}
