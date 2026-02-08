-- Add PLATFORM_OWNER to user_role enum
-- This must be in a separate transaction before the value can be used
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PLATFORM_OWNER';
