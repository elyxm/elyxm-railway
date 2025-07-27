import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import createMerchantOrdersWorkflow from "../../../../../workflows/marketplace/create-merchant-orders";

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const cartId = req.params.id;

  const { result } = await createMerchantOrdersWorkflow(req.scope).run({
    input: {
      cart_id: cartId,
    },
  });

  res.json({
    type: "order",
    order: result.parent_order,
  });
};
