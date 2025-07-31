-- Development database initialization script
-- This runs automatically when the PostgreSQL container starts for the first time

-- Enable extensions if available (optional - see notes below)
-- These extensions are recommended but not required for basic functionality

-- UUID extension for generating UUIDs (recommended for multi-tenant systems)
-- Alternative: Use application-level UUID generation (crypto.randomUUID() in Node.js)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    RAISE NOTICE 'uuid-ossp extension enabled - UUIDs can be generated in database';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'uuid-ossp extension not available - use application-level UUID generation';
END
$$;

-- Case-insensitive text extension (useful for emails, usernames)
-- Alternative: Use LOWER() functions in queries or application-level normalization
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "citext";
    RAISE NOTICE 'citext extension enabled - case-insensitive text available';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'citext extension not available - use LOWER() functions for case-insensitive comparisons';
END
$$;

-- Optional: Create a test database (commented out - enable if needed)
-- CREATE DATABASE elyxm_test OWNER elyxm_admin;

-- Set timezone for the current database
-- Note: Using hard-coded database name since environment variable substitution doesn't work here
ALTER DATABASE elyxm_development SET timezone TO 'UTC';

-- Create a schema for the cocktail module (optional - can be done via migrations)
-- CREATE SCHEMA IF NOT EXISTS cocktail AUTHORIZATION elyxm_admin;

-- Grant necessary permissions to the application user
-- Note: Using hard-coded names since environment variable substitution doesn't work here
GRANT ALL PRIVILEGES ON DATABASE elyxm_development TO elyxm_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO elyxm_admin;

-- Log completion
SELECT 'Database initialization completed successfully for elyxm_development' as status; 