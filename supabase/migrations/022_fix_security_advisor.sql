-- Migration 022: Fix Supabase Security Advisor warnings
--
-- Fix 1: Drop unused view that runs with owner permissions (security definer behaviour).
-- land_claims_detailed was defined in migration 002 but is not used anywhere in
-- the application code. Dropping it removes the security concern entirely.
DROP VIEW IF EXISTS public.land_claims_detailed;

-- Fix 2: Enable RLS on PostGIS spatial_ref_sys.
-- The table is owned by the PostGIS extension install role. We reassign ownership
-- to postgres first so we can enable RLS, then add a permissive read policy
-- (the data is public coordinate reference definitions — not sensitive).
ALTER TABLE public.spatial_ref_sys OWNER TO postgres;
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spatial_ref_sys is publicly readable"
  ON public.spatial_ref_sys
  FOR SELECT
  USING (true);
