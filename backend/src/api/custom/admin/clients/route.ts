import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CLIENT_MODULE, ClientModuleService } from "../../../../modules/client";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const clientService: ClientModuleService = req.scope.resolve(CLIENT_MODULE);
    const clients = await clientService.listClients({}); // Removed fields
    return res.status(200).json({
      clients,
      count: clients.length,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({
      message: "Failed to fetch clients",
      error: (error as Error).message,
    });
  }
}
