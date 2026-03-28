-- Migration 024: Enable RLS on PostGIS spatial_ref_sys
--
-- IMPORTANT: This migration CANNOT be applied via `supabase db push` or the
-- SQL Editor because spatial_ref_sys is owned by supabase_admin, and the
-- postgres role cannot enable RLS on tables it does not own.
--
-- Apply this manually through the Supabase Dashboard instead:
--
--   1. Go to Table Editor → spatial_ref_sys
--   2. Click "RLS disabled" toggle to enable RLS
--   3. Add a new SELECT policy:
--        Name:  spatial_ref_sys is publicly readable
--        Check: true  (allows all reads — this is non-sensitive EPSG data)
--
-- The statements below are kept for documentation and for environments where
-- the executing role has sufficient privileges (e.g. self-hosted Supabase).

ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'spatial_ref_sys'
      AND policyname = 'spatial_ref_sys is publicly readable'
  ) THEN
    CREATE POLICY "spatial_ref_sys is publicly readable"
      ON public.spatial_ref_sys
      FOR SELECT
      USING (true);
  END IF;
END
$$;
