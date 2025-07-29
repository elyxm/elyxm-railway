import { CreateOrderShippingMethodDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, ModuleRegistrationName, Modules } from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";

export const createOrderStepId = "create-order-step";

const createOrderStep = createStep(
  createOrderStepId,
  async function (deliveryId: string, { container }) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const deliveryQuery = {
      entity: "delivery",
      filters: {
        id: deliveryId,
      },
      fields: ["id", "cart.id", "delivery_status", "driver_id"],
    };

    const {
      data: [delivery],
    } = await query.graph(deliveryQuery);

    const cartQuery = {
      entity: "cart",
      fields: ["*", "items.*"],
      filters: {
        id: delivery.cart.id,
      },
    };

    const {
      data: [cart],
    } = await query.graph(cartQuery);

    const orderModuleService = container.resolve(ModuleRegistrationName.ORDER);

    const order = await orderModuleService.createOrders({
      currency_code: cart.currency_code,
      email: cart.email,
      shipping_address: cart.shipping_address,
      billing_address: cart.billing_address,
      items: cart.items,
      region_id: cart.region_id,
      customer_id: cart.customer_id,
      sales_channel_id: cart.sales_channel_id,
      shipping_methods: cart.shipping_methods as unknown as CreateOrderShippingMethodDTO[],
    });

    const remoteLink = container.resolve("remoteLink");

    await remoteLink.create({
      deliveryModuleService: {
        delivery_id: delivery.id,
      },
      [Modules.ORDER]: {
        order_id: order.id,
      },
    });

    return new StepResponse(order, {
      orderId: order.id,
      deliveryId,
    });
  },
  async function (input, { container }) {
    if (!input) {
      return;
    }

    const remoteLink = container.resolve("remoteLink");

    await remoteLink.dismiss({
      deliveryModuleService: {
        delivery_id: input.deliveryId,
      },
      [Modules.ORDER]: {
        order_id: input.orderId,
      },
    });

    const orderService = container.resolve(ModuleRegistrationName.ORDER);

    await orderService.softDeleteOrders([input.orderId]);
  }
);

export default createOrderStep;
