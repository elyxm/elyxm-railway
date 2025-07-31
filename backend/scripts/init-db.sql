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

-- Create additional databases for testing if needed
-- CREATE DATABASE elyxm_test OWNER :"POSTGRES_USER";

-- Set timezone for the current database
ALTER DATABASE :"POSTGRES_DB" SET timezone TO 'UTC';

-- Create a schema for the cocktail module (optional - can be done via migrations)
-- CREATE SCHEMA IF NOT EXISTS cocktail AUTHORIZATION :"POSTGRES_USER";

-- Grant necessary permissions to the application user
GRANT ALL PRIVILEGES ON DATABASE :"POSTGRES_DB" TO :"POSTGRES_USER";
GRANT ALL PRIVILEGES ON SCHEMA public TO :"POSTGRES_USER";

-- Log completion
SELECT 'Database initialization completed successfully for ' || :'POSTGRES_DB' as status; 