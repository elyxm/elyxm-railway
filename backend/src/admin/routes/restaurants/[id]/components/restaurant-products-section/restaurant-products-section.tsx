import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  DataTableSortingState,
  Heading,
  StatusBadge,
  Text,
  useDataTable,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type RestaurantProductsSectionProps = {
  restaurant: any; // TODO: Replace with proper type
};

const columnHelper = createDataTableColumnHelper<any>();
const PAGE_SIZE = 10;

export const RestaurantProductsSection = ({ restaurant }: RestaurantProductsSectionProps) => {
  const navigate = useNavigate();
  const products = restaurant.products || [];

  // Enhanced DataTable state management
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  });
  const [search, setSearch] = useState<string>("");
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null);

  // Filter products based on search (client-side for this component)
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter(
      (product: any) =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.handle.toLowerCase().includes(search.toLowerCase()) ||
        product.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Sort filtered products if sorting is enabled
  const sortedProducts = useMemo(() => {
    if (!sorting) return filteredProducts;

    return [...filteredProducts].sort((a: any, b: any) => {
      let aValue = a[sorting.id];
      let bValue = b[sorting.id];

      if (sorting.id === "created_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sorting.desc ? 1 : -1;
      }
      if (aValue > bValue) {
        return sorting.desc ? -1 : 1;
      }
      return 0;
    });
  }, [filteredProducts, sorting]);

  // Paginate sorted products
  const paginatedProducts = useMemo(() => {
    const start = pagination.pageIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return sortedProducts.slice(start, end);
  }, [sortedProducts, pagination.pageIndex]);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "green";
      case "draft":
        return "grey";
      case "proposed":
        return "orange";
      case "rejected":
        return "red";
      default:
        return "grey";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "Published";
      case "draft":
        return "Draft";
      case "proposed":
        return "Proposed";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  // Define columns using the DataTable column helper
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        enableSorting: true,
        sortLabel: "Title",
        cell: ({ getValue, row }) => (
          <div className="space-y-1">
            <Text
              size="small"
              weight="plus"
              className="leading-none cursor-pointer hover:text-ui-fg-base transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${row.original.id}`);
              }}
            >
              {getValue()}
            </Text>
            {row.original.description && (
              <Text size="xsmall" className="text-ui-fg-subtle leading-none">
                {row.original.description.substring(0, 80)}
                {row.original.description.length > 80 && "..."}
              </Text>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("handle", {
        header: "SKU",
        enableSorting: true,
        sortLabel: "SKU",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableSorting: true,
        sortLabel: "Status",
        cell: ({ getValue }) => (
          <StatusBadge color={getStatusBadgeColor(getValue())}>{getStatusText(getValue())}</StatusBadge>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        enableSorting: true,
        sortLabel: "Created",
        cell: ({ getValue }) => (
          <Text size="small" className="text-ui-fg-subtle">
            {new Date(getValue()).toLocaleDateString()}
          </Text>
        ),
      }),
    ],
    [navigate]
  );

  const table = useDataTable({
    columns,
    data: paginatedProducts,
    getRowId: (row) => row.id,
    rowCount: sortedProducts.length,
    isLoading: false,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    search: {
      state: search,
      onSearchChange: setSearch,
    },
    sorting: {
      state: sorting,
      onSortingChange: setSorting,
    },
    onRowClick: (event: React.MouseEvent, row: any) => {
      // Navigate to product details
      navigate(`/products/${row.id}`);
    },
  });

  if (products.length === 0) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h3">Products</Heading>
        </div>
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">No products found for {restaurant.name}</Text>
        </div>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        {/* Enhanced toolbar with search */}
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div>
            <Heading level="h3">Products</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {filteredProducts.length} of {products.length} products
            </Text>
          </div>
          <div className="flex gap-2">
            <DataTable.SortingMenu tooltip="Sort products" />
            <DataTable.Search placeholder="Search products..." />
          </div>
        </DataTable.Toolbar>

        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};
