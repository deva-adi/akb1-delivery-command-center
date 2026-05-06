-- AKB1 Delivery Command Center v1
-- WARNING: dev credentials only. Replace before any non-local deployment.
-- Production rotates these via Vault per PRD 03 section 12.
-- Postgres role provisioning. Runs once on cluster init via the
-- /docker-entrypoint-initdb.d hook in the postgres:16-alpine image.
--
-- Two operational roles enforce the audit append-only invariant per D-036:
--
--   akb1_owner : owns the schema, runs Alembic migrations. NOT a Postgres
--                superuser. This is intentional: FORCE ROW LEVEL SECURITY on
--                audit_trail_entries (slice 2.3) blocks even the table owner
--                from UPDATE and DELETE.
--
--   akb1_app   : FastAPI runtime connection user. Granted SELECT and INSERT
--                only on audit_trail_entries. Has UPDATE and DELETE on other
--                tables per the access matrix in 01_PRD_Data_Model.md
--                section 3.1.10.
--
-- The bootstrap superuser (POSTGRES_USER) is used only to create these two
-- roles and transfer schema ownership. Application code never connects as the
-- bootstrap superuser.

CREATE ROLE akb1_owner LOGIN PASSWORD 'akb1_owner_password'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT;

CREATE ROLE akb1_app LOGIN PASSWORD 'akb1_app_password'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT;

-- Database-level grants. Schema-level and table-level grants are issued in
-- the migration files where the schema and tables live.
GRANT CONNECT, TEMPORARY ON DATABASE akb1_dcc TO akb1_owner, akb1_app;

-- Transfer the public schema to akb1_owner so migrations can DDL freely.
ALTER SCHEMA public OWNER TO akb1_owner;

-- akb1_app gets USAGE on public so it can resolve table names. Per-table
-- privileges (SELECT, INSERT, UPDATE, DELETE) are granted in the migration
-- files according to the audit invariant and the role access matrix.
GRANT USAGE ON SCHEMA public TO akb1_app;
