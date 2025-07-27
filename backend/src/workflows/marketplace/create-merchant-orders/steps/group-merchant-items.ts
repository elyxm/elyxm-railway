import { CartDTO, CartLineItemDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, promiseAll } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type StepInput = {
  cart: CartDTO;
};

const groupMerchantItemsStep = createStep("group-merchant-items", async ({ cart }: StepInput, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const merchantsItems: Record<string, CartLineItemDTO[]> = {};

  await promiseAll(
    cart.items?.map(async (item) => {
      const {
        data: [product],
      } = await query.graph({
        entity: "product",
        fields: ["merchant.*"],
        filters: {
          id: [item.product_id],
        },
      });

      const merchantId = product.merchant?.id;

      if (!merchantId) {
        return;
      }
      merchantsItems[merchantId] = [...(merchantsItems[merchantId] || []), item];
    })
  );

  return new StepResponse({
    merchantsItems,
  });
});

export default groupMerchantItemsStep;
