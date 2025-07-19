import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import MarketplaceModule from "../modules/marketplace";

export default defineLink(MarketplaceModule.linkable.merchant, {
  linkable: ProductModule.linkable.product.id,
  isList: true,
});
