-- Migration 016: Add missing ai_powered column to verification_results
-- The TypeScript types reference this column but it was never added to the DB.
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.verification_results
  ADD COLUMN IF NOT EXISTS ai_powered BOOLEAN DEFAULT FALSE;

-- Backfill existing rows
UPDATE public.verification_results SET ai_powered = FALSE WHERE ai_powered IS NULL;
