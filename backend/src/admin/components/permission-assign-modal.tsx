import { Button, Drawer, Text } from "@medusajs/ui";
import { CheckSquare, Square } from "lucide-react";
import { useState } from "react";
import { PermissionDTO, RoleDTO } from "../../modules/rbac/types/common";

interface PermissionAssignModalProps {
  role: RoleDTO;
  allPermissions: PermissionDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (permissionIds: string[]) => Promise<void>;
  loading?: boolean;
}

const PermissionAssignModal = ({
  role,
  allPermissions,
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: PermissionAssignModalProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions?.map((rp) => rp.permission.id) || [])
  );
  const [submitting, setSubmitting] = useState(false);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(Array.from(selectedPermissions));
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating permissions:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce<Record<string, PermissionDTO[]>>((acc, permission) => {
    const resource = permission.resource;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {});

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Manage Permissions</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, permissions]) => (
              <div key={resource} className="space-y-2">
                <Text className="text-ui-fg-base font-semibold">{resource}</Text>
                <div className="space-y-1">
                  {permissions.map((permission) => (
                    <button
                      key={permission.id}
                      onClick={() => handleTogglePermission(permission.id)}
                      className="flex items-center gap-2 w-full p-2 hover:bg-ui-bg-base-hover rounded-md text-left"
                    >
                      {selectedPermissions.has(permission.id) ? (
                        <CheckSquare size={16} className="text-ui-fg-interactive" />
                      ) : (
                        <Square size={16} className="text-ui-fg-subtle" />
                      )}
                      <div>
                        <Text className="text-ui-fg-base">{permission.name}</Text>
                        <Text className="text-ui-fg-subtle text-xs">{permission.description}</Text>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Permissions"}
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

export default PermissionAssignModal;
