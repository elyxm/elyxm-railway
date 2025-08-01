import { useEffect, useState } from "react";
import { PermissionDTO } from "../../modules/rbac/types/common";
import { mockPermissions } from "./mock-data";

interface PermissionsResponse {
  permissions: PermissionDTO[];
  count: number;
}

export const usePermissions = (
  query?: Record<string, any>
): {
  data: PermissionsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [data, setData] = useState<PermissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      setTimeout(() => {
        let filteredPermissions = [...mockPermissions];

        // Basic search implementation
        if (query?.search) {
          const searchLower = query.search.toLowerCase();
          filteredPermissions = filteredPermissions.filter(
            (p) => p.name.toLowerCase().includes(searchLower) || p.description?.toLowerCase().includes(searchLower)
          );
        }

        setData({
          permissions: filteredPermissions,
          count: filteredPermissions.length,
        });
        setLoading(false);
      }, 500); // 500ms delay to simulate network
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setData(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [query]);

  return { data, loading, error, refetch: fetchPermissions };
};
