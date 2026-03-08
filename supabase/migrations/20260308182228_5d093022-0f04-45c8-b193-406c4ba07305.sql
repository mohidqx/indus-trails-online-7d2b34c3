
-- Banned IPs table for IP blocking
CREATE TABLE public.banned_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  reason TEXT,
  banned_by UUID,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site settings for maintenance mode, lockdown, announcements
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- User bans / suspensions
CREATE TABLE public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL DEFAULT 'suspended',
  banned_by UUID,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- RLS policies: Admin only for all
CREATE POLICY "Admins can manage banned_ips" ON public.banned_ips FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage user_bans" ON public.user_bans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "We are currently under maintenance. Please check back soon."}'::jsonb),
  ('site_lockdown', '{"enabled": false, "password": ""}'::jsonb),
  ('announcement_banner', '{"enabled": false, "message": "", "type": "info", "dismissible": true}'::jsonb),
  ('registration_enabled', '{"enabled": true}'::jsonb);
