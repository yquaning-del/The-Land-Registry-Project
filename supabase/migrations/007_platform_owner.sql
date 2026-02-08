-- NOTE: The enum value 'PLATFORM_OWNER' must be added in a separate transaction first.
-- Run 007a_add_platform_owner_enum.sql before this migration.
-- This is a PostgreSQL requirement: new enum values must be committed before use.

-- Create platform_settings table to store platform configuration
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only platform owners can view/modify settings
CREATE POLICY "Platform owners can view settings"
  ON public.platform_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('PLATFORM_OWNER', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Platform owners can modify settings"
  ON public.platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'PLATFORM_OWNER'
    )
  );

-- Update RLS policies to give PLATFORM_OWNER full access to all tables
CREATE POLICY "Platform owners can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'PLATFORM_OWNER'
    )
  );

CREATE POLICY "Platform owners can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'PLATFORM_OWNER'
    )
  );

-- Function to set platform owner by email
CREATE OR REPLACE FUNCTION set_platform_owner(owner_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get user ID from auth.users by email
  SELECT id INTO user_uuid FROM auth.users WHERE email = owner_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', owner_email;
  END IF;
  
  -- Update user role to PLATFORM_OWNER
  UPDATE public.user_profiles 
  SET role = 'PLATFORM_OWNER'
  WHERE id = user_uuid;
  
  -- Store in platform_settings
  INSERT INTO public.platform_settings (key, value)
  VALUES ('platform_owner', jsonb_build_object('user_id', user_uuid, 'email', owner_email))
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is platform owner
CREATE OR REPLACE FUNCTION is_platform_owner(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_uuid
    AND role = 'PLATFORM_OWNER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
