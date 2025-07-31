import { model } from "@medusajs/utils";
import { MeasurementUnit } from "../types/common";
import Cocktail from "./cocktail";
import Ingredient from "./ingredient";

const CocktailIngredient = model.define("cocktail_ingredient", {
  id: model
    .id({
      prefix: "cockingr",
    })
    .primaryKey(),
  quantity: model.number(),
  unit: model.enum(MeasurementUnit),
  notes: model.text().nullable(),
  cocktail: model.belongsTo(() => Cocktail, {
    mappedBy: "ingredients",
  }),
  ingredient: model.belongsTo(() => Ingredient, {
    mappedBy: "cocktailIngredients",
  }),
});

export default CocktailIngredient;
