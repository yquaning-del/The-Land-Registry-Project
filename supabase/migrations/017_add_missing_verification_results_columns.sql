-- Migration 017: Add missing score columns to verification_results
-- These columns exist in TypeScript types but were never added to the DB.
-- The API route inserts these and fails with PGRST204 without them.
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.verification_results
  ADD COLUMN IF NOT EXISTS fraud_detection_score NUMERIC(5,4),
  ADD COLUMN IF NOT EXISTS tampering_check_score NUMERIC(5,4);
