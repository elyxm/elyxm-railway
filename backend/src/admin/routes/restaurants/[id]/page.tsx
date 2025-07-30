import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowLeft, PencilSquare } from "@medusajs/icons";
import { Button, Container, Heading, StatusBadge, Text, Toaster } from "@medusajs/ui";
import { useEffect, useState } from "react";
import RestaurantEditDrawer from "../../../components/restaurant-edit-drawer";
import { useRestaurant } from "../../../hooks";

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
        <Heading level="h2" className="mb-4">
          Restaurant not found
        </Heading>
        <Text className="mb-4">The restaurant you're looking for doesn't exist.</Text>
        <Button variant="secondary" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2" />
          Back to Restaurants
        </Button>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          {/* <Button variant="transparent" onClick={() => window.history.back()} className="p-2">
            <ArrowLeft />
          </Button> */}
          <div>
            <Heading className="text-xl font-semibold">{restaurant.name}</Heading>
            {/* <Text className="text-ui-fg-subtle">Restaurant Details</Text> */}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge color={restaurant.is_open ? "green" : "red"}>
            {restaurant.is_open ? "Open" : "Closed"}
          </StatusBadge>
          <RestaurantEditDrawer
            restaurant={restaurant}
            open={isEditDrawerOpen}
            onOpenChange={handleEditDrawerChange}
            onSuccess={handleEditSuccess}
            trigger={
              <Button variant="secondary">
                <PencilSquare className="mr-2" />
                Edit Restaurant
              </Button>
            }
          />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <Heading level="h3" className="mb-4">
                Basic Information
              </Heading>
              <div className="space-y-4">
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Name
                  </Text>
                  <Text>{restaurant.name}</Text>
                </div>
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Handle
                  </Text>
                  <Text className="font-mono text-sm bg-ui-bg-subtle px-2 py-1 rounded">{restaurant.handle}</Text>
                </div>
                {restaurant.description && (
                  <div>
                    <Text weight="plus" size="small" className="text-ui-fg-subtle">
                      Description
                    </Text>
                    <Text>{restaurant.description}</Text>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Heading level="h3" className="mb-4">
                Contact Information
              </Heading>
              <div className="space-y-4">
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Email
                  </Text>
                  <Text>{restaurant.email || "—"}</Text>
                </div>
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Phone
                  </Text>
                  <Text>{restaurant.phone || "—"}</Text>
                </div>
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Address
                  </Text>
                  <Text>{restaurant.address || "—"}</Text>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {restaurant.image_url && (
              <div>
                <Heading level="h3" className="mb-4">
                  Restaurant Image
                </Heading>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <Heading level="h3" className="mb-4">
                System Information
              </Heading>
              <div className="space-y-4">
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Restaurant ID
                  </Text>
                  <Text className="font-mono text-sm bg-ui-bg-subtle px-2 py-1 rounded">{restaurant.id}</Text>
                </div>
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Created At
                  </Text>
                  <Text>{new Date(restaurant.created_at).toLocaleString()}</Text>
                </div>
                <div>
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Updated At
                  </Text>
                  <Text>{new Date(restaurant.updated_at).toLocaleString()}</Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {restaurant.products && restaurant.products.length > 0 && (
          <div className="mt-8">
            <Heading level="h3" className="mb-4">
              Products ({restaurant.products.length})
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurant.products.slice(0, 6).map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <Text weight="plus" size="small">
                    {product.title}
                  </Text>
                  {product.description && (
                    <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                      {product.description.substring(0, 100)}...
                    </Text>
                  )}
                </div>
              ))}
              {restaurant.products.length > 6 && (
                <div className="border rounded-lg p-4 flex items-center justify-center">
                  <Text className="text-ui-fg-subtle">+{restaurant.products.length - 6} more products</Text>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Toaster />
    </Container>
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
