import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { IApiKeyModuleService } from "@medusajs/types";
import { Modules } from "@medusajs/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const apiKeyModuleService: IApiKeyModuleService = req.scope.resolve(Modules.API_KEY);
    const apiKeys = await apiKeyModuleService.listApiKeys();
    const defaultApiKey = apiKeys.find((apiKey) => apiKey.title === "Webshop");
    if (!defaultApiKey) {
      res.json({});
    } else {
      res.json({ publishableApiKey: defaultApiKey.token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
};
