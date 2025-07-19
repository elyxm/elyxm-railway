import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
import MarketplaceModuleService from "../../../../modules/marketplace/service";

type CreateMerchantStepInput = {
  name: string;
  handle?: string;
  logo?: string;
};

const createMerchantStep = createStep(
  "create-merchant",
  async (merchantData: CreateMerchantStepInput, { container }) => {
    const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);

    const merchant = await marketplaceModuleService.createMerchants(merchantData);

    return new StepResponse(merchant, merchant.id);
  },
  async (merchantId, { container }) => {
    if (!merchantId) {
      return;
    }

    const marketplaceModuleService: MarketplaceModuleService = container.resolve(MARKETPLACE_MODULE);

    marketplaceModuleService.deleteMerchants(merchantId);
  }
);

export default createMerchantStep;
