-- Migration 012: Tighten RLS on verification_logs
-- Previously: WITH CHECK (true) allowed ANY request to insert logs
-- Now: only authenticated users can insert; only admins/verifiers can read all logs

-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert logs" ON public.verification_logs;

-- Replace with policy that requires an authenticated user session
CREATE POLICY "Authenticated users can insert logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only view logs related to their own claims
DROP POLICY IF EXISTS "Users can view their logs" ON public.verification_logs;
CREATE POLICY "Users can view their own claim logs"
  ON public.verification_logs FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- User can see logs for claims they own
      EXISTS (
        SELECT 1 FROM public.land_claims
        WHERE land_claims.id = verification_logs.claim_id
          AND land_claims.claimant_id = auth.uid()
      )
      OR
      -- Admins/verifiers can see all logs
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER', 'VERIFIER')
      )
    )
  );
