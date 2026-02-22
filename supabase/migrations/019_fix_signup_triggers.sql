-- Migration 019: Fix "Database error saving new user" on sign-up
--
-- Root cause: migration 011 has not been applied, so the old
-- trigger_grant_initial_credits (003) and on_auth_user_created (006)
-- are still active. grant_initial_credits() has no ON CONFLICT handler
-- on the credits INSERT, causing a unique-constraint violation on
-- repeat attempts → Supabase Auth returns "Database error saving new user".
--
-- Fix: drop ALL existing auth.users triggers and replace with two
-- hardened SECURITY DEFINER functions that use ON CONFLICT DO NOTHING
-- and EXCEPTION blocks so they can never surface a DB error to Auth.

-- ── 1. Ensure verification_results has all needed columns ────────────────────
-- (migration 011 section 10 was never applied)
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS fraud_detection_score DECIMAL(5,4);
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS tampering_check_score DECIMAL(5,4);
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS ai_powered BOOLEAN DEFAULT FALSE;
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS reasoning TEXT[];

-- ── 2. Ensure credit_transactions allows VERIFICATION type ──────────────────
DO $$
BEGIN
  ALTER TABLE credit_transactions
    DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
  ALTER TABLE credit_transactions
    ADD CONSTRAINT credit_transactions_type_check
    CHECK (type IN ('PURCHASE', 'MINT', 'VERIFICATION', 'REFUND', 'BONUS', 'SUBSCRIPTION_GRANT'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── 3. Add paystack_reference / reference_id if missing ─────────────────────
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- ── 4. Drop ALL existing triggers on auth.users ──────────────────────────────
DROP TRIGGER IF EXISTS trigger_grant_initial_credits       ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created                ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_profile_created        ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_credits_created        ON auth.users;

-- ── 5. Create hardened profile trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, country_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'CLAIMANT',
    'GH'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never surface a DB error to Supabase Auth
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- ── 6. Create hardened credits trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION ensure_credits_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credits (user_id, balance, total_purchased, total_used)
  VALUES (NEW.id, 5, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Only insert welcome transaction if credits row was actually new
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_transactions
    WHERE user_id = NEW.id AND type = 'BONUS'
    LIMIT 1
  ) THEN
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 5, 'BONUS', 'Welcome bonus — 5 free credits');
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never surface a DB error to Supabase Auth
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_credits_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_credits_on_signup();

-- ── 7. Ensure INSERT policy on user_profiles exists ─────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.user_profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ── 8. Grant execute permissions ─────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.handle_new_user_profile() TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_credits_on_signup()  TO service_role;
