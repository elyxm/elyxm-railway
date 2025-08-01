import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ShieldCheck } from "@medusajs/icons";
import { Toaster } from "@medusajs/ui";
import { RoleListTable } from "../../components/role-list-table";

const RolesPage = () => {
  return (
    <>
      <RoleListTable />
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Roles & Permissions",
  icon: ShieldCheck,
});

// Breadcrumb configuration
export const handle = {
  breadcrumb: () => "Roles & Permissions",
};

export default RolesPage;
