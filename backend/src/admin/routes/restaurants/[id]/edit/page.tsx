import { defineRouteConfig } from "@medusajs/admin-sdk";
import RestaurantDetails from "../page";

// Re-export the loader from the parent route for breadcrumb data
export { loader } from "../page";

const RestaurantEdit = () => {
  // This route renders the same component as the restaurant details page
  // The RestaurantDetails component will detect the /edit in the URL and open the edit drawer
  return <RestaurantDetails />;
};

export const config = defineRouteConfig({
  label: "Edit Restaurant",
});

// Breadcrumb configuration for Medusa's automatic breadcrumb system
export const handle = {
  breadcrumb: () => "Edit",
};

export default RestaurantEdit;
