-- Tighten permissive INSERT RLS policies (keep public forms working, but prevent trivial abuse & ID spoofing)

-- BOOKINGS: replace permissive insert policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  -- basic required fields
  length(trim(customer_name)) >= 2
  AND length(trim(customer_email)) >= 5
  AND position('@' in customer_email) > 1
  AND length(trim(customer_phone)) >= 7
  AND num_travelers >= 1
  AND travel_date IS NOT NULL
  -- prevent inserting as another user
  AND (user_id IS NULL OR auth.uid() = user_id)
);

-- FEEDBACK: replace permissive insert policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
WITH CHECK (
  length(trim(name)) >= 2
  AND length(trim(email)) >= 5
  AND position('@' in email) > 1
  AND length(trim(message)) >= 10
  AND rating BETWEEN 1 AND 5
  AND (user_id IS NULL OR auth.uid() = user_id)
);