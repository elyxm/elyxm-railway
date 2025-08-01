import { Container, Heading, StatusBadge, Text } from "@medusajs/ui";
import { RoleDTO, ScopeType } from "../../../../../modules/rbac/types/common";

interface RoleGeneralSectionProps {
  role: RoleDTO;
}

const RoleGeneralSection = ({ role }: RoleGeneralSectionProps) => {
  return (
    <Container>
      <div className="mb-6">
        <Heading level="h2">General Information</Heading>
        <Text className="text-ui-fg-subtle mt-1">Basic information about the role</Text>
      </div>

      <div className="space-y-4">
        <div>
          <Text className="text-ui-fg-subtle">Name</Text>
          <Text className="text-ui-fg-base">{role.name}</Text>
        </div>

        <div>
          <Text className="text-ui-fg-subtle">Slug</Text>
          <Text className="text-ui-fg-base">{role.slug}</Text>
        </div>

        <div>
          <Text className="text-ui-fg-subtle">Description</Text>
          <Text className="text-ui-fg-base">{role.description || "—"}</Text>
        </div>

        <div>
          <Text className="text-ui-fg-subtle">Scope Type</Text>
          <StatusBadge color={role.scope_type === ScopeType.GLOBAL ? "blue" : "green"}>{role.scope_type}</StatusBadge>
        </div>

        {role.scope_type === ScopeType.CLIENT && role.scope_id && (
          <div>
            <Text className="text-ui-fg-subtle">Client ID</Text>
            <Text className="text-ui-fg-base">{role.scope_id}</Text>
          </div>
        )}

        <div>
          <Text className="text-ui-fg-subtle">Access Level</Text>
          <StatusBadge color={role.is_global ? "blue" : "green"}>
            {role.is_global ? "Global" : "Client-Specific"}
          </StatusBadge>
        </div>

        <div>
          <Text className="text-ui-fg-subtle">Created At</Text>
          <Text className="text-ui-fg-base">{new Date(role.created_at).toLocaleString()}</Text>
        </div>

        <div>
          <Text className="text-ui-fg-subtle">Last Updated</Text>
          <Text className="text-ui-fg-base">{new Date(role.updated_at).toLocaleString()}</Text>
        </div>
      </div>
    </Container>
  );
};

export default RoleGeneralSection;
