-- Migration: Spatial Conflict Detection and Tracking
-- Date: 2026-02-04
-- Description: Adds tables for tracking spatial conflicts, grantor dispute history, and verification progress

-- Create enum for spatial conflict status
CREATE TYPE spatial_conflict_status AS ENUM (
  'PENDING_REVIEW',
  'UNDER_INVESTIGATION',
  'RESOLVED_VALID',
  'RESOLVED_INVALID',
  'DISPUTED'
);

-- Create enum for grantor risk level
CREATE TYPE grantor_risk_level AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'BLACKLISTED'
);

-- Create spatial_conflicts table to log detected overlaps
CREATE TABLE IF NOT EXISTS public.spatial_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  conflicting_claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  overlap_area_sqm DECIMAL(12, 2) NOT NULL DEFAULT 0,
  overlap_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  status spatial_conflict_status NOT NULL DEFAULT 'PENDING_REVIEW',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.verified_users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate conflict records
  CONSTRAINT unique_conflict_pair UNIQUE (claim_id, conflicting_claim_id)
);

-- Create grantor_dispute_history table for Red Flag seller tracking
CREATE TABLE IF NOT EXISTS public.grantor_dispute_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grantor_name TEXT NOT NULL,
  grantor_name_normalized TEXT NOT NULL, -- Lowercase, trimmed for matching
  grantor_type grantor_type,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  successful_transactions INTEGER NOT NULL DEFAULT 0,
  dispute_count INTEGER NOT NULL DEFAULT 0,
  rejection_count INTEGER NOT NULL DEFAULT 0,
  risk_score DECIMAL(5, 4) NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 1),
  risk_level grantor_risk_level NOT NULL DEFAULT 'LOW',
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason TEXT,
  blacklisted_at TIMESTAMPTZ,
  blacklisted_by UUID REFERENCES public.verified_users(id),
  last_activity_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on normalized name
  CONSTRAINT unique_grantor_normalized UNIQUE (grantor_name_normalized)
);

-- Add spatial conflict status to land_claims
ALTER TABLE public.land_claims
  ADD COLUMN IF NOT EXISTS spatial_conflict_status TEXT DEFAULT 'CLEAR',
  ADD COLUMN IF NOT EXISTS spatial_check_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS satellite_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_step INTEGER DEFAULT 1 CHECK (verification_step >= 1 AND verification_step <= 4);

-- Create indexes for spatial_conflicts
CREATE INDEX IF NOT EXISTS idx_spatial_conflicts_claim ON public.spatial_conflicts(claim_id);
CREATE INDEX IF NOT EXISTS idx_spatial_conflicts_conflicting ON public.spatial_conflicts(conflicting_claim_id);
CREATE INDEX IF NOT EXISTS idx_spatial_conflicts_status ON public.spatial_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_spatial_conflicts_detected ON public.spatial_conflicts(detected_at DESC);

-- Create indexes for grantor_dispute_history
CREATE INDEX IF NOT EXISTS idx_grantor_history_name ON public.grantor_dispute_history(grantor_name_normalized);
CREATE INDEX IF NOT EXISTS idx_grantor_history_risk ON public.grantor_dispute_history(risk_level);
CREATE INDEX IF NOT EXISTS idx_grantor_history_blacklist ON public.grantor_dispute_history(is_blacklisted) WHERE is_blacklisted = true;

-- Create indexes for new land_claims columns
CREATE INDEX IF NOT EXISTS idx_land_claims_spatial_status ON public.land_claims(spatial_conflict_status);
CREATE INDEX IF NOT EXISTS idx_land_claims_verification_step ON public.land_claims(verification_step);

-- Update triggers
CREATE TRIGGER update_spatial_conflicts_updated_at
  BEFORE UPDATE ON public.spatial_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grantor_history_updated_at
  BEFORE UPDATE ON public.grantor_dispute_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.spatial_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grantor_dispute_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spatial_conflicts
CREATE POLICY "Users can view conflicts for their claims"
  ON public.spatial_conflicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.land_claims
      WHERE id = claim_id AND claimant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Verifiers can manage conflicts"
  ON public.spatial_conflicts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for grantor_dispute_history
CREATE POLICY "Verifiers can view grantor history"
  ON public.grantor_dispute_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Admins can manage grantor history"
  ON public.grantor_dispute_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Function to check grantor history and calculate risk
CREATE OR REPLACE FUNCTION check_grantor_history(p_grantor_name TEXT)
RETURNS TABLE (
  grantor_name TEXT,
  total_transactions INTEGER,
  dispute_count INTEGER,
  rejection_count INTEGER,
  risk_score DECIMAL,
  risk_level grantor_risk_level,
  is_blacklisted BOOLEAN
) AS $$
DECLARE
  v_normalized_name TEXT;
BEGIN
  v_normalized_name := LOWER(TRIM(p_grantor_name));
  
  RETURN QUERY
  SELECT 
    gdh.grantor_name,
    gdh.total_transactions,
    gdh.dispute_count,
    gdh.rejection_count,
    gdh.risk_score,
    gdh.risk_level,
    gdh.is_blacklisted
  FROM public.grantor_dispute_history gdh
  WHERE gdh.grantor_name_normalized = v_normalized_name
     OR gdh.grantor_name_normalized LIKE '%' || v_normalized_name || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update grantor statistics after claim status change
CREATE OR REPLACE FUNCTION update_grantor_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_grantor_name TEXT;
  v_normalized_name TEXT;
  v_total INTEGER;
  v_disputes INTEGER;
  v_rejections INTEGER;
  v_successful INTEGER;
  v_risk_score DECIMAL;
  v_risk_level grantor_risk_level;
BEGIN
  -- Get grantor name from claim
  v_grantor_name := COALESCE(NEW.traditional_authority_name, NEW.family_head_name);
  
  IF v_grantor_name IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_normalized_name := LOWER(TRIM(v_grantor_name));
  
  -- Count transactions for this grantor
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE ai_verification_status = 'DISPUTED'),
    COUNT(*) FILTER (WHERE ai_verification_status = 'REJECTED'),
    COUNT(*) FILTER (WHERE ai_verification_status IN ('AI_VERIFIED', 'APPROVED'))
  INTO v_total, v_disputes, v_rejections, v_successful
  FROM public.land_claims
  WHERE LOWER(TRIM(COALESCE(traditional_authority_name, family_head_name))) = v_normalized_name;
  
  -- Calculate risk score
  IF v_total > 0 THEN
    v_risk_score := (v_disputes + v_rejections)::DECIMAL / v_total;
  ELSE
    v_risk_score := 0;
  END IF;
  
  -- Determine risk level
  IF v_risk_score >= 0.4 THEN
    v_risk_level := 'HIGH';
  ELSIF v_risk_score >= 0.2 THEN
    v_risk_level := 'MEDIUM';
  ELSE
    v_risk_level := 'LOW';
  END IF;
  
  -- Upsert grantor history
  INSERT INTO public.grantor_dispute_history (
    grantor_name,
    grantor_name_normalized,
    total_transactions,
    successful_transactions,
    dispute_count,
    rejection_count,
    risk_score,
    risk_level,
    last_activity_at
  ) VALUES (
    v_grantor_name,
    v_normalized_name,
    v_total,
    v_successful,
    v_disputes,
    v_rejections,
    v_risk_score,
    v_risk_level,
    NOW()
  )
  ON CONFLICT (grantor_name_normalized) DO UPDATE SET
    total_transactions = EXCLUDED.total_transactions,
    successful_transactions = EXCLUDED.successful_transactions,
    dispute_count = EXCLUDED.dispute_count,
    rejection_count = EXCLUDED.rejection_count,
    risk_score = EXCLUDED.risk_score,
    risk_level = EXCLUDED.risk_level,
    last_activity_at = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update grantor stats when claim status changes
CREATE TRIGGER trigger_update_grantor_stats
  AFTER INSERT OR UPDATE OF ai_verification_status ON public.land_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_grantor_stats();

-- Function to get verification progress for a claim
CREATE OR REPLACE FUNCTION get_verification_progress(p_claim_id UUID)
RETURNS TABLE (
  verification_step INTEGER,
  indenture_verified BOOLEAN,
  satellite_confirmed BOOLEAN,
  blockchain_anchored BOOLEAN,
  government_title_pending BOOLEAN,
  overall_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(lc.verification_step, 1),
    lc.ai_verification_status IN ('AI_VERIFIED', 'APPROVED', 'PENDING_HUMAN_REVIEW'),
    lc.satellite_verification_score IS NOT NULL AND lc.satellite_verification_score >= 0.7,
    lc.mint_status = 'MINTED' AND lc.blockchain_tx_hash IS NOT NULL,
    lc.mint_status = 'MINTED',
    CASE 
      WHEN lc.ai_verification_status IN ('DISPUTED', 'REJECTED') THEN 'DISPUTED'
      WHEN lc.mint_status = 'MINTED' THEN 'COMPLETED'
      ELSE 'IN_PROGRESS'
    END
  FROM public.land_claims lc
  WHERE lc.id = p_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_grantor_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_progress TO authenticated;

-- Add comments
COMMENT ON TABLE public.spatial_conflicts IS 'Tracks detected spatial overlaps between land claims for fraud prevention';
COMMENT ON TABLE public.grantor_dispute_history IS 'Tracks grantor transaction history for Red Flag seller detection';
COMMENT ON COLUMN public.land_claims.spatial_conflict_status IS 'Status of spatial conflict check: CLEAR, POTENTIAL_DISPUTE, HIGH_RISK';
COMMENT ON COLUMN public.land_claims.verification_step IS 'Current verification step: 1=Indenture, 2=Satellite, 3=Blockchain, 4=Government';
