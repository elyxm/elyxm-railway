import { EllipsisHorizontal } from "@medusajs/icons";
import { Button, DropdownMenu, toast } from "@medusajs/ui";
import { useNavigate } from "react-router-dom";
import { RoleDTO } from "../../modules/rbac/types/common";

interface RoleActionsMenuProps {
  role: RoleDTO;
  onUpdate?: () => void;
}

const RoleActionsMenu = ({ role, onUpdate }: RoleActionsMenuProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/roles/${role.id}`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/admin/roles/${role.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      toast.success("Role deleted successfully");
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    }
  };

  const handleManagePermissions = () => {
    navigate(`/roles/${role.id}/permissions`);
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="small">
          <EllipsisHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleEdit}>Edit Role</DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleManagePermissions}>Manage Permissions</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={handleDelete} className="text-ui-fg-error">
          Delete Role
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export default RoleActionsMenu;
