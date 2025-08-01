import { Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { RoleDTO, ScopeType } from "../../modules/rbac/types/common";
import RoleForm from "./role-form";

interface RoleEditDrawerProps {
  role: RoleDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const RoleEditDrawer = ({ role, open, onOpenChange, onSuccess }: RoleEditDrawerProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description?: string | null;
    scope_type: ScopeType;
    scope_id?: string | null;
    is_global: boolean;
  }) => {
    try {
      setLoading(true);
      const response = await fetch(`/admin/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast.success("Role updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit Role</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <RoleForm role={role} onSubmit={handleSubmit} loading={loading} />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
};

export default RoleEditDrawer;
