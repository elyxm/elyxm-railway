import { useEffect, useState } from "react";
import { RoleDTO } from "../../modules/rbac/types/common";
import { mockRoles } from "./mock-data";

interface RoleResponse {
  role: RoleDTO;
}

export const useRole = (
  id: string
): {
  data: RoleResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [data, setData] = useState<RoleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      setTimeout(() => {
        const role = mockRoles.find((r) => r.id === id);

        if (!role) {
          throw new Error(`Role with ID ${id} not found`);
        }

        setData({ role });
        setLoading(false);
      }, 500); // 500ms delay to simulate network
    } catch (error) {
      console.error("Error fetching role:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setData(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRole();
    }
  }, [id]);

  return { data, loading, error, refetch: fetchRole };
};
