import { CreateProductWorkflowInputDTO } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "modules/marketplace";
import {
  createProductsWorkflow,
  createRemoteLinkStep,
  useQueryGraphStep,
} from "../../../../node_modules/@medusajs/medusa/dist/core-flows";

type WorkflowInput = {
  merchant_admin_id: string;
  product: CreateProductWorkflowInputDTO;
};

const createMerchantProductWorkflow = createWorkflow("create-merchant-product", (input: WorkflowInput) => {
  // Retrieve default sales channel to make the product available in.
  // Alternatively, you can link sales channels to merchants and allow merchants
  // to manage sales channels
  const { data: stores } = useQueryGraphStep({
    entity: "store",
    fields: ["default_sales_channel_id"],
  });

  const productData = transform(
    {
      input,
      stores,
    },
    (data) => {
      return {
        products: [
          {
            ...data.input.product,
            sales_channels: [
              {
                id: data.stores[0].default_sales_channel_id,
              },
            ],
          },
        ],
      };
    }
  );

  const createdProducts = createProductsWorkflow.runAsStep({
    input: productData,
  });

  const { data: merchantAdmins } = useQueryGraphStep({
    entity: "merchant_admin",
    fields: ["merchant.id"],
    filters: {
      id: input.merchant_admin_id,
    },
  }).config({ name: "retrieve-merchant-admins" });

  const linksToCreate = transform(
    {
      input,
      createdProducts,
      merchantAdmins,
    },
    (data) => {
      return data.createdProducts.map((product) => {
        return {
          [MARKETPLACE_MODULE]: {
            merchant_id: data.merchantAdmins[0].merchant.id,
          },
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
        };
      });
    }
  );

  createRemoteLinkStep(linksToCreate);

  const { data: products } = useQueryGraphStep({
    entity: "product",
    fields: ["*", "variants.*"],
    filters: {
      id: createdProducts[0].id,
    },
  }).config({ name: "retrieve-products" });

  return new WorkflowResponse({
    product: products[0],
  });
});

export default createMerchantProductWorkflow;
