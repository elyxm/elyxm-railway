import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/utils";
import zod from "zod";
import { createDeliveryWorkflow } from "../../../workflows";

const schema = zod.object({
  cart_id: zod.string().startsWith("cart_"),
  restaurant_id: zod.string().startsWith("res_"),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = schema.parse(req.body);

  if (!validatedBody) {
    return MedusaError.Types.INVALID_DATA;
  }

  const { result: delivery } = await createDeliveryWorkflow(req.scope).run({
    input: {
      cart_id: validatedBody.cart_id,
      restaurant_id: validatedBody.restaurant_id,
    },
  });

  // const { transaction } = await handleDeliveryWorkflow(req.scope).run({
  //   input: {
  //     delivery_id: (delivery as Delivery).id,
  //   },
  // });

  // return res.status(500).json({ message: "Not implemented" });
  // return res.status(200).json({ message: "Delivery created", delivery, transaction });
  return res.status(200).json({ message: "Delivery created", delivery });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const filters = {} as Record<string, any>;
  let take = parseInt(req.query.take as string) || undefined;
  let skip = parseInt(req.query.skip as string) || 0;

  for (const key in req.query) {
    if (["take", "skip"].includes(key)) continue;

    filters[key] = req.query[key];
  }
  const deliveryQuery = {
    entity: "delivery",
    fields: ["*", "cart.*", "cart.items.*", "order.*", "order.items.*"],
    filters,
    pagination: {
      take,
      skip,
    },
  };

  const { data: deliveries } = await query.graph(deliveryQuery);

  if (filters.hasOwnProperty("driver_id")) {
    const driverQuery = {
      entity: "delivery_driver",
      fields: ["driver_id", "delivery_id"],
      filters: {
        deleted_at: null,
        driver_id: filters["driver_id"],
      },
    };

    const { data: availableDeliveriesIds } = await query.graph(driverQuery);

    const availableDeliveriesQuery = {
      entity: "delivery",
      fields: ["*", "cart.*", "cart.items.*", "order.*", "order.items.*"],
      filters: {
        id: availableDeliveriesIds.map((d: any) => d.delivery_id),
      },
    };

    const { data: availableDeliveries } = await query.graph(availableDeliveriesQuery);

    deliveries.push(...availableDeliveries);
  }

  return res.status(200).json({ deliveries });
}
