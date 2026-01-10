-- Secure bookings: prevent direct public inserts (use backend function with service role instead)
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
