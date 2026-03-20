-- Migration 023: Fix Supabase Security Advisor warnings
--
-- 1. Set search_path = public on all functions that have a mutable search_path.
--    Without this, a malicious user could manipulate the search_path to redirect
--    function calls to shadow objects in other schemas.
--
-- 2. Tighten the security_alerts INSERT policy (was WITH CHECK (true)).
--    Matches the same fix already applied to verification_logs (012) and
--    verification_results (020).

-- ─── Trigger / utility functions (no arguments) ──────────────────────────────

ALTER FUNCTION public.update_updated_at_column()             SET search_path = public;
ALTER FUNCTION public.update_subscription_updated_at()       SET search_path = public;
ALTER FUNCTION public.update_users_updated_at()              SET search_path = public;
ALTER FUNCTION public.update_credits_last_updated()          SET search_path = public;
ALTER FUNCTION public.update_security_alerts_updated_at()    SET search_path = public;
ALTER FUNCTION public.update_grantor_stats()                 SET search_path = public;
ALTER FUNCTION public.handle_new_user()                      SET search_path = public;
ALTER FUNCTION public.handle_new_user_profile()              SET search_path = public;
ALTER FUNCTION public.grant_initial_credits()                SET search_path = public;
ALTER FUNCTION public.ensure_credits_on_signup()             SET search_path = public;

-- ─── Functions with arguments ─────────────────────────────────────────────────

ALTER FUNCTION public.calculate_land_area_from_polygon(geometry)              SET search_path = public;
ALTER FUNCTION public.validate_ghana_parcel_barcode(text)                     SET search_path = public;
ALTER FUNCTION public.check_polygon_overlap(uuid, geometry)                   SET search_path = public;
ALTER FUNCTION public.check_grantor_history(text)                             SET search_path = public;
ALTER FUNCTION public.update_grantor_stats()                                  SET search_path = public;
ALTER FUNCTION public.get_verification_progress(uuid)                         SET search_path = public;
ALTER FUNCTION public.is_platform_owner(uuid)                                 SET search_path = public;
ALTER FUNCTION public.set_platform_owner(text)                                SET search_path = public;
ALTER FUNCTION public.get_claim_with_confidence(uuid)                         SET search_path = public;
ALTER FUNCTION public.get_credit_balance(uuid)                                SET search_path = public;
ALTER FUNCTION public.get_unread_alert_count(uuid)                            SET search_path = public;
ALTER FUNCTION public.get_critical_alerts(uuid)                               SET search_path = public;
ALTER FUNCTION public.add_credits(uuid, integer, text, text, text)            SET search_path = public;
ALTER FUNCTION public.deduct_credits(uuid, integer, text, text)               SET search_path = public;
ALTER FUNCTION public.deduct_credits_with_cost(uuid, integer, text, text, text) SET search_path = public;

-- ─── Fix overly permissive INSERT policy on security_alerts ──────────────────
-- The original "Service can insert alerts" policy used WITH CHECK (true),
-- allowing any role to insert alerts for any user. Restrict it to authenticated
-- sessions only (same pattern applied to verification_logs in 012 and
-- verification_results in 020).

DROP POLICY IF EXISTS "Service can insert alerts" ON public.security_alerts;

CREATE POLICY "Authenticated users can insert alerts"
  ON public.security_alerts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
