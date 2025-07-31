import { model } from "@medusajs/utils";
import { OwnerType } from "../types/common";
import CocktailIngredient from "./cocktail-ingredient";

const Ingredient = model.define("ingredient", {
  id: model
    .id({
      prefix: "ingr",
    })
    .primaryKey(),
  name: model.text(),
  category_id: model.text().nullable(),
  description: model.text().nullable(),
  abv: model.number().nullable(),
  cost_per_unit: model.number().nullable(),
  owner_type: model.enum(OwnerType).default(OwnerType.PLATFORM),
  owner_id: model.text().nullable(),
  is_shared: model.boolean().default(false),
  cocktailIngredients: model.hasMany(() => CocktailIngredient, {
    mappedBy: "ingredient",
  }),
});

export default Ingredient;
