# Production Database Setup Guide

## PostgreSQL Extensions

This project can use PostgreSQL extensions for enhanced functionality, but they are **optional** and have application-level alternatives.

### Required Extensions: None

The application will work without any extensions using standard PostgreSQL features.

### Recommended Extensions

#### 1. `uuid-ossp` (UUID Generation)

**Purpose**: Generate UUIDs in the database
**Production Check**:

```sql
-- Check if extension is available
SELECT * FROM pg_available_extensions WHERE name = 'uuid-ossp';

-- Enable if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Alternative**: Use Node.js built-in UUID generation

```javascript
// Instead of database UUID generation
import { randomUUID } from "crypto";
const id = randomUUID(); // Works without database extension
```

#### 2. `citext` (Case-Insensitive Text)

**Purpose**: Case-insensitive text comparisons for emails, usernames
**Production Check**:

```sql
-- Check if extension is available
SELECT * FROM pg_available_extensions WHERE name = 'citext';

-- Enable if available
CREATE EXTENSION IF NOT EXISTS "citext";
```

**Alternative**: Use LOWER() functions or application normalization

```sql
-- Instead of citext column type
email VARCHAR(255) NOT NULL,
CONSTRAINT unique_email UNIQUE (LOWER(email))

-- In queries
WHERE LOWER(email) = LOWER($1)
```

## Cloud Provider Support

### ✅ Full Support

- **AWS RDS PostgreSQL**: Both extensions available
- **Google Cloud SQL**: Both extensions available
- **Azure Database for PostgreSQL**: Both extensions available
- **Railway**: Both extensions available
- **Heroku Postgres**: Both extensions available

### ⚠️ Check Required

- **Neon**: Usually available
- **Supabase**: Usually available
- **Corporate/Enterprise**: Check with your DBA

## Production Deployment Strategy

### Option 1: Use Extensions (Recommended)

```sql
-- Run in production before application deployment
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
```

### Option 2: Application-Level Fallbacks

Configure your application to handle missing extensions:

```javascript
// In your MedusaJS configuration
const databaseConfig = {
  // ... other config
  use_uuid_extension: process.env.DB_USE_UUID_EXTENSION === "true",
  use_citext_extension: process.env.DB_USE_CITEXT_EXTENSION === "true",
};
```

### Option 3: Hybrid Approach

Use extensions in development/staging, fallbacks in production if needed.

## Migration Strategy

### For Existing Production Databases

1. **Check extension availability**:

   ```sql
   SELECT name, installed_version
   FROM pg_available_extensions
   WHERE name IN ('uuid-ossp', 'citext');
   ```

2. **Enable extensions if available**:

   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "citext";
   ```

3. **Update application configuration** based on availability

### For New Production Deployments

1. **Request extensions** during database provisioning
2. **Test extension availability** in staging environment
3. **Configure application** based on available features

## Environment Variables

### Development Environment (`backend/.env`)

```env
# Database Configuration
POSTGRES_DB=elyxm_development
POSTGRES_USER=elyxm_admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_PORT=5433

# pgAdmin Configuration (for web interface login)
PGADMIN_DEFAULT_EMAIL=admin@elyxm.local
PGADMIN_DEFAULT_PASSWORD=letsgon0w
PGADMIN_PORT=8080

# Extension availability (set based on your database)
DB_USE_UUID_EXTENSION=true
DB_USE_CITEXT_EXTENSION=true
```

### Production Environment

```env
# Database connection (use your production database URL)
DATABASE_URL=postgresql://user:password@host:port/database

# Extension availability (set based on your production database)
DB_USE_UUID_EXTENSION=true
DB_USE_CITEXT_EXTENSION=true
```

## Verification Script

Create this script to verify your production database setup:

```sql
-- Check PostgreSQL version
SELECT version();

-- Check available extensions
SELECT name, installed_version, comment
FROM pg_available_extensions
WHERE name IN ('uuid-ossp', 'citext')
ORDER BY name;

-- Test UUID generation (if extension available)
SELECT uuid_generate_v4() as test_uuid;

-- Test case-insensitive comparison
SELECT 'TEST'::citext = 'test'::citext as citext_works;
```

## Best Practices

1. **Always use fallbacks**: Don't rely solely on extensions
2. **Test in staging**: Verify extension availability before production
3. **Document dependencies**: Keep track of which features use which extensions
4. **Monitor compatibility**: Extensions may affect database migrations or backups

## Troubleshooting

### Extension Not Found

```
ERROR: could not open extension control file "uuid-ossp.control"
```

**Solution**: Use application-level UUID generation

### Permission Denied

```
ERROR: permission denied to create extension "uuid-ossp"
```

**Solution**: Contact your database administrator or use managed service controls

### Version Conflicts

Some cloud providers have specific extension versions.
**Solution**: Check provider documentation for supported versions

### Port Conflicts

If you get port binding errors during development:

```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution**: Set `POSTGRES_PORT` in your `.env` to use a different port (e.g., 5433)
