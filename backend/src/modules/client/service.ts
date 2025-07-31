import { MedusaService } from "@medusajs/utils";
import { Client, ClientRestaurant } from "./models";

class ClientModuleService extends MedusaService({
  Client,
  ClientRestaurant,
}) {
  // Get client by ID with restaurant relationships
  async getClientWithRestaurants(clientId: string) {
    return await this.listClients({
      where: { id: clientId },
      relations: ["restaurants"],
    });
  }

  // Check if client has available restaurant slots
  async canAddRestaurant(clientId: string): Promise<boolean> {
    const clients = await this.listClients({
      where: { id: clientId },
      relations: ["restaurants"],
    });

    const client = clients[0];
    if (!client) return false;
    return client.restaurants.length < client.max_restaurants;
  }

  // Check if client has available recipe slots
  async canAddCustomRecipe(clientId: string, currentRecipeCount: number): Promise<boolean> {
    const clients = await this.listClients({ where: { id: clientId } });
    const client = clients[0];
    if (!client) return false;
    return currentRecipeCount < client.max_custom_recipes;
  }

  // Get client restaurants for access control
  async getClientRestaurantIds(clientId: string): Promise<string[]> {
    const clientRestaurants = await this.listClientRestaurants({
      where: { client_id: clientId },
    });
    return clientRestaurants.map((cr: any) => cr.restaurant_id);
  }
}

export default ClientModuleService;
