import { ModuleRegistrationName, remoteQueryObjectFromString } from "@medusajs/utils";
import { createStep } from "@medusajs/workflows-sdk";
import { DELIVERY_MODULE, DeliveryModuleService, DriverDTO } from "../../../modules";

export const findDriverStepId = "await-driver-response-step";

const findDriverStep = createStep<string, DriverDTO, string>(
  { name: findDriverStepId, async: true, timeout: 60 * 15, maxRetries: 2 },
  async function (deliveryId: string, { container }) {
    const remoteQuery = container.resolve("remoteQuery");

    const driversQuery = remoteQueryObjectFromString({
      entryPoint: "drivers",
      fields: ["id"],
      pagination: {
        skip: 0,
        take: null,
      },
    });

    const { rows: drivers } = await remoteQuery(driversQuery).catch((e) => []);

    const idsToNotify = drivers.map((d: DriverDTO) => d.id);

    const createData = idsToNotify.map((driverId: string) => ({
      delivery_id: deliveryId,
      driver_id: driverId,
    }));

    const deliveryService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    await deliveryService.createDeliveryDrivers(createData);

    const eventBus = container.resolve(ModuleRegistrationName.EVENT_BUS);

    await eventBus.emit({
      name: "notify.drivers",
      data: {
        drivers: idsToNotify,
        delivery_id: deliveryId,
      },
    });
  },
  (input, { container }) => {
    const deliveryService: DeliveryModuleService = container.resolve(DELIVERY_MODULE);

    return deliveryService.softDeleteDeliveryDrivers(input || []);
  }
);

export default findDriverStep;
