import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../modules/marketplace/service";

type CreateMerchantAdminStepInput = {
  email: string;
  first_name?: string;
  last_name?: string;
  merchant_id: string;
};

const createMerchantAdminStep = createStep(
  "create-merchant-admin-step",
  async (adminData: CreateMerchantAdminStepInput, { container }) => {
    const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);

    const merchantAdmin = await marketplaceModuleService.createMerchantAdmins(adminData);

    return new StepResponse(merchantAdmin, merchantAdmin.id);
  },
  async (merchantAdminId, { container }) => {
    if (!merchantAdminId) {
      return;
    }

    const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);

    marketplaceModuleService.deleteMerchantAdmins(merchantAdminId);
  }
);

export default createMerchantAdminStep;
