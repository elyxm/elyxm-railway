import { MedusaService } from "@medusajs/utils";
import { Cocktail, CocktailIngredient, Ingredient } from "./models";
import { OwnerType } from "./types/common";

class CocktailModuleService extends MedusaService({
  Cocktail,
  Ingredient,
  CocktailIngredient,
}) {
  // Get cocktails accessible to a client (platform public + client owned + granted access)
  async getCocktailsForClient(clientId: string) {
    return await this.listCocktails({
      where: [
        // Platform recipes that are public
        { owner_type: OwnerType.PLATFORM, is_public: true },
        // Client's own recipes
        { owner_type: OwnerType.CLIENT, owner_id: clientId },
        // TODO: Add recipes with granted access via link tables
      ],
      relations: ["ingredients"],
    });
  }

  // Get ingredients accessible to a client (platform + client owned)
  async getIngredientsForClient(clientId: string) {
    return await this.listIngredients({
      where: [
        // Platform ingredients
        { owner_type: OwnerType.PLATFORM },
        // Client's own ingredients
        { owner_type: OwnerType.CLIENT, owner_id: clientId },
      ],
    });
  }

  // Create client-owned cocktail
  async createClientCocktail(clientId: string, cocktailData: any) {
    return await this.createCocktails({
      ...cocktailData,
      owner_type: OwnerType.CLIENT,
      owner_id: clientId,
      is_public: false, // Client recipes are private by default
    });
  }

  // Create client-owned ingredient
  async createClientIngredient(clientId: string, ingredientData: any) {
    return await this.createIngredients({
      ...ingredientData,
      owner_type: OwnerType.CLIENT,
      owner_id: clientId,
    });
  }

  // Check if client can access cocktail
  async canClientAccessCocktail(cocktailId: string, clientId: string): Promise<boolean> {
    const cocktails = await this.listCocktails({
      where: { id: cocktailId },
    });

    const cocktail = cocktails[0];
    if (!cocktail) return false;

    // Platform public recipes
    if (cocktail.owner_type === OwnerType.PLATFORM && cocktail.is_public) {
      return true;
    }

    // Client's own recipes
    if (cocktail.owner_type === OwnerType.CLIENT && cocktail.owner_id === clientId) {
      return true;
    }

    // TODO: Check access control tables for granted access
    return false;
  }

  // Get cocktail ingredients with access control
  async getCocktailIngredients(cocktailId: string, clientId?: string) {
    const ingredients = await this.listCocktailIngredients({
      where: { cocktail_id: cocktailId },
      relations: ["ingredient"],
    });

    // Filter ingredients based on client access if clientId provided
    if (clientId) {
      return ingredients.filter((ci: any) => {
        const ingredient = ci.ingredient;
        return (
          ingredient.owner_type === OwnerType.PLATFORM ||
          (ingredient.owner_type === OwnerType.CLIENT && ingredient.owner_id === clientId)
        );
      });
    }

    return ingredients;
  }
}

export default CocktailModuleService;
