import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError, QueryContext } from "@medusajs/framework/utils";
import zod from "zod";
import { CreateRestaurantDTO } from "../../../modules/restaurant/types/mutations";
import { createRestaurantWorkflow } from "../../../workflows/restaurant";
// import { createRestaurantWorkflow } from "../../../workflows/restaurant/create-restaurant";

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
  const validatedBody = schema.parse(req.body) as CreateRestaurantDTO;

  if (!validatedBody) {
    return MedusaError.Types.INVALID_DATA;
  }

  const { result: restaurant } = await createRestaurantWorkflow(req.scope).run({
    input: validatedBody,
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
      "name",
      "handle",
      "description",
      "is_open",
      "address",
      "phone",
      "email",
      "address",
      "image_url",
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
