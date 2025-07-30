import { Plus } from "@medusajs/icons";
import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { useCreateRestaurant } from "../hooks";
import RestaurantForm from "./restaurant-form";

interface RestaurantCreateModalProps {
  onSuccess?: () => void;
}

const RestaurantCreateModal = ({ onSuccess }: RestaurantCreateModalProps) => {
  const [open, setOpen] = useState(false);
  const { createRestaurant, loading } = useCreateRestaurant();

  const handleSubmit = async (data: {
    name: string;
    handle: string;
    description?: string;
    is_open?: boolean;
    phone?: string;
    email?: string;
    address?: string;
    image_url?: string;
  }) => {
    try {
      await createRestaurant(data);
      toast.success("Restaurant created successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating restaurant:", error);
      toast.error("Failed to create restaurant");
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="mr-2" />
        Add Restaurant
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content className="flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Create New Restaurant</Drawer.Title>
            <Drawer.Description>Fill out the form below to create a new restaurant in your system.</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="max-w-4xl mx-auto">
              <RestaurantForm onSubmit={handleSubmit} loading={loading} submitButtonText="Create Restaurant" />
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export default RestaurantCreateModal;
