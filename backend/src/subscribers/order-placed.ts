import { INotificationModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";

export default async function orderPlacedHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const orderModuleService = container.resolve(Modules.ORDER) as any;
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION);

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "customer", "shipping_address"],
  });
  let shippingAddress;
  if (order.shipping_address) {
    shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id);
  }

  if (!order.email) {
    return;
  }

  notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    data: {
      order,
      shippingAddress,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
