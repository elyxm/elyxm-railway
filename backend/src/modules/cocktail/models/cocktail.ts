import { model } from "@medusajs/utils";
import { OwnerType, StrengthLevel, SweetnessLevel } from "../types/common";
import CocktailIngredient from "./cocktail-ingredient";

const Cocktail = model.define("cocktail", {
  id: model
    .id({
      prefix: "cock",
    })
    .primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  instructions: model.text(),
  abv: model.number().nullable(),
  calories: model.number().nullable(),
  is_alcohol_free: model.boolean().default(false),
  sweetness_level: model.enum(SweetnessLevel).nullable(),
  strength_level: model.enum(StrengthLevel).nullable(),
  owner_type: model.enum(OwnerType).default(OwnerType.PLATFORM),
  owner_id: model.text().nullable(),
  is_public: model.boolean().default(true),
  ingredients: model.hasMany(() => CocktailIngredient, {
    mappedBy: "cocktail",
  }),
});

export default Cocktail;
