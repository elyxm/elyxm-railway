import { CartLineItemDTO, InferTypeOf, LinkDefinition, OrderDTO } from "@medusajs/framework/types";
import { Modules, promiseAll } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { cancelOrderWorkflow, createOrderWorkflow } from "../../../../../node_modules/@medusajs/medusa/dist/core-flows";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import Merchant from "../../../../modules/marketplace/models/merchant";
import MarketplaceModuleService from "../../../../modules/marketplace/service";

export type MerchantOrder = OrderDTO & {
  merchant: InferTypeOf<typeof Merchant>;
};

type StepInput = {
  parentOrder: OrderDTO;
  merchantsItems: Record<string, CartLineItemDTO[]>;
};

function prepareOrderData(items: CartLineItemDTO[], parentOrder: OrderDTO) {
  return {
    items,
    metadata: {
      parent_order_id: parentOrder.id,
    },
    // use info from parent
    region_id: parentOrder.region_id,
    customer_id: parentOrder.customer_id,
    sales_channel_id: parentOrder.sales_channel_id,
    email: parentOrder.email,
    currency_code: parentOrder.currency_code,
    shipping_address_id: parentOrder.shipping_address?.id,
    billing_address_id: parentOrder.billing_address?.id,
    // A better solution would be to have shipping methods for each
    // item/merchant. This requires changes in the storefront to commodate that
    // and passing the item/merchant ID in the `data` property, for example.
    // For simplicity here we just use the same shipping method.
    shipping_methods: parentOrder.shipping_methods.map((shippingMethod) => ({
      name: shippingMethod.name,
      amount: shippingMethod.amount,
      shipping_option_id: shippingMethod.shipping_option_id,
      data: shippingMethod.data,
      tax_lines: shippingMethod.tax_lines.map((taxLine) => ({
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        tax_rate_id: taxLine.tax_rate_id,
        description: taxLine.description,
      })),
      adjustments: shippingMethod.adjustments.map((adjustment) => ({
        code: adjustment.code,
        amount: adjustment.amount,
        description: adjustment.description,
        promotion_id: adjustment.promotion_id,
        provider_id: adjustment.provider_id,
      })),
    })),
  };
}

const createMerchantOrdersStep = createStep(
  "create-merchant-orders",
  async ({ merchantsItems, parentOrder }: StepInput, { container, context }) => {
    const linkDefs: LinkDefinition[] = [];
    const createdOrders: MerchantOrder[] = [];
    const merchantIds = Object.keys(merchantsItems);

    const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);

    const merchants = await marketplaceModuleService.listMerchants({
      id: merchantIds,
    });

    try {
      await promiseAll(
        merchantIds.map(async (merchantId) => {
          const items = merchantsItems[merchantId];
          const merchant = merchants.find((v) => v.id === merchantId)!;

          const { result: childOrder } = (await createOrderWorkflow(container).run({
            input: prepareOrderData(items, parentOrder),
            context,
          })) as unknown as { result: MerchantOrder };

          childOrder.merchant = merchant;
          createdOrders.push(childOrder);

          linkDefs.push({
            [MARKETPLACE_MODULE]: {
              merchant_id: merchant.id,
            },
            [Modules.ORDER]: {
              order_id: childOrder.id,
            },
          });
        })
      );
    } catch (e) {
      return StepResponse.permanentFailure(`An error occured while creating merchant orders: ${e}`, {
        created_orders: createdOrders,
      });
    }

    return new StepResponse(
      {
        orders: createdOrders,
        linkDefs,
      },
      {
        created_orders: createdOrders,
      }
    );
  },
  async ({ created_orders }, { container, context }) => {
    await Promise.all(
      created_orders.map((createdOrder) => {
        return cancelOrderWorkflow(container).run({
          input: {
            order_id: createdOrder.id,
          },
          context,
          container,
        });
      })
    );
  }
);

export default createMerchantOrdersStep;
