import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import createMerchantProductWorkflow from "../../../workflows/marketplace/create-merchant-product";

export const POST = async (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct>, res: MedusaResponse) => {
  const { result } = await createMerchantProductWorkflow(req.scope).run({
    input: {
      merchant_admin_id: req.auth_context.actor_id,
      product: req.validatedBody,
    },
  });

  res.json({
    product: result.product,
  });
};
