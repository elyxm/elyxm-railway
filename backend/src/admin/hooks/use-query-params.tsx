import { useEffect, useState } from "react";

type QueryParams<T extends string> = {
  [key in T]: string | undefined;
};

export function useQueryParams<T extends string>(keys: T[], prefix?: string): QueryParams<T> {
  const [params, setParams] = useState<QueryParams<T>>({} as QueryParams<T>);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = {} as QueryParams<T>;

    keys.forEach((key) => {
      const prefixedKey = prefix ? `${prefix}_${key}` : key;
      const value = urlParams.get(prefixedKey) || undefined;
      result[key] = value;
    });

    setParams(result);
  }, [keys, prefix]);

  return params;
}
