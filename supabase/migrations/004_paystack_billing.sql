-- Paystack Billing Migration
-- Updates billing system to use Paystack instead of Stripe

-- Update subscriptions table to support Paystack
ALTER TABLE subscriptions 
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;

-- Update plan types for new pricing tiers
ALTER TABLE subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_type_check 
  CHECK (plan_type IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE'));

-- Update credit transaction types to include VERIFICATION
ALTER TABLE credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('PURCHASE', 'MINT', 'VERIFICATION', 'REFUND', 'BONUS', 'SUBSCRIPTION_GRANT'));

-- Remove Stripe-specific columns from credit_transactions
ALTER TABLE credit_transactions
  DROP COLUMN IF EXISTS stripe_payment_intent_id,
  ADD COLUMN IF NOT EXISTS paystack_reference TEXT;

-- Update indexes
DROP INDEX IF EXISTS idx_subscriptions_stripe_customer_id;
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_customer ON subscriptions(paystack_customer_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_subscription ON subscriptions(paystack_subscription_code);

-- Function to deduct credits with specific cost (verification = 1, mint = 5)
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
  -- Get current balance
  SELECT balance INTO current_balance
  FROM credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE credits
  SET balance = balance - p_amount,
      total_used = total_used + p_amount
  WHERE user_id = p_user_id;

  -- Create transaction record (negative amount for deduction)
  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, -p_amount, p_type, p_description, p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON COLUMN subscriptions.paystack_customer_code IS 'Paystack customer code for recurring billing';
COMMENT ON COLUMN subscriptions.paystack_subscription_code IS 'Paystack subscription code';
COMMENT ON COLUMN credit_transactions.paystack_reference IS 'Paystack transaction reference';
COMMENT ON FUNCTION deduct_credits_with_cost IS 'Deduct credits with specific cost (verification=1, mint=5)';
