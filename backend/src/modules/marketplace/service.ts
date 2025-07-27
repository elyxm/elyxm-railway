import { MedusaService } from "@medusajs/framework/utils";
import Merchant from "./models/merchant";
import MerchantAdmin from "./models/merchant_admin";

class MarketplaceModuleService extends MedusaService({
  Merchant,
  MerchantAdmin,
}) {}

export default MarketplaceModuleService;
