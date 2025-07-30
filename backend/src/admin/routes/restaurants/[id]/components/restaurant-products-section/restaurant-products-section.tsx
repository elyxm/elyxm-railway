import { Container, Heading, Input, StatusBadge, Text } from "@medusajs/ui";
import { useMemo, useState } from "react";

type RestaurantProductsSectionProps = {
  restaurant: any; // TODO: Replace with proper type
};

const PAGE_SIZE = 10;

export const RestaurantProductsSection = ({ restaurant }: RestaurantProductsSectionProps) => {
  const products = restaurant.products || [];
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter(
      (product: any) =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.handle.toLowerCase().includes(search.toLowerCase()) ||
        product.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredProducts, sortField, sortDirection]);

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null; // Only show icon for active sort column
    return sortDirection === "asc" ? "↑" : "↓";
  };

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

  const handleProductClick = (productId: string) => {
    // Navigate in current page instead of opening new tab
    window.location.href = `/app/products/${productId}`;
  };

  return (
    <Container className="divide-y p-0">
      {/* Header with search */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h3">Products</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {filteredProducts.length} of {products.length} products
          </Text>
        </div>
        <div className="w-64">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </div>
      </div>

      {/* Table */}
      {paginatedProducts.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">
            {search ? `No products match your search "${search}"` : `No products found for ${restaurant.name}`}
          </Text>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="h-12 px-6 text-left align-middle text-ui-fg-subtle border-b whitespace-nowrap">
                    <div
                      className="group flex items-center gap-1 txt-compact-small-plus cursor-pointer select-none w-fit hover:text-ui-fg-base transition-colors"
                      onClick={() => handleSort("title")}
                    >
                      <span>Title</span>
                      {getSortIcon("title") && <span className="text-xs">{getSortIcon("title")}</span>}
                      {!getSortIcon("title") && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↕</span>
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-6 text-left align-middle text-ui-fg-subtle border-b whitespace-nowrap">
                    <div
                      className="group flex items-center gap-1 txt-compact-small-plus cursor-pointer select-none w-fit hover:text-ui-fg-base transition-colors"
                      onClick={() => handleSort("handle")}
                    >
                      <span>SKU</span>
                      {getSortIcon("handle") && <span className="text-xs">{getSortIcon("handle")}</span>}
                      {!getSortIcon("handle") && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↕</span>
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-6 text-left align-middle text-ui-fg-subtle border-b whitespace-nowrap">
                    <div
                      className="group flex items-center gap-1 txt-compact-small-plus cursor-pointer select-none w-fit hover:text-ui-fg-base transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <span>Status</span>
                      {getSortIcon("status") && <span className="text-xs">{getSortIcon("status")}</span>}
                      {!getSortIcon("status") && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↕</span>
                      )}
                    </div>
                  </th>
                  <th className="h-12 px-6 text-left align-middle text-ui-fg-subtle border-b whitespace-nowrap">
                    <div
                      className="group flex items-center gap-1 txt-compact-small-plus cursor-pointer select-none w-fit hover:text-ui-fg-base transition-colors"
                      onClick={() => handleSort("created_at")}
                    >
                      <span>Created</span>
                      {getSortIcon("created_at") && <span className="text-xs">{getSortIcon("created_at")}</span>}
                      {!getSortIcon("created_at") && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↕</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product: any) => (
                  <tr
                    key={product.id}
                    className="border-b transition-colors hover:bg-ui-bg-subtle-hover cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <td className="p-4 align-middle">
                      <div className="space-y-1">
                        <Text size="small" weight="plus" className="leading-none text-ui-fg-subtle">
                          {product.title}
                        </Text>
                        {product.description && (
                          <Text size="xsmall" className="text-ui-fg-subtle leading-none">
                            {product.description.substring(0, 80)}
                            {product.description.length > 80 && "..."}
                          </Text>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Text size="small" className="txt-compact-small text-ui-fg-subtle">
                        {product.handle}
                      </Text>
                    </td>
                    <td className="p-4 align-middle">
                      <StatusBadge color={getStatusBadgeColor(product.status)}>
                        {getStatusText(product.status)}
                      </StatusBadge>
                    </td>
                    <td className="p-4 align-middle">
                      <Text size="small" className="txt-compact-small text-ui-fg-subtle">
                        {new Date(product.created_at).toLocaleDateString()}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Text size="small" className="text-ui-fg-subtle">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, sortedProducts.length)} of{" "}
            {sortedProducts.length} results
          </Text>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-ui-bg-subtle-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-ui-bg-subtle-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};
