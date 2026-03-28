-- Migration 022: Fix Supabase Security Advisor warnings
--
-- Fix 1: Drop unused view that runs with owner permissions (security definer behaviour).
-- land_claims_detailed was defined in migration 002 but is not used anywhere in
-- the application code. Dropping it removes the security concern entirely.
DROP VIEW IF EXISTS public.land_claims_detailed;

-- Fix 2: Enable RLS on PostGIS spatial_ref_sys.
-- See migration 024 for details — this requires the Supabase Dashboard
-- Table Editor because spatial_ref_sys is owned by supabase_admin and the
-- postgres role cannot enable RLS on it.
--
-- Kept as a no-op here; the actual fix is applied via the Dashboard UI.
-- On self-hosted Supabase where the executing role owns the table, the
-- statements in 024 will succeed automatically.
