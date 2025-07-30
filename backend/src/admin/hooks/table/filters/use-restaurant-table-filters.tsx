import { useMemo } from "react";

type Filter = {
  key: string;
  label: string;
  type: "select" | "date";
  multiple?: boolean;
  options?: Array<{
    label: string;
    value: string;
  }>;
};

const excludeableFields = ["is_open", "phone", "email", "address"] as const;

export const useRestaurantTableFilters = (exclude?: (typeof excludeableFields)[number][]) => {
  const filters = useMemo(() => {
    let filterList: Filter[] = [];

    // Status filter (Open/Closed)
    if (!exclude?.includes("is_open")) {
      const statusFilter: Filter = {
        key: "is_open",
        label: "Status",
        type: "select",
        multiple: false,
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
      };
      filterList = [...filterList, statusFilter];
    }

    // Phone filter
    if (!exclude?.includes("phone")) {
      const phoneFilter: Filter = {
        key: "phone",
        label: "Has Phone",
        type: "select",
        multiple: false,
        options: [
          {
            label: "With Phone",
            value: "true",
          },
          {
            label: "Without Phone",
            value: "false",
          },
        ],
      };
      filterList = [...filterList, phoneFilter];
    }

    // Email filter
    if (!exclude?.includes("email")) {
      const emailFilter: Filter = {
        key: "email",
        label: "Has Email",
        type: "select",
        multiple: false,
        options: [
          {
            label: "With Email",
            value: "true",
          },
          {
            label: "Without Email",
            value: "false",
          },
        ],
      };
      filterList = [...filterList, emailFilter];
    }

    // Date filters
    const dateFilters: Filter[] = [
      { label: "Created At", key: "created_at" },
      { label: "Updated At", key: "updated_at" },
    ].map((f) => ({
      key: f.key,
      label: f.label,
      type: "date" as const,
    }));

    filterList = [...filterList, ...dateFilters];

    return filterList;
  }, [exclude]);

  return filters;
};
