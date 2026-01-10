-- Fix admin visibility across RLS policies by supporting the argument order used in policies
-- Existing policies call: has_role(auth.uid(), 'admin'::app_role)
-- Current function signature is: has_role(_role app_role, _user_id uuid)
-- This adds an overloaded signature: has_role(_user_id uuid, _role app_role)

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public;
