-- Migration 020: Fix verification_results INSERT policy
--
-- Root cause: Migration 006 created an overly-permissive INSERT policy:
--   WITH CHECK (true)
-- This allows ANY authenticated user to insert arbitrary verification_results
-- records, enabling a bad actor to forge a verified result for a claim they
-- do not own.
--
-- Fix: Replace with an auth.uid() IS NOT NULL check so only authenticated
-- sessions (the AI pipeline running as the claimant, or the service_role
-- admin client) can insert. The service_role key bypasses RLS entirely, so
-- legitimate server-side inserts are unaffected.

-- Drop the permissive policy from migration 006
DROP POLICY IF EXISTS "System can insert verification_results" ON public.verification_results;

-- Only authenticated sessions may insert (service_role bypasses RLS automatically)
CREATE POLICY "Authenticated users can insert verification results"
  ON public.verification_results
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
