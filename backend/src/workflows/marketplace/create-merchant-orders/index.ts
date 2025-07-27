import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import {
  completeCartWorkflow,
  createRemoteLinkStep,
  getOrderDetailWorkflow,
  useQueryGraphStep,
} from "../../../../node_modules/@medusajs/medusa/dist/core-flows";
import createMerchantOrdersStep from "./steps/create-merchant-orders";
import groupMerchantItemsStep from "./steps/group-merchant-items";

export type CreateMerchantOrderWorkflowInput = {
  cart_id: string;
};

const createMerchantOrdersWorkflow: any = createWorkflow(
  "create-merchant-order",
  (input: CreateMerchantOrderWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "items.*"],
      filters: { id: input.cart_id },
      options: {
        throwIfKeyNotFound: true,
      },
    });

    const { id: orderId } = completeCartWorkflow.runAsStep({
      input: {
        id: carts[0].id,
      },
    });

    const { merchantsItems } = groupMerchantItemsStep({
      cart: carts[0],
    });

    const order = getOrderDetailWorkflow.runAsStep({
      input: {
        order_id: orderId,
        fields: [
          "region_id",
          "customer_id",
          "sales_channel_id",
          "email",
          "currency_code",
          "shipping_address.*",
          "billing_address.*",
          "shipping_methods.*",
          "shipping_methods.tax_lines.*",
          "shipping_methods.adjustments.*",
        ],
      },
    });

    const { orders: merchantOrders, linkDefs } = createMerchantOrdersStep({
      parentOrder: order,
      merchantsItems,
    });

    createRemoteLinkStep(linkDefs);

    return new WorkflowResponse({
      parent_order: order,
      merchant_orders: merchantOrders,
    });
  }
);

export default createMerchantOrdersWorkflow;
