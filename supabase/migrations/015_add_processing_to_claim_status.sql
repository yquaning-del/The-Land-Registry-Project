-- Migration 015: Add PROCESSING to claim_status enum
--
-- Migration 010 attempted to add PROCESSING to a type called 'verification_status'
-- which does not exist. The actual enum used by land_claims.ai_verification_status
-- is 'claim_status'. This migration corrects that.

ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'PROCESSING' AFTER 'PENDING_VERIFICATION';
