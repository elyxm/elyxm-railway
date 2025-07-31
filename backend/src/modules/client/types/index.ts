export interface ClientDTO {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  max_restaurants: number;
  max_custom_recipes: number;
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ClientRestaurantDTO {
  id: string;
  client_id: string;
  restaurant_id: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}
