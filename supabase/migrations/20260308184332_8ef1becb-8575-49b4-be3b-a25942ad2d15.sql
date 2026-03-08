
-- 1. Blog / Travel Guides
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'guide',
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'Indus Tours',
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage blog" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Photo Gallery
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  location TEXT,
  uploaded_by UUID,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved photos" ON public.gallery_photos FOR SELECT USING (is_approved = true);
CREATE POLICY "Authenticated users can upload" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_photos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Loyalty / Rewards
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  action TEXT NOT NULL,
  description TEXT,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points" ON public.loyalty_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage points" ON public.loyalty_points FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  reward_points INTEGER DEFAULT 500,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Anyone can use referral" ON public.referrals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage referrals" ON public.referrals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Itineraries (custom trip builder)
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  destinations UUID[] DEFAULT '{}',
  tour_ids UUID[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  total_estimate NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own itineraries" ON public.itineraries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view public itineraries" ON public.itineraries FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can manage itineraries" ON public.itineraries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Newsletter Subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage subscribers" ON public.newsletter_subscribers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Abandoned bookings tracking
CREATE TABLE public.abandoned_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  tour_id UUID REFERENCES public.tours(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  form_data JSONB DEFAULT '{}',
  recovery_sent BOOLEAN DEFAULT false,
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.abandoned_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage abandoned" ON public.abandoned_bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert abandoned" ON public.abandoned_bookings FOR INSERT WITH CHECK (true);

-- 8. Tour availability / calendar
CREATE TABLE public.tour_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  slots_total INTEGER DEFAULT 10,
  slots_booked INTEGER DEFAULT 0,
  price_override NUMERIC,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tour_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availability" ON public.tour_availability FOR SELECT USING (true);
CREATE POLICY "Admins can manage availability" ON public.tour_availability FOR ALL USING (public.has_role(auth.uid(), 'admin'));
