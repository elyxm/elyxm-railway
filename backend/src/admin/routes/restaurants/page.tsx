import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  StatusBadge,
  Text,
  Toaster,
  useDataTable,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { RestaurantDTO } from "../../../modules";
import { StoreIcon } from "../../components/icons";
import RestaurantActionsMenu from "../../components/restaurant-actions-menu";
import RestaurantCreateModal from "../../components/restaurant-create-modal";
import { useRestaurants } from "../../hooks";

const columnHelper = createDataTableColumnHelper<RestaurantDTO>();

const limit = 15;

const Restaurants = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const { data, loading, refetch } = useRestaurants();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        enableSorting: true,
        cell: ({ getValue, row }) => (
          <div className="flex flex-col">
            <Text
              weight="plus"
              size="small"
              className="cursor-pointer hover:text-ui-fg-interactive text-ui-fg-interactive"
              onClick={() => window.open(`/app/restaurants/${row.original.id}`, "_blank")}
            >
              {getValue()}
            </Text>
            {row.original.description && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {row.original.description}
              </Text>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("is_open", {
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge color={getValue() ? "green" : "red"}>{getValue() ? "Open" : "Closed"}</StatusBadge>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: ({ getValue }) => <Text size="small">{getValue() || "—"}</Text>,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: ({ getValue }) => <Text size="small">{getValue() || "—"}</Text>,
      }),
      columnHelper.accessor("address", {
        header: "Address",
        cell: ({ getValue }) => (
          <Text size="small" className="max-w-xs truncate">
            {getValue() || "—"}
          </Text>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <RestaurantActionsMenu restaurant={row.original} onUpdate={refetch} />,
      }),
    ],
    [refetch]
  );

  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  // For now, we'll do client-side pagination since the API doesn't support pagination yet
  const paginatedData = useMemo(() => {
    if (!data?.restaurants) return [];
    const start = offset;
    const end = start + limit;
    return data.restaurants.slice(start, end);
  }, [data?.restaurants, offset]);

  const table = useDataTable({
    columns,
    data: paginatedData,
    getRowId: (row) => row.id,
    rowCount: data?.restaurants?.length || 0,
    isLoading: loading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <div>
          <Heading className="text-xl font-semibold">Restaurants</Heading>
          <Text className="text-ui-fg-subtle">Manage your restaurants and their settings</Text>
        </div>
        <RestaurantCreateModal onSuccess={handleCreateSuccess} />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Text>Loading restaurants...</Text>
        </div>
      )}

      {!loading && data?.restaurants && data.restaurants.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 mb-4 text-ui-fg-muted">
            <StoreIcon />
          </div>
          <Heading level="h3" className="mb-2">
            No restaurants yet
          </Heading>
          <Text className="text-ui-fg-subtle mb-4">Get started by creating your first restaurant</Text>
          <RestaurantCreateModal onSuccess={handleCreateSuccess} />
        </div>
      )}

      {!loading && data?.restaurants && data.restaurants.length > 0 && (
        <div className="flex-1">
          <DataTable instance={table}>
            <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center px-6">
              <div className="flex items-center gap-2">
                <Text weight="plus">
                  {data.restaurants.length} restaurant{data.restaurants.length !== 1 ? "s" : ""}
                </Text>
              </div>
            </DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        </div>
      )}

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Restaurants",
  icon: StoreIcon,
});

export default Restaurants;
