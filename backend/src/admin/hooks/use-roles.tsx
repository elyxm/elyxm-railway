import { useCallback, useEffect, useState } from "react";
import { RoleDTO } from "../../modules/rbac/types/common";
import { mockRoles } from "./mock-data";

interface RolesResponse {
  roles: RoleDTO[];
  count: number;
  limit: number;
  offset: number;
}

interface RolesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: {
    id: string;
    desc: boolean;
  };
}

export const useRoles = (
  query?: RolesQuery
): {
  data: RolesResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [data, setData] = useState<RolesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      setTimeout(() => {
        let filteredRoles = [...mockRoles];
        const pageSize = query?.pageSize || 20;
        const page = query?.page || 1;
        const offset = (page - 1) * pageSize;

        // Basic search implementation
        if (query?.search) {
          const searchLower = query.search.toLowerCase();
          filteredRoles = filteredRoles.filter(
            (r) => r.name.toLowerCase().includes(searchLower) || r.description?.toLowerCase().includes(searchLower)
          );
        }

        // Basic sorting
        if (query?.sort) {
          const { id, desc } = query.sort;
          if (id && typeof id === "string") {
            const sortField = id as keyof RoleDTO;
            filteredRoles.sort((a, b) => {
              const aValue = a[sortField];
              const bValue = b[sortField];

              if (aValue === undefined || bValue === undefined) return 0;

              const modifier = desc ? -1 : 1;
              if (aValue instanceof Date && bValue instanceof Date) {
                return aValue.getTime() < bValue.getTime()
                  ? -1 * modifier
                  : aValue.getTime() > bValue.getTime()
                  ? 1 * modifier
                  : 0;
              }
              return String(aValue).localeCompare(String(bValue)) * modifier;
            });
          }
        }

        // Pagination
        const paginatedRoles = filteredRoles.slice(offset, offset + pageSize);

        setData({
          roles: paginatedRoles,
          count: filteredRoles.length,
          limit: pageSize,
          offset,
        });
        setLoading(false);
      }, 500); // 500ms delay to simulate network
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setData(null);
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { data, loading, error, refetch: fetchRoles };
};
