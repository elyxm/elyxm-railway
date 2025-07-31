import { Module } from "@medusajs/utils";
import CocktailModuleService from "./service";

export const COCKTAIL_MODULE = "cocktail";

export default Module(COCKTAIL_MODULE, {
  service: CocktailModuleService,
});

export * from "./types";

export { default as CocktailModuleService } from "./service";
