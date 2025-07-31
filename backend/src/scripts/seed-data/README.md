# JSON-Based Seed Data System

This directory contains a flexible JSON-based seed data system that allows you to create different testing scenarios for your Medusa 2.0 application.

## Directory Structure

```
seed-data/
├── README.md           # This documentation
├── types.ts            # TypeScript type definitions
├── loader.ts           # Data loading utilities
├── default/            # Default e-commerce scenario
│   ├── config.json     # Core configuration
│   ├── categories.json # Product categories
│   ├── products.json   # Products data
│   └── shipping.json   # Shipping configuration
├── restaurant/         # Restaurant-focused scenario
│   ├── config.json
│   ├── categories.json
│   ├── products.json
│   └── shipping.json
└── testing/            # Minimal testing scenario
    ├── config.json
    ├── categories.json
    ├── products.json
    └── shipping.json
```

## Usage

### Running with Different Scenarios

You can specify which seed data scenario to use in several ways:

1. **Environment Variable** (recommended):

   ```bash
   # Use restaurant scenario
   SEED_SCENARIO=restaurant pnpm db:seed

   # Use testing scenario
   SEED_SCENARIO=testing pnpm db:seed

   # Use default scenario (default behavior)
   pnpm db:seed
   ```

2. **Automatic Detection**:
   - In test environment (`NODE_ENV=test`), automatically uses `testing` scenario
   - Otherwise uses `default` scenario

### Creating Custom Scenarios

To create a new seed scenario:

1. Create a new directory under `seed-data/` (e.g., `seed-data/my-scenario/`)
2. Add the required JSON files (see file structure below)
3. Run with: `SEED_SCENARIO=my-scenario pnpm db:seed`

## File Formats

### config.json

Core system configuration including currencies, regions, and locations.

```json
{
  "defaultCurrency": "eur",
  "supportedCurrencies": [{ "currency_code": "eur", "is_default": true }, { "currency_code": "usd" }],
  "countries": ["gb", "de", "dk", "se", "fr", "es", "it", "us"],
  "region": {
    "name": "Europe",
    "currency_code": "eur",
    "payment_providers": ["pp_system_default"]
  },
  "stockLocation": {
    "name": "Main Warehouse",
    "address": {
      "city": "Copenhagen",
      "country_code": "DK",
      "address_1": "123 Storage Street"
    }
  },
  "salesChannel": {
    "name": "Default Sales Channel",
    "description": "Default sales channel for all products"
  },
  "apiKey": {
    "title": "Webshop",
    "type": "publishable"
  }
}
```

### categories.json

Product categories definition.

```json
[
  {
    "name": "Clothing",
    "description": "Apparel and clothing items",
    "is_active": true
  }
]
```

### products.json

Products with variants, pricing, and options.

```json
[
  {
    "title": "Classic T-Shirt",
    "category_name": "Clothing",
    "description": "A comfortable and stylish classic t-shirt",
    "handle": "classic-t-shirt",
    "weight": 200,
    "status": "published",
    "images": [{ "url": "https://example.com/image.png" }],
    "options": [
      {
        "title": "Size",
        "values": ["S", "M", "L", "XL"]
      }
    ],
    "variants": [
      {
        "title": "S",
        "sku": "TSHIRT-S",
        "options": { "Size": "S" },
        "prices": [{ "amount": 1999, "currency_code": "eur" }]
      }
    ]
  }
]
```

### shipping.json

Shipping profiles, fulfillment sets, and shipping options.

```json
{
  "fulfillmentSet": {
    "name": "Main Warehouse Delivery",
    "type": "shipping"
  },
  "shippingProfile": {
    "name": "Default Shipping Profile",
    "type": "default"
  },
  "shippingOptions": [
    {
      "name": "Standard Shipping",
      "price_type": "flat",
      "provider_id": "manual_manual",
      "type": {
        "label": "Standard",
        "description": "Ship in 2-3 days.",
        "code": "standard"
      },
      "prices": [{ "currency_code": "eur", "amount": 10 }],
      "rules": [
        {
          "attribute": "enabled_in_store",
          "value": "true",
          "operator": "eq"
        }
      ]
    }
  ]
}
```

## Available Scenarios

### Default

- **Purpose**: General e-commerce setup
- **Categories**: Clothing, Electronics, Home & Garden
- **Products**: T-shirt, Wireless Headphones
- **Shipping**: Standard and Express options

### Restaurant

- **Purpose**: Food delivery/restaurant orders
- **Categories**: Appetizers, Main Courses, Desserts, Beverages, Cocktails
- **Products**: Caesar Salad, Grilled Salmon, Classic Mojito, etc.
- **Shipping**: Delivery and Pickup options with shorter timeframes

### Testing

- **Purpose**: Minimal setup for automated testing
- **Categories**: Single test category
- **Products**: One simple test product
- **Shipping**: Single shipping option

## TypeScript Integration

The system includes full TypeScript support with type definitions for all JSON structures. See `types.ts` for complete type information.

## Error Handling

- **Missing Scenarios**: Falls back to `default` scenario with warning
- **Invalid JSON**: Provides detailed error messages with file and scenario info
- **Missing Files**: Clear error messages indicating which files are missing
- **Data Validation**: Runtime validation ensures data integrity

## Best Practices

1. **Handles**: Ensure product handles are unique across scenarios
2. **SKUs**: Use descriptive SKU patterns for easy identification
3. **Categories**: Reference categories by name in products (automatic linking)
4. **Prices**: Include prices for all supported currencies
5. **Testing**: Use minimal data in testing scenarios for faster execution

## Troubleshooting

### Scenario Not Found

```
Seed scenario 'my-scenario' not found, falling back to 'default'
```

**Solution**: Ensure the scenario directory exists and contains valid `config.json`

### JSON Parse Error

```
Failed to load products.json for scenario 'restaurant': Unexpected token
```

**Solution**: Validate JSON syntax in the specified file

### Category Not Found

```
Category 'InvalidCategory' not found for product 'My Product'
```

**Solution**: Ensure the `category_name` in products matches a category in `categories.json`

## Migration from Old Seed System

The old hardcoded seed system is preserved as `seed.ts`. To switch back:

```bash
# In backend/package.json
"seed": "medusa exec ./src/scripts/seed.ts"
```

The new system maintains the same seeding behavior while adding flexibility through JSON configuration.
