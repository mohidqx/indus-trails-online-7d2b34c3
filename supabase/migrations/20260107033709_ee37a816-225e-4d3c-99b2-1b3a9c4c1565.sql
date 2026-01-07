-- Ensure site_content keys are unique so upsert(onConflict: 'key') works reliably
CREATE UNIQUE INDEX IF NOT EXISTS site_content_key_unique ON public.site_content (key);

-- Extend bookings with additional customer details
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_address text,
  ADD COLUMN IF NOT EXISTS customer_cnic text,
  ADD COLUMN IF NOT EXISTS customer_nationality text;