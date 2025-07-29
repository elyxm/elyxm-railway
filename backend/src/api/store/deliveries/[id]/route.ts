import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import zod from "zod";
import { DeliveryStatus, UpdateDeliveryDTO } from "../../../../modules";
import { updateDeliveryWorkflow } from "../../../../workflows";

const schema = zod.object({
  driver_id: zod.string().optional(),
  notified_driver_ids: zod.array(zod.string()).optional(),
  order_id: zod.string().optional(),
  delivery_status: zod.nativeEnum(DeliveryStatus).optional(),
  eta: zod.date().optional(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = schema.parse(req.body);

  const deliveryId = req.params.id;

  const updateData: UpdateDeliveryDTO = {
    id: deliveryId,
    ...validatedBody,
  };

  if (validatedBody.delivery_status === "delivered") {
    updateData.delivered_at = new Date();
  }

  const delivery = await updateDeliveryWorkflow(req.scope).run({
    input: {
      data: updateData,
    },
  });

  return res.status(200).json({ delivery });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const deliveryId = req.params.id;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const deliveryQuery = {
    entity: "delivery",
    fields: ["*", "cart.*", "cart.items.*", "order.*", "order.items.*", "restaurant.*"],
    filters: {
      id: deliveryId,
    },
  };

  const {
    data: [delivery],
  } = await query.graph(deliveryQuery);

  if (!delivery) {
    return res.status(404).json({ message: "Delivery not found" });
  }

  return res.status(200).json({ delivery });
}
