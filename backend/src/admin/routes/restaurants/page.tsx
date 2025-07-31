import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Toaster } from "@medusajs/ui";
import { StoreIcon } from "../../components/icons";
import { RestaurantListTable } from "../../components/restaurant-list-table";

const ImprovedRestaurants = () => {
  return (
    <>
      <RestaurantListTable />
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Restaurants",
  icon: StoreIcon,
});

// Breadcrumb configuration for Medusa's automatic breadcrumb system
export const handle = {
  breadcrumb: () => "Restaurants",
};

export default ImprovedRestaurants;
