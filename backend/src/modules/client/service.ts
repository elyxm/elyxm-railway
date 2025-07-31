import { MedusaService } from "@medusajs/utils";
import { Client, ClientRestaurant } from "./models";

class ClientModuleService extends MedusaService({
  Client,
  ClientRestaurant,
}) {}

export default ClientModuleService;
