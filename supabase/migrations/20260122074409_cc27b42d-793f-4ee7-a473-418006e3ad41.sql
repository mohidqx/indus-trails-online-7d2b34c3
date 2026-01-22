-- Create a public view that excludes email addresses for public access
CREATE VIEW public.feedback_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  message,
  rating,
  tour_name,
  is_featured,
  created_at
FROM public.feedback
WHERE is_approved = true;

-- Drop the policy that allows public access to all columns
DROP POLICY IF EXISTS "Anyone can view approved feedback" ON public.feedback;

-- Create a new policy that only allows admins to view feedback directly (including email)
CREATE POLICY "Only admins can view feedback directly"
ON public.feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));