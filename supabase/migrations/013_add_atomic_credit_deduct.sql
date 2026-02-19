-- Migration 013: Add atomic credit deduction RPC function
-- Prevents race conditions when two operations deduct credits simultaneously.
-- Uses a single transaction that checks balance and deducts atomically.

CREATE OR REPLACE FUNCTION public.deduct_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the credits row for this user to prevent concurrent deductions
  SELECT balance INTO v_current_balance
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Credits account not found');
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'balance', v_current_balance,
      'required', p_amount
    );
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Deduct credits
  UPDATE public.credits
  SET
    balance = v_new_balance,
    total_used = total_used + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    reference_id,
    created_at
  ) VALUES (
    p_user_id,
    -p_amount,
    p_type,
    p_description,
    p_reference_id,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'deducted', p_amount
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_credits_atomic TO authenticated;

COMMENT ON FUNCTION public.deduct_credits_atomic IS
  'Atomically checks and deducts credits from a user account. '
  'Returns success/failure with current balance. '
  'Uses row-level locking to prevent race conditions.';
