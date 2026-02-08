-- Migration: Add AI verification fields for enhanced GPT-4 powered verification
-- Version: 010
-- Date: 2026-02-05

-- Add new columns to verification_results table for AI-powered verification
ALTER TABLE verification_results 
ADD COLUMN IF NOT EXISTS fraud_detection_score DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS tampering_check_score DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS ai_powered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reasoning TEXT[];

-- Add index for AI-powered verifications
CREATE INDEX IF NOT EXISTS idx_verification_results_ai_powered 
ON verification_results(ai_powered) WHERE ai_powered = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN verification_results.fraud_detection_score IS 'AI fraud detection confidence score (0-1, higher = less fraudulent)';
COMMENT ON COLUMN verification_results.tampering_check_score IS 'AI document tampering check score (0-1, higher = less tampered)';
COMMENT ON COLUMN verification_results.ai_powered IS 'Whether this verification used GPT-4 Vision AI';
COMMENT ON COLUMN verification_results.reasoning IS 'Array of AI reasoning steps explaining the verification decision';

-- Add processing status to land_claims for better UX
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'verification_status' AND e.enumlabel = 'PROCESSING'
  ) THEN
    ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'PROCESSING' AFTER 'PENDING_VERIFICATION';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create table for storing detailed AI analysis results
CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES land_claims(id) ON DELETE CASCADE,
  verification_result_id UUID REFERENCES verification_results(id) ON DELETE CASCADE,
  
  -- Document analysis
  document_type VARCHAR(100),
  grantor_name VARCHAR(255),
  grantee_name VARCHAR(255),
  parcel_id VARCHAR(100),
  plot_number VARCHAR(100),
  location TEXT,
  issue_date DATE,
  expiry_date DATE,
  duration_years INTEGER,
  extracted_text TEXT,
  document_confidence DECIMAL(5,4),
  is_authentic BOOLEAN,
  
  -- Fraud detection
  fraud_indicators TEXT[],
  authenticity_markers TEXT[],
  fraud_reasoning TEXT,
  fraud_recommendation VARCHAR(20),
  
  -- Tampering detection
  has_tampering BOOLEAN DEFAULT FALSE,
  tampering_indicators TEXT[],
  tampering_confidence DECIMAL(5,4),
  
  -- Metadata
  model_used VARCHAR(50) DEFAULT 'gpt-4o',
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_analysis_claim_id ON ai_analysis_results(claim_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_fraud ON ai_analysis_results(is_authentic, has_tampering);

-- Add RLS policies
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI analysis results
CREATE POLICY "Users can view own AI analysis" ON ai_analysis_results
  FOR SELECT USING (
    claim_id IN (
      SELECT id FROM land_claims WHERE claimant_id = auth.uid()
    )
  );

-- Admins can view all AI analysis results
CREATE POLICY "Admins can view all AI analysis" ON ai_analysis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER')
    )
  );

-- System can insert AI analysis results
CREATE POLICY "System can insert AI analysis" ON ai_analysis_results
  FOR INSERT WITH CHECK (TRUE);

-- Add comments
COMMENT ON TABLE ai_analysis_results IS 'Stores detailed AI analysis results from GPT-4 Vision document verification';
