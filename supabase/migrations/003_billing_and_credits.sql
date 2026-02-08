-- Billing and Credits System Migration
-- This migration adds support for Stripe subscriptions and credits system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('BASIC', 'PRO')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Credits table
CREATE TABLE IF NOT EXISTS credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PURCHASE', 'MINT', 'REFUND', 'BONUS', 'SUBSCRIPTION_GRANT')),
  description TEXT,
  reference_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription updates
DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Function to update credits last_updated timestamp
CREATE OR REPLACE FUNCTION update_credits_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for credits updates
DROP TRIGGER IF EXISTS trigger_update_credits_last_updated ON credits;
CREATE TRIGGER trigger_update_credits_last_updated
  BEFORE UPDATE ON credits
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_last_updated();

-- Function to add credits and create transaction
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
$$ LANGUAGE plpgsql;

-- Function to deduct credits and create transaction
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
  VALUES (p_user_id, -p_amount, 'MINT', p_description, p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user credit balance
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
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Credits policies
CREATE POLICY "Users can view their own credits"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant initial credits to new users (5 free credits)
CREATE OR REPLACE FUNCTION grant_initial_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credits (user_id, balance)
  VALUES (NEW.id, 5);
  
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 5, 'BONUS', 'Welcome bonus - 5 free credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to grant initial credits on user signup
DROP TRIGGER IF EXISTS trigger_grant_initial_credits ON auth.users;
CREATE TRIGGER trigger_grant_initial_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION grant_initial_credits();

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription information for users';
COMMENT ON TABLE credits IS 'Stores credit balance for each user';
COMMENT ON TABLE credit_transactions IS 'Audit log of all credit transactions';
COMMENT ON FUNCTION add_credits IS 'Add credits to user account and create transaction record';
COMMENT ON FUNCTION deduct_credits IS 'Deduct credits from user account if sufficient balance exists';
COMMENT ON FUNCTION get_credit_balance IS 'Get current credit balance for a user';
