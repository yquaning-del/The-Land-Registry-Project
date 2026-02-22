-- Migration 018: Fix platform_settings RLS infinite recursion
--
-- The policies in 007_platform_owner.sql query user_profiles from within
-- user_profiles policies, creating infinite recursion (same bug as fixed in
-- 014_fix_user_profiles_rls_recursion.sql).
--
-- Fix: replace self-referencing subqueries with the is_platform_owner()
-- SECURITY DEFINER function created in migration 014.

-- Drop the recursive policies
DROP POLICY IF EXISTS "Platform owners can view settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform owners can modify settings" ON public.platform_settings;

-- Recreate using the SECURITY DEFINER helper (no recursion)
CREATE POLICY "Platform owners can view settings"
  ON public.platform_settings FOR SELECT
  USING (
    is_platform_owner()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Platform owners can modify settings"
  ON public.platform_settings FOR ALL
  USING (is_platform_owner());

-- Also fix the additional user_profiles policies added by migration 007 that
-- may still be recursive (if they survived migration 014).
DROP POLICY IF EXISTS "Platform owners can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Platform owners can update all profiles" ON public.user_profiles;

-- Recreate them safely using is_platform_owner()
CREATE POLICY "Platform owners can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (is_platform_owner() OR id = auth.uid());

CREATE POLICY "Platform owners can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (is_platform_owner());
