
-- Fix: Restrict plants SELECT to verified entries for public, admins see all
DROP POLICY IF EXISTS "Plants are viewable by everyone" ON public.plants;

CREATE POLICY "Public can view verified plants"
ON public.plants
FOR SELECT
USING (verified = true);

CREATE POLICY "Admins can view all plants"
ON public.plants
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
