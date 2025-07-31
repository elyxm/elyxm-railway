import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";
import { DropdownMenu, IconButton, toast } from "@medusajs/ui";
import { useNavigate } from "react-router-dom";
import { RestaurantDTO } from "../../modules";
import { useDeleteRestaurant, useUpdateRestaurantStatus } from "../hooks";

interface RestaurantActionsMenuProps {
  restaurant: RestaurantDTO;
  onUpdate?: () => void;
}

const RestaurantActionsMenu = ({ restaurant, onUpdate }: RestaurantActionsMenuProps) => {
  const navigate = useNavigate();
  const { deleteRestaurant, loading: deleting } = useDeleteRestaurant();
  const { updateStatus, loading: updatingStatus } = useUpdateRestaurantStatus();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
      try {
        await deleteRestaurant(restaurant.id);
        toast.success("Restaurant deleted successfully");
        onUpdate?.();
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        toast.error("Failed to delete restaurant");
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !restaurant.is_open;
      await updateStatus(restaurant.id, newStatus);
      toast.success(`Restaurant ${newStatus ? "opened" : "closed"} successfully`);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      toast.error("Failed to update restaurant status");
    }
  };

  const handleEdit = () => {
    navigate(`/restaurants/${restaurant.id}/edit`);
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item className="gap-x-2 cursor-pointer" onClick={handleEdit}>
          <PencilSquare className="text-ui-fg-subtle" />
          Edit
        </DropdownMenu.Item>

        <DropdownMenu.Item className="gap-x-2 cursor-pointer" onClick={handleToggleStatus} disabled={updatingStatus}>
          <div className="text-ui-fg-subtle">{restaurant.is_open ? "🔴" : "🟢"}</div>
          {restaurant.is_open ? "Close Restaurant" : "Open Restaurant"}
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          className="gap-x-2 cursor-pointer text-red-600 hover:text-red-700"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash className="text-red-600" />
          {deleting ? "Deleting..." : "Delete"}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export default RestaurantActionsMenu;
