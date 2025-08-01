import { CreateProductDTO } from "@medusajs/types";

export interface CreateRestaurantDTO {
  name: string;
  handle: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  image_url?: string;
  is_open?: boolean;
}

export interface UpdateRestaurantsDTO extends Partial<CreateRestaurantDTO> {
  id: string;
}

export interface CreateRestaurantAdminDTO {
  email: string;
  first_name: string;
  last_name: string;
  restaurant_id: string;
}

export interface UpdateRestaurantAdminsDTO extends Partial<CreateRestaurantAdminDTO> {
  id: string;
}

export interface CreateAdminInviteDTO {
  resadm_id: string;
  role?: string | null;
  email?: string;
}

export interface CreateRestaurantProductDTO {
  products: CreateProductDTO[];
  restaurant_id: string;
}
