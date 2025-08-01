import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Text, Toaster } from "@medusajs/ui";
import { useState } from "react";
import { useParams } from "react-router-dom";
import RoleEditDrawer from "../../../components/role-edit-drawer";
import { useRole } from "../../../hooks";
import { TwoColumnLayout } from "../../../layouts/two-column";
import { RoleGeneralSection, RolePermissionsSection } from "./components";

// Loader function to fetch role data for breadcrumb and initial data
export const loader = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  if (!id) return null;

  try {
    const response = await fetch(`/admin/roles/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading role for breadcrumb:", error);
    return null;
  }
};

const RoleDetails = () => {
  const { id } = useParams();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { data, loading, error, refetch } = useRole(id!);

  const handleEditSuccess = () => {
    setIsEditDrawerOpen(false);
    refetch();
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center p-8">
          <Text>Loading role details...</Text>
        </div>
      </Container>
    );
  }

  if (error || !data?.role) {
    return (
      <Container>
        <div className="flex items-center justify-center p-8">
          <Text>Error loading role details</Text>
        </div>
      </Container>
    );
  }

  const role = data.role;

  const firstColumn = (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h1">{role.name}</Heading>
          <Text className="text-ui-fg-subtle mt-1">{role.description || "No description provided"}</Text>
        </div>
        <div>
          <Button variant="secondary" size="small" onClick={() => setIsEditDrawerOpen(true)}>
            Edit Role
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <RoleGeneralSection role={role} />
        <RolePermissionsSection role={role} onUpdate={refetch} />
      </div>
    </Container>
  );

  const secondColumn = <Container>{/* Additional sections like audit log, etc. can go here */}</Container>;

  return (
    <>
      <TwoColumnLayout firstCol={firstColumn} secondCol={secondColumn} />

      <RoleEditDrawer
        role={role}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onSuccess={handleEditSuccess}
      />

      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Role Details",
});

// Breadcrumb configuration
export const handle = {
  crumb: (data: any) => data?.name || "Role Details",
};

export default RoleDetails;
