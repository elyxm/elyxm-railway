import { useEffect, useState } from "react";
import { DeliveryDTO, DriverDTO, RestaurantDTO } from "../../modules";

export const useDrivers = (
  query?: Record<string, any>
): {
  data: { drivers: DriverDTO[] } | null;
  loading: boolean;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const filterQuery = new URLSearchParams(query).toString();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("/store/drivers" + (query ? `?${filterQuery}` : ""));
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching the data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return { data, loading };
};

export const useDeliveries = (
  query?: Record<string, any>
): {
  data: { deliveries: DeliveryDTO[] } | null;
  loading: boolean;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const filterQuery = new URLSearchParams(query).toString();

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("/store/deliveries" + (query ? `?${filterQuery}` : ""));
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching the data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return { data, loading };
};

export const useRestaurants = (
  query?: Record<string, any>
): {
  data: { restaurants: RestaurantDTO[]; count?: number; limit?: number; offset?: number } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean up query parameters
      const cleanQuery = { ...query };
      Object.keys(cleanQuery).forEach((key) => {
        if (cleanQuery[key] === undefined || cleanQuery[key] === null || cleanQuery[key] === "") {
          delete cleanQuery[key];
        }
      });

      const filterQuery = new URLSearchParams(cleanQuery).toString();
      const response = await fetch("/admin/restaurants" + (filterQuery ? `?${filterQuery}` : ""));

      if (!response.ok) {
        throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [JSON.stringify(query)]);

  return { data, loading, error, refetch: fetchRestaurants };
};

export const useRestaurant = (
  id: string
): {
  data: { restaurant: RestaurantDTO } | null;
  loading: boolean;
  refetch: () => void;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/restaurants/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch restaurant: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  return { data, loading, refetch: fetchRestaurant };
};

export const useCreateRestaurant = () => {
  const [loading, setLoading] = useState(false);

  const createRestaurant = async (restaurantData: {
    name: string;
    handle: string;
    description?: string;
    is_open?: boolean;
    phone?: string;
    email?: string;
    address?: string;
    image_url?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch("/admin/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create restaurant");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createRestaurant, loading };
};

export const useUpdateRestaurant = () => {
  const [loading, setLoading] = useState(false);

  const updateRestaurant = async (
    id: string,
    restaurantData: {
      name?: string;
      handle?: string;
      description?: string;
      is_open?: boolean;
      phone?: string;
      email?: string;
      address?: string;
      image_url?: string;
    }
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update restaurant");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating restaurant:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateRestaurant, loading };
};

export const useDeleteRestaurant = () => {
  const [loading, setLoading] = useState(false);

  const deleteRestaurant = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/restaurants/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete restaurant");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteRestaurant, loading };
};

export const useUpdateRestaurantStatus = () => {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id: string, is_open: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/restaurants/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_open }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update restaurant status");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
};

export * from "./use-permissions";
export * from "./use-role";
export * from "./use-roles";
