-- Drop the problematic policy that references auth.users
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Create a simpler policy that only checks user_id (no auth.users reference)
CREATE POLICY "Users can view own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);