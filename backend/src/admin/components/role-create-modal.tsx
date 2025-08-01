import { Button, Drawer, toast } from "@medusajs/ui";
import { useState } from "react";
import { ScopeType } from "../../modules/rbac/types/common";
import RoleForm from "./role-form";

interface RoleCreateModalProps {
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RoleCreateModal = ({
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: RoleCreateModalProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setUncontrolledOpen;

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
      const response = await fetch("/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create role");
      }

      toast.success("Role created successfully");
      onOpenChange?.(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isControlled && (
        <Button variant="secondary" size="small" onClick={() => onOpenChange?.(true)}>
          Create Role
        </Button>
      )}
      <Drawer open={open} onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Create Role</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <RoleForm onSubmit={handleSubmit} loading={loading} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export default RoleCreateModal;
