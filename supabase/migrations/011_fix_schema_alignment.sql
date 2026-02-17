-- Migration 011: Fix schema alignment issues
-- Resolves conflicts between credits table, users table, user_profiles table,
-- and RPC functions to ensure consistent behavior across the platform.

-- ============================================================
-- 1. Ensure user_profiles is auto-created on auth signup
-- ============================================================
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_profile_created ON auth.users;
CREATE TRIGGER on_auth_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();

-- ============================================================
-- 2. Ensure credits row is auto-created on auth signup
--    (grant_initial_credits from migration 003 may conflict)
-- ============================================================
CREATE OR REPLACE FUNCTION ensure_credits_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credits (user_id, balance, total_purchased, total_used)
  VALUES (NEW.id, 5, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 5, 'BONUS', 'Welcome bonus - 5 free credits');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old conflicting triggers
DROP TRIGGER IF EXISTS trigger_grant_initial_credits ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create single unified trigger
CREATE TRIGGER on_auth_user_credits_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_credits_on_signup();

-- ============================================================
-- 3. Fix add_credits RPC to use credits table (not users table)
-- ============================================================
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update credits balance
  INSERT INTO credits (user_id, balance, total_purchased)
  VALUES (p_user_id, p_amount, CASE WHEN p_type = 'PURCHASE' THEN p_amount ELSE 0 END)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = credits.balance + p_amount,
    total_purchased = credits.total_purchased + CASE WHEN p_type = 'PURCHASE' THEN p_amount ELSE 0 END;

  -- Create transaction record
  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. Fix deduct_credits RPC to use credits table
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance
  FROM credits
  WHERE user_id = p_user_id;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE credits
  SET balance = balance - p_amount,
      total_used = total_used + p_amount
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, -p_amount, 'VERIFICATION', p_description, p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. Fix deduct_credits_with_cost RPC to use credits table
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_credits_with_cost(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance
  FROM credits
  WHERE user_id = p_user_id;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE credits
  SET balance = balance - p_amount,
      total_used = total_used + p_amount
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, -p_amount, p_type, p_description, p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. Fix get_credit_balance RPC to use credits table
-- ============================================================
CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_balance INTEGER;
BEGIN
  SELECT balance INTO user_balance
  FROM credits
  WHERE user_id = p_user_id;

  RETURN COALESCE(user_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. Add RLS policy so users can UPDATE their own claims
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'land_claims'
    AND policyname = 'Users can update their own claims'
  ) THEN
    CREATE POLICY "Users can update their own claims"
      ON public.land_claims FOR UPDATE
      USING (auth.uid() = claimant_id);
  END IF;
END $$;

-- ============================================================
-- 8. Add RLS policy so users can INSERT their own user_profiles
-- ============================================================
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

-- ============================================================
-- 9. Grant execute on RPC functions to authenticated
-- ============================================================
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits(UUID, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits_with_cost(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_credit_balance(UUID) TO authenticated;

-- ============================================================
-- 10. Add missing columns to verification_results if needed
-- ============================================================
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS fraud_detection_score DECIMAL(5,4);
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS tampering_check_score DECIMAL(5,4);
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS ai_powered BOOLEAN DEFAULT FALSE;
ALTER TABLE verification_results ADD COLUMN IF NOT EXISTS reasoning TEXT[];

-- ============================================================
-- 11. Add VERIFICATION type to credit_transactions if missing
-- ============================================================
DO $$
BEGIN
  ALTER TABLE credit_transactions
    DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
  ALTER TABLE credit_transactions
    ADD CONSTRAINT credit_transactions_type_check
    CHECK (type IN ('PURCHASE', 'MINT', 'VERIFICATION', 'REFUND', 'BONUS', 'SUBSCRIPTION_GRANT'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 12. Add paystack_reference column if missing
-- ============================================================
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS reference_id TEXT;
