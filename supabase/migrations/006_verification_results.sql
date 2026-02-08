-- Verification Results Table
-- Stores detailed results from AI verification pipeline

CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES land_claims(id) ON DELETE CASCADE,
  overall_confidence DECIMAL(5,2) NOT NULL,
  confidence_level VARCHAR(20) NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
  recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('AUTO_APPROVE', 'HUMAN_REVIEW', 'REJECT')),
  document_analysis_score DECIMAL(5,2),
  gps_validation_score DECIMAL(5,2),
  cross_reference_score DECIMAL(5,2),
  fraud_indicators JSONB DEFAULT '[]'::jsonb,
  verification_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by claim
CREATE INDEX IF NOT EXISTS idx_verification_results_claim_id ON verification_results(claim_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_created_at ON verification_results(created_at DESC);

-- Enable RLS
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view verification results for their own claims
CREATE POLICY "Users can view own verification results"
  ON verification_results
  FOR SELECT
  USING (
    claim_id IN (
      SELECT id FROM land_claims WHERE claimant_id = auth.uid()
    )
  );

-- Policy: Admins and verifiers can view all verification results
CREATE POLICY "Admins can view all verification results"
  ON verification_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'VERIFIER')
    )
  );

-- Policy: System can insert verification results
CREATE POLICY "System can insert verification results"
  ON verification_results
  FOR INSERT
  WITH CHECK (true);

-- Add verification_result column to land_claims if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'land_claims' AND column_name = 'verification_result'
  ) THEN
    ALTER TABLE land_claims ADD COLUMN verification_result JSONB;
  END IF;
END $$;

-- Add verified_at column to land_claims if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'land_claims' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE land_claims ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create users table if not exists (for credit management)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'USER',
  credits INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Trigger to create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    5 -- Default 5 free credits
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update users updated_at on change
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();
