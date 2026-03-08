-- Drop the existing security_invoker view and recreate without it
-- so anonymous users can read approved feedback through the view
DROP VIEW IF EXISTS public.feedback_public;

CREATE VIEW public.feedback_public AS
  SELECT id, name, message, rating, tour_name, is_featured, created_at
  FROM public.feedback
  WHERE is_approved = true;

-- Grant select on the view to anon and authenticated
GRANT SELECT ON public.feedback_public TO anon, authenticated;