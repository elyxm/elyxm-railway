import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Text, Toaster } from "@medusajs/ui";
import { useEffect, useState } from "react";
import RestaurantEditDrawer from "../../../components/restaurant-edit-drawer";
import { useRestaurant } from "../../../hooks";
import { TwoColumnLayout } from "../../../layouts/two-column";
import {
  RestaurantContactSection,
  RestaurantGeneralSection,
  RestaurantImageSection,
  RestaurantProductsSection,
  RestaurantSystemSection,
} from "./components";

// Loader function to fetch restaurant data for breadcrumb and initial data
export const loader = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  if (!id) return null;

  try {
    const response = await fetch(`/admin/restaurants/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading restaurant for breadcrumb:", error);
    return null;
  }
};

const RestaurantDetails = () => {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Extract id from URL pathname - handle both /app/restaurants/[id] and /app/restaurants/[id]/edit
  const pathParts = window.location.pathname.split("/");
  const isEditRoute = pathParts.includes("edit");
  const id = isEditRoute ? pathParts[pathParts.length - 2] : pathParts[pathParts.length - 1];

  const { data, loading, refetch } = useRestaurant(id!);
  const restaurant = data?.restaurant;

  // Open drawer if on edit route and handle browser navigation
  useEffect(() => {
    if (isEditRoute) {
      setIsEditDrawerOpen(true);
    } else {
      setIsEditDrawerOpen(false);
    }
  }, [isEditRoute]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const isCurrentlyEditRoute = currentPath.includes("/edit");
      setIsEditDrawerOpen(isCurrentlyEditRoute);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleEditDrawerChange = (open: boolean) => {
    setIsEditDrawerOpen(open);

    // Update URL without page refresh
    if (open) {
      window.history.pushState(null, "", `/app/restaurants/${id}/edit`);
    } else {
      window.history.pushState(null, "", `/app/restaurants/${id}`);
    }
  };

  const handleEditSuccess = () => {
    refetch(); // Refresh restaurant data after edit
  };

  const handleEdit = () => {
    setIsEditDrawerOpen(true);
    window.history.pushState(null, "", `/app/restaurants/${id}/edit`);
  };

  if (loading) {
    return (
      <Container className="flex items-center justify-center p-8">
        <Text>Loading restaurant details...</Text>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container className="flex flex-col items-center justify-center p-8">
        <Text className="mb-4">Restaurant not found</Text>
        <Text className="mb-4">The restaurant you're looking for doesn't exist.</Text>
      </Container>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <TwoColumnLayout
        firstCol={
          <div className="flex flex-col gap-y-3">
            <RestaurantGeneralSection restaurant={restaurant} onEdit={handleEdit} />
            <RestaurantContactSection restaurant={restaurant} />
            <RestaurantProductsSection restaurant={restaurant} />
          </div>
        }
        secondCol={
          <div className="flex flex-col gap-y-3">
            <RestaurantImageSection restaurant={restaurant} />
            <RestaurantSystemSection restaurant={restaurant} />
          </div>
        }
      />

      <RestaurantEditDrawer
        restaurant={restaurant}
        open={isEditDrawerOpen}
        onOpenChange={handleEditDrawerChange}
        onSuccess={handleEditSuccess}
      />

      <Toaster />
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Restaurant Details",
});

// Breadcrumb configuration with dynamic restaurant name
export const handle = {
  breadcrumb: (match: any) => {
    // Get restaurant data from the loader
    const restaurant = match?.data?.restaurant;
    if (restaurant?.name) {
      return restaurant.name;
    }

    // Fallback when data isn't available yet
    return "Restaurant Details";
  },
};

export default RestaurantDetails;
