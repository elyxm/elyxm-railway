import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import createMerchantProductWorkflow from "../../../workflows/marketplace/create-merchant-product";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [merchantAdmin],
  } = await query.graph({
    entity: "merchant_admin",
    fields: [
      "merchant.products.*",
      // "merchant.products.variants.*"
    ],
    filters: {
      id: [
        // ID of the authenticated merchant admin
        req.auth_context.actor_id,
      ],
    },
  });

  res.json({
    products: merchantAdmin.merchant.products,
  });
};

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
