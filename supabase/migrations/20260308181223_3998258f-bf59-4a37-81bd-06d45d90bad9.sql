CREATE POLICY "Anyone can view approved feedback"
ON public.feedback FOR SELECT
USING (is_approved = true);