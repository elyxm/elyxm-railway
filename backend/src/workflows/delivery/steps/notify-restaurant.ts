import { ModuleRegistrationName, remoteQueryObjectFromString } from "@medusajs/utils";
import { createStep } from "@medusajs/workflows-sdk";

export const notifyRestaurantStepId = "notify-restaurant-step";

const notifyRestaurantStep = createStep(
  {
    name: notifyRestaurantStepId,
    async: true,
    timeout: 60 * 15,
    maxRetries: 2,
  },
  async function (deliveryId: string, { container }) {
    const remoteQuery = container.resolve("remoteQuery");

    const deliveryQuery = remoteQueryObjectFromString({
      entryPoint: "deliveries",
      filters: {
        id: deliveryId,
      },
      fields: ["id", "restaurant.id"],
    });

    const delivery = await remoteQuery(deliveryQuery).then((res) => res[0]);

    const eventBus = container.resolve(ModuleRegistrationName.EVENT_BUS);

    await eventBus.emit({
      name: "notify.restaurant",
      data: {
        restaurant_id: delivery.restaurant.id,
        delivery_id: delivery.id,
      },
    });
  },
  function (input: string | undefined, { container }) {
    const logger = container.resolve("logger");

    if (input) {
      logger.error(`Failed to notify restaurant for delivery: ${input}`);
    }
  }
);

export default notifyRestaurantStep;
