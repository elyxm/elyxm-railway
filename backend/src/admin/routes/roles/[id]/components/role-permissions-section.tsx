import { Button, Container, Heading, Table, Text, toast } from "@medusajs/ui";
import { useState } from "react";
import { RoleDTO } from "../../../../../modules/rbac/types/common";
import PermissionAssignModal from "../../../../components/permission-assign-modal";
import { usePermissions } from "../../../../hooks";

interface RolePermissionsSectionProps {
  role: RoleDTO;
  onUpdate?: () => void;
}

const RolePermissionsSection = ({ role, onUpdate }: RolePermissionsSectionProps) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { data: allPermissions, loading: permissionsLoading } = usePermissions();

  const handleAssignPermissions = async (permissionIds: string[]) => {
    try {
      const response = await fetch(`/admin/roles/${role.id}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission_ids: permissionIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign permissions");
      }

      toast.success("Permissions assigned successfully");
      setIsAssignModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error assigning permissions:", error);
      toast.error("Failed to assign permissions");
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/admin/roles/${role.id}/permissions/${permissionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove permission");
      }

      toast.success("Permission removed successfully");
      onUpdate?.();
    } catch (error) {
      console.error("Error removing permission:", error);
      toast.error("Failed to remove permission");
    }
  };

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h2">Permissions</Heading>
          <Text className="text-ui-fg-subtle mt-1">Manage the permissions assigned to this role</Text>
        </div>
        <div>
          <Button variant="secondary" size="small" onClick={() => setIsAssignModalOpen(true)}>
            Manage Permissions
          </Button>
        </div>
      </div>

      {role.permissions?.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <Text className="text-ui-fg-subtle">No permissions assigned</Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Resource</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {role.permissions?.map((rp) => (
              <Table.Row key={rp.permission.id}>
                <Table.Cell>{rp.permission.name}</Table.Cell>
                <Table.Cell>{rp.permission.resource}</Table.Cell>
                <Table.Cell>{rp.permission.action}</Table.Cell>
                <Table.Cell>{rp.permission.description}</Table.Cell>
                <Table.Cell>
                  <Button variant="secondary" size="small" onClick={() => handleRemovePermission(rp.permission.id)}>
                    Remove
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {allPermissions && (
        <PermissionAssignModal
          role={role}
          allPermissions={allPermissions.permissions}
          open={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
          onSubmit={handleAssignPermissions}
        />
      )}
    </Container>
  );
};

export default RolePermissionsSection;
