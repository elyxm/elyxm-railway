export interface SeedConfig {
  defaultCurrency: string;
  supportedCurrencies: Array<{
    currency_code: string;
    is_default?: boolean;
  }>;
  countries: string[];
  region: {
    name: string;
    currency_code: string;
    payment_providers: string[];
  };
  stockLocation: {
    name: string;
    address: {
      city: string;
      country_code: string;
      address_1: string;
    };
  };
  salesChannel: {
    name: string;
    description: string;
  };
  apiKey: {
    title: string;
    type: string;
  };
}

export interface ProductCategory {
  name: string;
  description: string;
  is_active: boolean;
}

export interface ProductOption {
  title: string;
  values: string[];
}

export interface ProductVariant {
  title: string;
  sku: string;
  options: Record<string, string>;
  prices: Array<{
    amount: number;
    currency_code: string;
  }>;
}

export interface ProductData {
  title: string;
  category_name: string;
  description: string;
  handle: string;
  weight: number;
  status: string;
  images?: Array<{
    url: string;
  }>;
  options: ProductOption[];
  variants: ProductVariant[];
}

export interface ShippingRule {
  attribute: string;
  value: string;
  operator: string;
}

export interface ShippingOptionType {
  label: string;
  description: string;
  code: string;
}

export interface ShippingOptionPrice {
  currency_code: string;
  amount: number;
  region_id?: string;
}

export interface ShippingOption {
  name: string;
  price_type: string;
  provider_id: string;
  type: ShippingOptionType;
  prices: ShippingOptionPrice[];
  rules: ShippingRule[];
}

export interface ShippingData {
  fulfillmentSet: {
    name: string;
    type: string;
  };
  shippingProfile: {
    name: string;
    type: string;
  };
  shippingOptions: ShippingOption[];
}

// RBAC Types for seeding
export interface PermissionData {
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RoleData {
  name: string;
  slug: string;
  description: string;
  scope_type: "global" | "client";
  is_global: boolean;
  permissions: string[]; // Array of permission slugs
}

export interface RBACData {
  permissions: PermissionData[];
  roles: RoleData[];
}

export interface SeedDataSet {
  config: SeedConfig;
  categories: ProductCategory[];
  products: ProductData[];
  shipping: ShippingData;
  rbac: RBACData;
}
