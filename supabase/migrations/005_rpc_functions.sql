-- RPC Functions for Credit Management
-- These functions handle credit operations securely on the database side

-- Drop ALL overloads first (avoids ambiguity errors when multiple versions exist)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'add_credits',
        'deduct_credits',
        'get_credit_balance',
        'has_sufficient_credits',
        'get_credit_history'
      )
  ) LOOP
    EXECUTE format(
      'DROP FUNCTION IF EXISTS %I.%I(%s);',
      r.schema_name,
      r.function_name,
      r.args
    );
  END LOOP;
END $$;

-- Function to add credits to a user's balance
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Validate type
  IF p_type NOT IN ('PURCHASE', 'SUBSCRIPTION_GRANT', 'BONUS', 'REFUND') THEN
    RAISE EXCEPTION 'Invalid credit type for adding credits';
  END IF;

  -- Update user's credit balance
  UPDATE users
  SET credits = COALESCE(credits, 0) + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- If user doesn't exist, raise error
  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Record the transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    paystack_reference,
    balance_after
  ) VALUES (
    p_user_id,
    p_amount,
    p_type,
    p_description,
    p_reference_id,
    v_new_balance
  );

  RETURN v_new_balance;
END;
$$;

-- Function to deduct credits from a user's balance
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Validate type
  IF p_type NOT IN ('VERIFICATION', 'MINT') THEN
    RAISE EXCEPTION 'Invalid credit type for deducting credits';
  END IF;

  -- Get current balance
  SELECT credits INTO v_current_balance
  FROM users
  WHERE id = p_user_id;

  -- Check if user exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', v_current_balance, p_amount;
  END IF;

  -- Deduct credits
  UPDATE users
  SET credits = credits - p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Record the transaction (negative amount for deduction)
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    paystack_reference,
    balance_after
  ) VALUES (
    p_user_id,
    -p_amount,
    p_type,
    p_description,
    p_reference_id,
    v_new_balance
  );

  RETURN v_new_balance;
END;
$$;

-- Function to get user's credit balance
CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT COALESCE(credits, 0) INTO v_balance
  FROM users
  WHERE id = p_user_id;

  IF v_balance IS NULL THEN
    RETURN 0;
  END IF;

  RETURN v_balance;
END;
$$;

-- Function to check if user has sufficient credits
CREATE OR REPLACE FUNCTION has_sufficient_credits(
  p_user_id UUID,
  p_required_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT COALESCE(credits, 0) INTO v_balance
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_balance, 0) >= p_required_amount;
END;
$$;

-- Function to get credit transaction history
CREATE OR REPLACE FUNCTION get_credit_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  amount INTEGER,
  type TEXT,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.amount,
    ct.type,
    ct.description,
    ct.balance_after,
    ct.created_at
  FROM credit_transactions ct
  WHERE ct.user_id = p_user_id
  ORDER BY ct.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_credit_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_sufficient_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_credit_history(UUID, INTEGER, INTEGER) TO authenticated;

-- Add credits column to users table if not exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'credits'
  ) THEN
    ALTER TABLE public.users ADD COLUMN credits INTEGER DEFAULT 5;
  END IF;
END $$;

-- Add balance_after column to credit_transactions if not exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'credit_transactions'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'credit_transactions'
    AND column_name = 'balance_after'
  ) THEN
    ALTER TABLE public.credit_transactions ADD COLUMN balance_after INTEGER;
  END IF;
END $$;
