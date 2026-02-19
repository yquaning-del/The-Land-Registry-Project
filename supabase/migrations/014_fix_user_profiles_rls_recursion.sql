-- Migration 014: Fix infinite recursion in user_profiles RLS policies
--
-- Root cause: 007_platform_owner.sql created two policies on user_profiles
-- that contain:
--   EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = ...)
--
-- PostgreSQL evaluates ALL applicable policies on a table for every query.
-- So any SELECT on user_profiles triggers "Platform owners can view all profiles",
-- which runs another SELECT on user_profiles, which triggers the same policy → ∞.
--
-- Fix: replace the self-referencing EXISTS with is_platform_owner(), which is
-- already defined as SECURITY DEFINER in 007_platform_owner.sql and therefore
-- executes with elevated privileges that bypass RLS on user_profiles.

-- Drop the recursive policies
DROP POLICY IF EXISTS "Platform owners can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Platform owners can update all profiles" ON public.user_profiles;

-- Recreate using the SECURITY DEFINER helper — no recursion possible
CREATE POLICY "Platform owners can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (is_platform_owner());

CREATE POLICY "Platform owners can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (is_platform_owner());
