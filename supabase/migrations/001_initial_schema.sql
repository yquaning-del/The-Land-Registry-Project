-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE claim_status AS ENUM (
  'PENDING_VERIFICATION',
  'AI_VERIFIED',
  'PENDING_HUMAN_REVIEW',
  'APPROVED',
  'REJECTED',
  'DISPUTED'
);

CREATE TYPE verification_confidence AS ENUM (
  'HIGH',
  'MEDIUM',
  'LOW'
);

CREATE TYPE user_role AS ENUM (
  'CLAIMANT',
  'VERIFIER',
  'ADMIN',
  'SUPER_ADMIN'
);

-- Create users extension table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CLAIMANT',
  full_name TEXT NOT NULL,
  phone_number TEXT,
  country_code TEXT DEFAULT 'GH',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create land_claims table
CREATE TABLE public.land_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claimant_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Document Information
  original_document_url TEXT NOT NULL,
  document_type TEXT,
  document_metadata JSONB,
  
  -- Location Information
  gps_coordinates POINT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  land_size_sqm DECIMAL(12, 2),
  address TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'Ghana',
  
  -- AI Verification
  ai_verification_status claim_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  ai_confidence_score DECIMAL(3, 2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  ai_confidence_level verification_confidence,
  ai_verification_metadata JSONB,
  ai_verified_at TIMESTAMPTZ,
  
  -- Human Review
  human_approver_id UUID REFERENCES public.user_profiles(id),
  human_review_notes TEXT,
  human_reviewed_at TIMESTAMPTZ,
  
  -- Satellite Data
  satellite_image_url TEXT,
  satellite_verification_score DECIMAL(3, 2),
  satellite_metadata JSONB,
  
  -- Blockchain
  blockchain_tx_hash TEXT,
  nft_token_id TEXT,
  minted_at TIMESTAMPTZ,
  
  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create verification_logs table for audit trail
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_version TEXT,
  input_data JSONB,
  output_data JSONB,
  confidence_score DECIMAL(3, 2) NOT NULL,
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE public.claim_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  disputed_by UUID NOT NULL REFERENCES public.user_profiles(id),
  dispute_reason TEXT NOT NULL,
  supporting_documents JSONB,
  status TEXT NOT NULL DEFAULT 'OPEN',
  resolved_by UUID REFERENCES public.user_profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_land_claims_claimant ON public.land_claims(claimant_id);
CREATE INDEX idx_land_claims_status ON public.land_claims(ai_verification_status);
CREATE INDEX idx_land_claims_approver ON public.land_claims(human_approver_id);
CREATE INDEX idx_land_claims_location ON public.land_claims USING GIST(gps_coordinates);
CREATE INDEX idx_land_claims_created ON public.land_claims(created_at DESC);
CREATE INDEX idx_verification_logs_claim ON public.verification_logs(claim_id);
CREATE INDEX idx_disputes_claim ON public.claim_disputes(claim_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_land_claims_updated_at
  BEFORE UPDATE ON public.land_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for land_claims
CREATE POLICY "Users can view their own claims"
  ON public.land_claims FOR SELECT
  USING (auth.uid() = claimant_id);

CREATE POLICY "Verifiers and admins can view all claims"
  ON public.land_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Users can insert their own claims"
  ON public.land_claims FOR INSERT
  WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Verifiers can update claims for review"
  ON public.land_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for verification_logs
CREATE POLICY "Verifiers and admins can view logs"
  ON public.verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "System can insert logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for claim_disputes
CREATE POLICY "Users can view disputes for their claims"
  ON public.claim_disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.land_claims
      WHERE id = claim_id
      AND claimant_id = auth.uid()
    )
    OR auth.uid() = disputed_by
  );

CREATE POLICY "Users can create disputes"
  ON public.claim_disputes FOR INSERT
  WITH CHECK (auth.uid() = disputed_by);

-- Create helper functions
CREATE OR REPLACE FUNCTION get_claim_with_confidence(claim_uuid UUID)
RETURNS TABLE (
  claim_id UUID,
  status claim_status,
  confidence_score DECIMAL,
  confidence_level verification_confidence
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    ai_verification_status,
    ai_confidence_score,
    ai_confidence_level
  FROM public.land_claims
  WHERE id = claim_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
