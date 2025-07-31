import {
  Button,
  Container,
  createDataTableColumnHelper,
  createDataTableFilterHelper,
  DataTable,
  DataTableFilteringState,
  DataTablePaginationState,
  DataTableSortingState,
  Heading,
  StatusBadge,
  Text,
  useDataTable,
} from "@medusajs/ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RestaurantDTO } from "../../modules";
import { useRestaurants } from "../hooks";
import { StoreIcon } from "./icons";
import RestaurantActionsMenu from "./restaurant-actions-menu";
import RestaurantCreateModal from "./restaurant-create-modal";

const columnHelper = createDataTableColumnHelper<RestaurantDTO>();
const filterHelper = createDataTableFilterHelper<RestaurantDTO>();
const PAGE_SIZE = 20;

// Define filters using the built-in filter helper
const filters = [
  filterHelper.accessor("is_open", {
    type: "select",
    label: "Status",
    options: [
      {
        label: "Open",
        value: "true",
      },
      {
        label: "Closed",
        value: "false",
      },
    ],
  }),
  filterHelper.accessor("phone", {
    type: "select",
    label: "Phone",
    options: [
      {
        label: "Has Phone",
        value: "true",
      },
      {
        label: "No Phone",
        value: "false",
      },
    ],
  }),
  filterHelper.accessor("email", {
    type: "select",
    label: "Email",
    options: [
      {
        label: "Has Email",
        value: "true",
      },
      {
        label: "No Email",
        value: "false",
      },
    ],
  }),
];

export const RestaurantListTable = () => {
  const navigate = useNavigate();

  // Built-in state management for all table features
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  });
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [filtering, setFiltering] = useState<DataTableFilteringState>({});
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null);

  // Keep track of previous data to prevent flickering
  const [displayData, setDisplayData] = useState<{ restaurants: RestaurantDTO[]; count: number } | null>(null);
  const isInitialLoad = useRef(true);

  // Debounce search to prevent API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Build query parameters for server-side operations
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      limit: PAGE_SIZE,
      offset: pagination.pageIndex * PAGE_SIZE,
    };

    // Use debounced search instead of immediate search
    if (debouncedSearch) params.q = debouncedSearch;

    // Handle filtering
    if (filtering.is_open && Array.isArray(filtering.is_open) && filtering.is_open.length > 0) {
      params.is_open = filtering.is_open[0] === "true";
    }

    if (filtering.phone && Array.isArray(filtering.phone) && filtering.phone.length > 0) {
      params.phone = filtering.phone[0];
    }

    if (filtering.email && Array.isArray(filtering.email) && filtering.email.length > 0) {
      params.email = filtering.email[0];
    }

    // Handle sorting
    if (sorting) {
      params.order = `${sorting.id}:${sorting.desc ? "desc" : "asc"}`;
    }

    return params;
  }, [pagination, debouncedSearch, filtering, sorting]);

  const { data, loading, error, refetch } = useRestaurants(queryParams);

  // Update display data when new data arrives
  useEffect(() => {
    if (data) {
      setDisplayData({
        restaurants: data.restaurants,
        count: data.count || 0,
      });
      isInitialLoad.current = false;
    }
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        enableSorting: true,
        sortLabel: "Name",
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
          </div>
        ),
      }),
      columnHelper.accessor("is_open", {
        header: "Status",
        enableSorting: true,
        sortLabel: "Status",
        cell: ({ getValue }) => (
          <StatusBadge color={getValue() ? "green" : "red"}>{getValue() ? "Open" : "Closed"}</StatusBadge>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        enableSorting: true,
        sortLabel: "Phone",
        cell: ({ getValue }) => <Text size="small">{getValue() || "—"}</Text>,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableSorting: true,
        sortLabel: "Email",
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

  // Use optimistic loading state - only show loading on initial load
  const isTableLoading = loading && isInitialLoad.current;

  const table = useDataTable({
    columns,
    data: displayData?.restaurants || [],
    getRowId: (row) => row.id,
    rowCount: displayData?.count || 0,
    isLoading: isTableLoading, // Only show loading spinner on initial load
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    search: {
      state: search,
      onSearchChange: setSearch,
    },
    filtering: {
      state: filtering,
      onFilteringChange: setFiltering,
    },
    filters,
    sorting: {
      state: sorting,
      onSortingChange: setSorting,
    },
    onRowClick: (event: React.MouseEvent, row: RestaurantDTO) => {
      // Don't navigate if clicking on the actions menu or buttons
      const target = event.target as HTMLElement;
      if (target.closest("[data-actions]") || target.closest("button") || target.closest('[role="menuitem"]')) {
        return;
      }
      navigate(`/restaurants/${row.id}`);
    },
  });

  const handleCreateSuccess = () => {
    refetch();
  };

  // Only show loading screen on initial load or when there's an error and no data
  if (isTableLoading || (error && !displayData)) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-center p-8">
          <Text>{error ? "Error loading restaurants" : "Loading restaurants..."}</Text>
        </div>
      </Container>
    );
  }

  if (error && !displayData) {
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

  if (!loading && (!displayData?.restaurants || displayData.restaurants.length === 0)) {
    return (
      <Container className="divide-y p-0">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 mb-4 text-ui-fg-muted">
            <StoreIcon />
          </div>
          <Heading level="h3" className="mb-2">
            {search || Object.keys(filtering).length > 0 ? "No restaurants found" : "No restaurants yet"}
          </Heading>
          <Text className="text-ui-fg-subtle mb-4">
            {search || Object.keys(filtering).length > 0
              ? "Try adjusting your search or filters"
              : "Get started by creating your first restaurant"}
          </Text>
          {!search && Object.keys(filtering).length === 0 && <RestaurantCreateModal onSuccess={handleCreateSuccess} />}
        </div>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        {/* Built-in toolbar with all controls */}
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Heading>Restaurants</Heading>
            <RestaurantCreateModal onSuccess={handleCreateSuccess} />
          </div>
          <div className="flex gap-2">
            <DataTable.FilterMenu tooltip="Filter restaurants" />
            <DataTable.SortingMenu tooltip="Sort restaurants" />
            <DataTable.Search placeholder="Search restaurants..." />
            <Button size="small" variant="secondary" asChild>
              <div onClick={() => (window.location.href = "/app/restaurants/export")}>Export</div>
            </Button>
          </div>
        </DataTable.Toolbar>

        {/* Show subtle loading indicator for background operations */}
        {loading && !isInitialLoad.current && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-ui-bg-subtle">
            <div className="h-full bg-ui-fg-interactive animate-pulse" />
          </div>
        )}

        {/* Built-in command bar for bulk actions (shown when rows are selected) */}
        <DataTable.CommandBar selectedLabel={(count) => `${count} restaurant(s) selected`} />

        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};
