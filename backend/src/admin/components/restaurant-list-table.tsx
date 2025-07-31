import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  StatusBadge,
  Text,
  useDataTable,
} from "@medusajs/ui";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RestaurantDTO } from "../../modules";
import { useRestaurants } from "../hooks";
import { StoreIcon } from "./icons";
import RestaurantActionsMenu from "./restaurant-actions-menu";
import RestaurantCreateModal from "./restaurant-create-modal";

const columnHelper = createDataTableColumnHelper<RestaurantDTO>();
const PAGE_SIZE = 20;

interface RestaurantListTableProps {
  searchQuery?: string;
  statusFilter?: boolean | null;
}

export const RestaurantListTable = ({ searchQuery, statusFilter }: RestaurantListTableProps) => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  });

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (searchQuery) params.q = searchQuery;
    if (statusFilter !== null && statusFilter !== undefined) {
      params.is_open = statusFilter;
    }
    return params;
  }, [searchQuery, statusFilter]);

  const { data, loading, error, refetch } = useRestaurants(queryParams);

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
              className="cursor-pointer hover:text-ui-fg-base transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurants/${row.original.id}`);
              }}
            >
              {getValue()}
            </Text>
            {/* {row.original.description && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {row.original.description}
              </Text>
            )} */}
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
        cell: ({ row }) => (
          <div data-actions>
            <RestaurantActionsMenu restaurant={row.original} onUpdate={refetch} />
          </div>
        ),
      }),
    ],
    [refetch, navigate]
  );

  // Filter and paginate data
  const restaurants = data?.restaurants || [];
  const filteredData = useMemo(() => {
    let filtered = restaurants;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.description?.toLowerCase().includes(query) ||
          restaurant.email?.toLowerCase().includes(query) ||
          restaurant.address?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [restaurants, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredData.slice(start, end);
  }, [filteredData, pagination.pageIndex]);

  const table = useDataTable({
    columns,
    data: paginatedData,
    getRowId: (row) => row.id,
    rowCount: filteredData.length,
    isLoading: loading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick: (event: React.MouseEvent, row: RestaurantDTO) => {
      // Don't navigate if clicking on the actions menu or buttons
      const target = event.target as HTMLElement;
      if (target.closest("[data-actions]") || target.closest("button") || target.closest('[role="menuitem"]')) {
        return;
      }

      // Navigate to restaurant details page using React Router
      navigate(`/restaurants/${row.id}`);
    },
  });

  const handleCreateSuccess = () => {
    refetch();
  };

  if (loading) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-center p-8">
          <Text>Loading restaurants...</Text>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="divide-y p-0">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 mb-4 text-ui-fg-muted">⚠️</div>
          <Heading level="h3" className="mb-2 text-red-600">
            Error Loading Restaurants
          </Heading>
          <Text className="text-ui-fg-subtle mb-4">{error}</Text>
          <Button onClick={refetch} size="small">
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  if (!loading && filteredData.length === 0) {
    return (
      <Container className="divide-y p-0">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 mb-4 text-ui-fg-muted">
            <StoreIcon />
          </div>
          <Heading level="h3" className="mb-2">
            {searchQuery || statusFilter !== null ? "No restaurants found" : "No restaurants yet"}
          </Heading>
          <Text className="text-ui-fg-subtle mb-4">
            {searchQuery || statusFilter !== null
              ? "Try adjusting your search or filters"
              : "Get started by creating your first restaurant"}
          </Text>
          {!searchQuery && statusFilter === null && <RestaurantCreateModal onSuccess={handleCreateSuccess} />}
        </div>
      </Container>
    );
  }

  return (
    <div className="flex-1">
      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </div>
  );
};
