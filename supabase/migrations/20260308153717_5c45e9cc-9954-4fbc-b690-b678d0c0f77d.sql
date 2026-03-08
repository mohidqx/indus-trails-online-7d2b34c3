
CREATE TABLE public.visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_agent text,
  browser text,
  browser_version text,
  os text,
  platform text,
  language text,
  all_languages text[],
  timezone text,
  tz_offset integer,
  cookies_enabled boolean DEFAULT true,
  online boolean DEFAULT true,
  pdf_viewer boolean DEFAULT false,
  screen_width integer,
  screen_height integer,
  available_width integer,
  available_height integer,
  viewport_width integer,
  viewport_height integer,
  pixel_ratio numeric,
  color_depth integer,
  orientation text,
  cpu_cores integer,
  max_touch_points integer,
  touch_support boolean DEFAULT false,
  gpu_vendor text,
  gpu_renderer text,
  time_on_page integer DEFAULT 0,
  mouse_moves integer DEFAULT 0,
  scroll_distance integer DEFAULT 0,
  max_scroll integer DEFAULT 0,
  sections_viewed text[],
  entry_url text,
  nav_type text,
  ip_address text,
  country text,
  city text,
  device_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view visitor logs" ON public.visitor_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert visitor logs" ON public.visitor_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update own session" ON public.visitor_logs
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_logs;
