-- Migration 021: Add PENDING_CLARIFICATION status and clarification flow columns
-- Allows verifiers to request additional information from claimants
-- before making an approve/reject decision.

-- 1. Add new enum value to claim_status
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'PENDING_CLARIFICATION' AFTER 'PENDING_HUMAN_REVIEW';

-- 2. Add clarification columns to land_claims
ALTER TABLE land_claims
  ADD COLUMN IF NOT EXISTS clarification_message      TEXT,
  ADD COLUMN IF NOT EXISTS clarification_response     TEXT,
  ADD COLUMN IF NOT EXISTS clarification_requested_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS clarification_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clarification_responded_at TIMESTAMPTZ;

-- Note: a partial index on 'PENDING_CLARIFICATION' cannot be created in this migration
-- because PostgreSQL requires the new enum value to be committed before it can be used
-- in a WHERE clause. The existing idx_land_claims_claimant_id index covers claimant lookups.
