import { PencilSquare } from "@medusajs/icons";
import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { RestaurantDTO } from "../../modules";
import { useUpdateRestaurant } from "../hooks";
import RestaurantForm from "./restaurant-form";

interface RestaurantEditModalProps {
  restaurant: RestaurantDTO;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const RestaurantEditModal = ({ restaurant, onSuccess, trigger }: RestaurantEditModalProps) => {
  const [open, setOpen] = useState(false);
  const { updateRestaurant, loading } = useUpdateRestaurant();

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
      await updateRestaurant(restaurant.id, data);
      toast.success("Restaurant updated successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast.error("Failed to update restaurant");
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          <PencilSquare className="mr-2" />
          Edit Restaurant
        </Button>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content className="flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Edit Restaurant: {restaurant.name}</Drawer.Title>
            <Drawer.Description>Update the restaurant information using the form below.</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-6 min-h-0">
            <div className="max-w-4xl mx-auto">
              <RestaurantForm
                restaurant={restaurant}
                onSubmit={handleSubmit}
                loading={loading}
                submitButtonText="Update Restaurant"
              />
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export default RestaurantEditModal;
