-- Drop existing restrictive policies on bookings
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Create permissive policies (default) for bookings
-- Admins can do everything
CREATE POLICY "Admins can manage all bookings" 
ON public.bookings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" 
ON public.bookings 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);