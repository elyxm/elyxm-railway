import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowLeft, PencilSquare } from "@medusajs/icons";
import { Button, Container, Heading, StatusBadge, Text, Toaster } from "@medusajs/ui";
import { useState } from "react";
import RestaurantEditModal from "../../../components/restaurant-edit-modal";
import { useRestaurant } from "../../../hooks";

const RestaurantDetails = () => {
  // Extract id from URL pathname - format: /app/restaurants/[id]
  const pathParts = window.location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  const [showEditModal, setShowEditModal] = useState(false);

  const { data, loading, refetch } = useRestaurant(id!);
  const restaurant = data?.restaurant;

  const handleEditSuccess = () => {
    setShowEditModal(false);
    refetch();
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
          <Button variant="transparent" onClick={() => window.history.back()} className="p-2">
            <ArrowLeft />
          </Button>
          <div>
            <Heading className="text-xl font-semibold">{restaurant.name}</Heading>
            <Text className="text-ui-fg-subtle">Restaurant Details</Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge color={restaurant.is_open ? "green" : "red"}>
            {restaurant.is_open ? "Open" : "Closed"}
          </StatusBadge>
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <PencilSquare className="mr-2" />
            Edit Restaurant
          </Button>
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

      {showEditModal && <RestaurantEditModal restaurant={restaurant} onSuccess={handleEditSuccess} trigger={null} />}

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Restaurant Details",
});

export default RestaurantDetails;
