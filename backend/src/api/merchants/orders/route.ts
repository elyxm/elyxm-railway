import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows";

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [merchantAdmin],
  } = await query.graph({
    entity: "merchant_admin",
    fields: ["merchant.orders.*"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  });

  const { result: orders } = await getOrdersListWorkflow(req.scope).run({
    input: {
      fields: [
        "metadata",
        "total",
        "subtotal",
        "shipping_total",
        "tax_total",
        "items.*",
        "items.tax_lines",
        "items.adjustments",
        "items.variant",
        "items.variant.product",
        "items.detail",
        "shipping_methods",
        "payment_collections",
        "fulfillments",
      ],
      variables: {
        filters: {
          id: merchantAdmin.merchant.orders.map((order) => order.id),
        },
      },
    },
  });

  res.json({
    orders,
  });
};
