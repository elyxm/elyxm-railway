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
import { RoleDTO, ScopeType } from "../../modules/rbac/types/common";
import { useRoles } from "../hooks";
import RoleActionsMenu from "./role-actions-menu";
import RoleCreateModal from "./role-create-modal";

const columnHelper = createDataTableColumnHelper<RoleDTO>();
const filterHelper = createDataTableFilterHelper<RoleDTO>();
const PAGE_SIZE = 20;

// Define filters using the built-in filter helper
const filters = [
  filterHelper.accessor("scope_type", {
    type: "select",
    label: "Scope",
    options: [
      {
        label: "Global",
        value: ScopeType.GLOBAL,
      },
      {
        label: "Client",
        value: ScopeType.CLIENT,
      },
    ],
  }),
  filterHelper.accessor("is_global", {
    type: "select",
    label: "Access Level",
    options: [
      {
        label: "Global",
        value: "true",
      },
      {
        label: "Client-Specific",
        value: "false",
      },
    ],
  }),
];

export const RoleListTable = () => {
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Keep track of previous data to prevent flickering
  const [displayData, setDisplayData] = useState<{ roles: RoleDTO[]; count: number } | null>(null);
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
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    };

    // Use debounced search instead of immediate search
    if (debouncedSearch) params.search = debouncedSearch;

    // Handle filtering
    if (Object.keys(filtering).length > 0) {
      params.filters = filtering;
    }

    // Handle sorting
    if (sorting) {
      params.sort = sorting;
    }

    return params;
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, filtering, sorting]);

  const { data, loading, error, refetch } = useRoles(queryParams);

  // Update display data when new data arrives
  useEffect(() => {
    if (data) {
      setDisplayData({
        roles: data.roles,
        count: data.count || 0,
      });
      isInitialLoad.current = false;
    }
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue }) => <Text className="txt-compact-medium-plus text-ui-fg-base">{getValue()}</Text>,
        enableSorting: true,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: ({ getValue }) => <Text className="txt-compact-medium text-ui-fg-subtle">{getValue() || "—"}</Text>,
        enableSorting: true,
      }),
      columnHelper.accessor("scope_type", {
        header: "Scope",
        cell: ({ getValue }) => (
          <StatusBadge color={getValue() === ScopeType.GLOBAL ? "blue" : "green"}>{getValue()}</StatusBadge>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("is_global", {
        header: "Access Level",
        cell: ({ getValue }) => (
          <StatusBadge color={getValue() ? "blue" : "green"}>{getValue() ? "Global" : "Client-Specific"}</StatusBadge>
        ),
        enableSorting: true,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div data-actions>
            <RoleActionsMenu role={row.original} onUpdate={refetch} />
          </div>
        ),
      }),
    ],
    [refetch]
  );

  // Use optimistic loading state - only show loading on initial load
  const isTableLoading = loading && isInitialLoad.current;

  const table = useDataTable({
    columns,
    data: displayData?.roles || [],
    getRowId: (row) => row.id,
    rowCount: displayData?.count || 0,
    isLoading: isTableLoading,
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
    onRowClick: (event: React.MouseEvent, row: RoleDTO) => {
      // Don't navigate if clicking on the actions menu or buttons
      const target = event.target as HTMLElement;
      if (target.closest("[data-actions]") || target.closest("button") || target.closest('[role="menuitem"]')) {
        return;
      }
      navigate(`/roles/${row.id}`);
    },
  });

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  // Only show loading screen on initial load or when there's an error and no data
  if (isTableLoading || (error && !displayData)) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-center p-8">
          <Text className={error ? "text-ui-fg-error" : "text-ui-fg-subtle"}>
            {error ? `Error loading roles: ${error}` : "Loading roles..."}
          </Text>
        </div>
      </Container>
    );
  }

  // Show empty state when there are no roles and no active filters
  const hasActiveFilters = Object.keys(filtering).length > 0 || search.length > 0;
  if (!isTableLoading && !error && displayData?.roles.length === 0) {
    return (
      <Container className="divide-y p-0">
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Heading>Roles & Permissions</Heading>
            <RoleCreateModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onSuccess={handleCreateSuccess}
            />
          </div>
          <div className="flex gap-2">
            <DataTable.FilterMenu tooltip="Filter roles" />
            <DataTable.SortingMenu tooltip="Sort roles" />
            <DataTable.Search placeholder="Search roles..." />
          </div>
        </DataTable.Toolbar>

        <div className="flex flex-col items-center justify-center p-12">
          <Text className="text-ui-fg-subtle mb-4">
            {hasActiveFilters ? "No roles match your search criteria" : "No roles have been created yet"}
          </Text>
          {!hasActiveFilters && (
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
              Create your first role
            </Button>
          )}
        </div>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Heading>Roles & Permissions</Heading>
            <RoleCreateModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onSuccess={handleCreateSuccess}
            />
          </div>
          <div className="flex gap-2">
            <DataTable.FilterMenu tooltip="Filter roles" />
            <DataTable.SortingMenu tooltip="Sort roles" />
            <DataTable.Search placeholder="Search roles..." />
          </div>
        </DataTable.Toolbar>

        {loading && !isInitialLoad.current && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-ui-bg-subtle">
            <div className="h-full bg-ui-fg-interactive animate-pulse" />
          </div>
        )}

        <DataTable.CommandBar selectedLabel={(count) => `${count} role(s) selected`} />
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};
