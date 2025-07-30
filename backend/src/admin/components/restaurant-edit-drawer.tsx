import { PencilSquare } from "@medusajs/icons";
import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { RestaurantDTO } from "../../modules";
import { useUpdateRestaurant } from "../hooks";
import RestaurantForm from "./restaurant-form";

interface RestaurantEditDrawerProps {
  restaurant: RestaurantDTO;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const RestaurantEditDrawer = ({
  restaurant,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: RestaurantEditDrawerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { updateRestaurant, loading } = useUpdateRestaurant();

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

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

  // Default trigger button if none provided
  const defaultTrigger = (
    <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
      <PencilSquare className="mr-2" />
      Edit Restaurant
    </Button>
  );

  return (
    <>
      {trigger ? <div onClick={() => setOpen(true)}>{trigger}</div> : defaultTrigger}

      <Drawer open={isOpen} onOpenChange={setOpen}>
        <Drawer.Content className="flex flex-col">
          <Drawer.Header className="flex-shrink-0">
            <Drawer.Title>Edit Restaurant</Drawer.Title>
            <Drawer.Description>Update the information for "{restaurant.name}".</Drawer.Description>
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

export default RestaurantEditDrawer;
