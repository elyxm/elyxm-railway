import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Input, Select, Toaster } from "@medusajs/ui";
import { useState } from "react";
import { StoreIcon } from "../../components/icons";
import RestaurantCreateModal from "../../components/restaurant-create-modal";
import { RestaurantListTable } from "../../components/restaurant-list-table";

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      setStatusFilter(null);
    } else {
      setStatusFilter(value === "open");
    }
  };

  const handleCreateSuccess = () => {
    // The table component will handle its own refresh
  };

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Restaurants</Heading>
          {/* <Text className="text-ui-fg-subtle">Manage your restaurants and their settings</Text> */}
        </div>
        <div className="flex items-center justify-center gap-x-2">
          <Button size="small" variant="secondary" asChild>
            <div onClick={() => (window.location.href = "/app/restaurants/export")}>Export</div>
          </Button>
          <RestaurantCreateModal onSuccess={handleCreateSuccess} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4 bg-ui-bg-subtle">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
          />
        </div>
        <div className="w-48">
          <Select
            value={statusFilter === null ? "all" : statusFilter ? "open" : "closed"}
            onValueChange={handleStatusFilterChange}
            size="small"
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Status</Select.Item>
              <Select.Item value="open">Open Only</Select.Item>
              <Select.Item value="closed">Closed Only</Select.Item>
            </Select.Content>
          </Select>
        </div>
        {(searchQuery || statusFilter !== null) && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <RestaurantListTable searchQuery={searchQuery} statusFilter={statusFilter} />

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Restaurants",
  icon: StoreIcon,
});

// Breadcrumb configuration for Medusa's automatic breadcrumb system
export const handle = {
  breadcrumb: () => "Restaurants",
};

export default Restaurants;
