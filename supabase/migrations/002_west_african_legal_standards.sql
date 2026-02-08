-- Migration: West African Legal Standards for Ghana and Nigeria
-- Date: 2026-02-01
-- Description: Adds fields compliant with Ghana Land Act 2020 and Nigerian land registration requirements

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create new enum types for West African legal standards
CREATE TYPE title_type AS ENUM (
  'CERTIFICATE_OF_OCCUPANCY',
  'GOVERNOR_CONSENT',
  'DEED_OF_ASSIGNMENT',
  'STOOL_INDENTURE',
  'FAMILY_INDENTURE',
  'FREEHOLD',
  'CUSTOMARY_FREEHOLD',
  'LEASEHOLD'
);

CREATE TYPE grantor_type AS ENUM (
  'INDIVIDUAL',
  'STOOL',
  'FAMILY',
  'STATE',
  'CORPORATE',
  'TRADITIONAL_AUTHORITY'
);

CREATE TYPE mint_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'MINTED',
  'FAILED'
);

-- Create verified_users table for human-in-the-loop audit trail
CREATE TABLE IF NOT EXISTS public.verified_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  role user_role NOT NULL,
  verification_level TEXT DEFAULT 'BASIC',
  professional_license_number TEXT,
  organization TEXT,
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.verified_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add new columns to land_claims table for West African legal standards
ALTER TABLE public.land_claims
  -- Title Metadata
  ADD COLUMN IF NOT EXISTS title_type title_type,
  ADD COLUMN IF NOT EXISTS duration_years INTEGER DEFAULT 99,
  ADD COLUMN IF NOT EXISTS document_serial_number TEXT,
  ADD COLUMN IF NOT EXISTS parcel_id_barcode TEXT,
  
  -- Stakeholder Verification
  ADD COLUMN IF NOT EXISTS grantor_type grantor_type,
  ADD COLUMN IF NOT EXISTS witness_signatures_json JSONB,
  ADD COLUMN IF NOT EXISTS legal_jurat_flag BOOLEAN DEFAULT false,
  
  -- Spatial & Fraud Intelligence
  ADD COLUMN IF NOT EXISTS survey_plan_url TEXT,
  ADD COLUMN IF NOT EXISTS polygon_coordinates GEOMETRY(POLYGON, 4326),
  ADD COLUMN IF NOT EXISTS is_litigation_flag BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fraud_confidence_score DECIMAL(5, 4) CHECK (fraud_confidence_score >= 0 AND fraud_confidence_score <= 1),
  
  -- Blockchain Integrity
  ADD COLUMN IF NOT EXISTS on_chain_hash TEXT,
  ADD COLUMN IF NOT EXISTS mint_status mint_status DEFAULT 'PENDING',
  
  -- Additional West African specific fields
  ADD COLUMN IF NOT EXISTS traditional_authority_name TEXT,
  ADD COLUMN IF NOT EXISTS stool_land_reference TEXT,
  ADD COLUMN IF NOT EXISTS family_head_name TEXT,
  ADD COLUMN IF NOT EXISTS consent_authority TEXT,
  ADD COLUMN IF NOT EXISTS land_use_category TEXT,
  ADD COLUMN IF NOT EXISTS encumbrance_details JSONB,
  ADD COLUMN IF NOT EXISTS surveyor_license_number TEXT,
  ADD COLUMN IF NOT EXISTS survey_date DATE,
  ADD COLUMN IF NOT EXISTS lands_commission_file_number TEXT;

-- Update foreign key references to verified_users
ALTER TABLE public.land_claims
  DROP CONSTRAINT IF EXISTS land_claims_human_approver_id_fkey,
  ADD CONSTRAINT land_claims_human_approver_id_fkey 
    FOREIGN KEY (human_approver_id) 
    REFERENCES public.verified_users(id);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_land_claims_title_type ON public.land_claims(title_type);
CREATE INDEX IF NOT EXISTS idx_land_claims_document_serial ON public.land_claims(document_serial_number);
CREATE INDEX IF NOT EXISTS idx_land_claims_parcel_barcode ON public.land_claims(parcel_id_barcode);
CREATE INDEX IF NOT EXISTS idx_land_claims_grantor_type ON public.land_claims(grantor_type);
CREATE INDEX IF NOT EXISTS idx_land_claims_litigation ON public.land_claims(is_litigation_flag) WHERE is_litigation_flag = true;
CREATE INDEX IF NOT EXISTS idx_land_claims_fraud_score ON public.land_claims(fraud_confidence_score);
CREATE INDEX IF NOT EXISTS idx_land_claims_mint_status ON public.land_claims(mint_status);
CREATE INDEX IF NOT EXISTS idx_land_claims_on_chain_hash ON public.land_claims(on_chain_hash);

-- Create spatial index for polygon coordinates
CREATE INDEX IF NOT EXISTS idx_land_claims_polygon_geom ON public.land_claims USING GIST(polygon_coordinates);

-- Create GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_land_claims_witness_signatures ON public.land_claims USING GIN(witness_signatures_json);
CREATE INDEX IF NOT EXISTS idx_land_claims_encumbrances ON public.land_claims USING GIN(encumbrance_details);

-- Add constraints for West African legal requirements
ALTER TABLE public.land_claims
  ADD CONSTRAINT check_duration_years CHECK (duration_years > 0 AND duration_years <= 999),
  ADD CONSTRAINT check_parcel_barcode_format CHECK (parcel_id_barcode IS NULL OR length(parcel_id_barcode) >= 8);

-- Create table for tracking land disputes (enhanced)
CREATE TABLE IF NOT EXISTS public.land_litigation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  case_number TEXT,
  court_name TEXT,
  litigation_type TEXT,
  filing_date DATE,
  status TEXT DEFAULT 'ACTIVE',
  plaintiff_details JSONB,
  defendant_details JSONB,
  judgment_details JSONB,
  resolved_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for surveyor verification
CREATE TABLE IF NOT EXISTS public.surveyor_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  surveyor_name TEXT NOT NULL,
  surveyor_license_number TEXT NOT NULL,
  survey_firm TEXT,
  survey_date DATE NOT NULL,
  survey_plan_url TEXT,
  coordinates_verified BOOLEAN DEFAULT false,
  area_calculated_sqm DECIMAL(12, 2),
  beacon_coordinates JSONB,
  verification_notes TEXT,
  verified_by UUID REFERENCES public.verified_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for traditional authority approvals
CREATE TABLE IF NOT EXISTS public.traditional_authority_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  authority_type TEXT NOT NULL,
  authority_name TEXT NOT NULL,
  stool_name TEXT,
  paramount_chief_name TEXT,
  approval_date DATE,
  approval_document_url TEXT,
  witness_names TEXT[],
  seal_verified BOOLEAN DEFAULT false,
  notes TEXT,
  verified_by UUID REFERENCES public.verified_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for blockchain minting history
CREATE TABLE IF NOT EXISTS public.blockchain_minting_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.land_claims(id) ON DELETE CASCADE,
  on_chain_hash TEXT NOT NULL,
  ipfs_hash TEXT,
  blockchain_network TEXT DEFAULT 'POLYGON',
  transaction_hash TEXT,
  token_id TEXT,
  contract_address TEXT,
  mint_status mint_status DEFAULT 'PENDING',
  gas_fee_paid DECIMAL(18, 8),
  minted_at TIMESTAMPTZ,
  minted_by UUID REFERENCES public.verified_users(id),
  metadata_json JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update trigger for verified_users
CREATE TRIGGER update_verified_users_updated_at
  BEFORE UPDATE ON public.verified_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for new tables
CREATE TRIGGER update_litigation_history_updated_at
  BEFORE UPDATE ON public.land_litigation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.verified_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_litigation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveyor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traditional_authority_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_minting_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verified_users
CREATE POLICY "Verified users can view all verified users"
  ON public.verified_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage verified users"
  ON public.verified_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for litigation history
CREATE POLICY "Users can view litigation for their claims"
  ON public.land_litigation_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.land_claims
      WHERE id = claim_id
      AND claimant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for surveyor verifications
CREATE POLICY "Verifiers can view surveyor verifications"
  ON public.surveyor_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Verifiers can insert surveyor verifications"
  ON public.surveyor_verifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for traditional authority approvals
CREATE POLICY "Users can view traditional approvals for their claims"
  ON public.traditional_authority_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.land_claims
      WHERE id = claim_id
      AND claimant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for blockchain minting log
CREATE POLICY "Users can view blockchain logs for their claims"
  ON public.blockchain_minting_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.land_claims
      WHERE id = claim_id
      AND claimant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.verified_users
      WHERE auth_user_id = auth.uid()
      AND role IN ('VERIFIER', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Create helper functions for West African standards
CREATE OR REPLACE FUNCTION validate_ghana_parcel_barcode(barcode TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN barcode ~ '^[A-Z]{2}[0-9]{6,10}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_land_area_from_polygon(poly GEOMETRY)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ST_Area(poly::geography);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION check_polygon_overlap(claim_id UUID, poly GEOMETRY)
RETURNS TABLE (
  overlapping_claim_id UUID,
  overlap_area_sqm DECIMAL,
  overlap_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lc.id,
    ST_Area(ST_Intersection(lc.polygon_coordinates::geography, poly::geography))::DECIMAL,
    (ST_Area(ST_Intersection(lc.polygon_coordinates::geography, poly::geography)) / 
     ST_Area(poly::geography) * 100)::DECIMAL
  FROM public.land_claims lc
  WHERE lc.id != claim_id
    AND lc.polygon_coordinates IS NOT NULL
    AND ST_Intersects(lc.polygon_coordinates, poly)
    AND lc.ai_verification_status NOT IN ('REJECTED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for comprehensive claim details
CREATE OR REPLACE VIEW public.land_claims_detailed AS
SELECT 
  lc.*,
  vu.full_name as approver_name,
  vu.email as approver_email,
  vu.professional_license_number as approver_license,
  CASE 
    WHEN lc.polygon_coordinates IS NOT NULL 
    THEN ST_Area(lc.polygon_coordinates::geography)
    ELSE NULL
  END as calculated_area_sqm,
  CASE 
    WHEN lc.is_litigation_flag = true 
    THEN (SELECT COUNT(*) FROM public.land_litigation_history WHERE claim_id = lc.id AND status = 'ACTIVE')
    ELSE 0
  END as active_litigation_count,
  EXISTS(
    SELECT 1 FROM public.surveyor_verifications 
    WHERE claim_id = lc.id AND coordinates_verified = true
  ) as surveyor_verified,
  EXISTS(
    SELECT 1 FROM public.traditional_authority_approvals 
    WHERE claim_id = lc.id AND seal_verified = true
  ) as traditional_authority_verified
FROM public.land_claims lc
LEFT JOIN public.verified_users vu ON lc.human_approver_id = vu.id;

-- Grant permissions
GRANT SELECT ON public.land_claims_detailed TO authenticated;
GRANT EXECUTE ON FUNCTION validate_ghana_parcel_barcode TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_land_area_from_polygon TO authenticated;
GRANT EXECUTE ON FUNCTION check_polygon_overlap TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.land_claims.title_type IS 'Type of land title as per Ghana/Nigeria legal standards';
COMMENT ON COLUMN public.land_claims.duration_years IS 'Lease duration (typically 99 years in West Africa)';
COMMENT ON COLUMN public.land_claims.document_serial_number IS 'Government stamp ID from physical document';
COMMENT ON COLUMN public.land_claims.parcel_id_barcode IS 'Ghana Land Act 2020 compliant barcode';
COMMENT ON COLUMN public.land_claims.grantor_type IS 'Type of entity granting the land rights';
COMMENT ON COLUMN public.land_claims.witness_signatures_json IS 'Metadata of family/stool witnesses as required';
COMMENT ON COLUMN public.land_claims.legal_jurat_flag IS 'Indicates thumb-printed documents per LC.gov.gh standards';
COMMENT ON COLUMN public.land_claims.survey_plan_url IS 'Link to licensed surveyor official plan';
COMMENT ON COLUMN public.land_claims.polygon_coordinates IS 'PostGIS polygon geometry (SRID 4326)';
COMMENT ON COLUMN public.land_claims.is_litigation_flag IS 'Indicates if land is under legal dispute';
COMMENT ON COLUMN public.land_claims.fraud_confidence_score IS 'AI-calculated fraud detection score (0-1)';
COMMENT ON COLUMN public.land_claims.on_chain_hash IS 'IPFS hash for immutable document storage';
COMMENT ON COLUMN public.land_claims.mint_status IS 'NFT minting status on blockchain';
