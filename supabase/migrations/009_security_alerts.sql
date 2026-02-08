-- Security Alerts Table for Conflict Notification System
-- Stores in-app alerts for buyers, lawyers, and sellers

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.land_claims(id) ON DELETE SET NULL,
  conflicting_claim_id UUID REFERENCES public.land_claims(id) ON DELETE SET NULL,
  
  -- Alert classification
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'CONFLICT_DETECTED',
    'DOUBLE_SALE_SUSPECTED',
    'PRIORITY_ESTABLISHED',
    'LAWYER_NOTIFIED',
    'SELLER_FLAGGED',
    'RESOLUTION_UPDATE'
  )),
  severity TEXT NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('MEDIUM', 'HIGH', 'CRITICAL')),
  
  -- Alert content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Conflict details
  overlap_percentage DECIMAL(5,2),
  blockchain_hash TEXT,
  conflict_map_url TEXT,
  
  -- Recipient info
  recipient_type TEXT NOT NULL DEFAULT 'BUYER' CHECK (recipient_type IN ('BUYER', 'LAWYER', 'SELLER', 'ADMIN')),
  recipient_email TEXT,
  
  -- Status tracking
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_claim_id ON public.security_alerts(claim_id);
CREATE INDEX idx_security_alerts_is_read ON public.security_alerts(is_read);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX idx_security_alerts_user_unread ON public.security_alerts(user_id, is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
  ON public.security_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own alerts (mark as read)
CREATE POLICY "Users can update own alerts"
  ON public.security_alerts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert alerts
CREATE POLICY "Service can insert alerts"
  ON public.security_alerts
  FOR INSERT
  WITH CHECK (true);

-- Admin users can view all alerts (for admin dashboard)
CREATE POLICY "Admins can view all alerts"
  ON public.security_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'ADMIN'
    )
  );

-- Function to get unread alert count for a user
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.security_alerts
    WHERE user_id = p_user_id
    AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get critical alerts for a user
CREATE OR REPLACE FUNCTION get_critical_alerts(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  alert_type TEXT,
  severity TEXT,
  title TEXT,
  message TEXT,
  claim_id UUID,
  overlap_percentage DECIMAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.alert_type,
    sa.severity,
    sa.title,
    sa.message,
    sa.claim_id,
    sa.overlap_percentage,
    sa.created_at
  FROM public.security_alerts sa
  WHERE sa.user_id = p_user_id
  AND sa.is_read = FALSE
  AND sa.severity IN ('HIGH', 'CRITICAL')
  ORDER BY 
    CASE sa.severity 
      WHEN 'CRITICAL' THEN 1 
      WHEN 'HIGH' THEN 2 
      ELSE 3 
    END,
    sa.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_security_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_security_alerts_updated_at
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_security_alerts_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.security_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_alert_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_critical_alerts TO authenticated;

-- Add comment
COMMENT ON TABLE public.security_alerts IS 'Stores security alerts for conflict notifications in the Valley of Fraud protection system';
