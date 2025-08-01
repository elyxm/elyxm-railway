export type CreateRestaurantAdminInput = {
  restaurant_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type CreateDriverInput = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
};

export type CreateUserWorkflowInput = {
  user: (CreateRestaurantAdminInput | CreateDriverInput) & {
    actor_type: "restaurant" | "driver";
  };
  auth_identity_id: string;
};

export * from "./steps";
export * from "./workflows";
