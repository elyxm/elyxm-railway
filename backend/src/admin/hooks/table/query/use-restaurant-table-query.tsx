import { useQueryParams } from "../../../hooks/use-query-params";

type UseRestaurantTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

const DEFAULT_FIELDS = "id,name,description,is_open,phone,email,address,created_at,updated_at";

export const useRestaurantTableQuery = ({ prefix, pageSize = 20 }: UseRestaurantTableQueryProps) => {
  const queryObject = useQueryParams(
    ["offset", "order", "q", "created_at", "updated_at", "is_open", "phone", "email", "address", "id"],
    prefix
  );

  const { offset, is_open, created_at, updated_at, phone, email, address, order, q } = queryObject;

  const searchParams = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    is_open: is_open ? is_open === "true" : undefined,
    created_at: created_at ? JSON.parse(created_at) : undefined,
    updated_at: updated_at ? JSON.parse(updated_at) : undefined,
    phone: phone,
    email: email,
    address: address,
    order: order,
    q,
    fields: DEFAULT_FIELDS,
  };

  return {
    searchParams,
    raw: queryObject,
  };
};
