import { MedusaService } from "@medusajs/utils";
import { Cocktail, CocktailIngredient, Ingredient } from "./models";

class CocktailModuleService extends MedusaService({
  Cocktail,
  Ingredient,
  CocktailIngredient,
}) {}

export default CocktailModuleService;
