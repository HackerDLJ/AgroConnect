
-- Fix #1: Add missing RLS policies for plants INSERT/UPDATE/DELETE (admin-only)
CREATE POLICY "Admins can insert plants"
ON public.plants
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plants"
ON public.plants
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plants"
ON public.plants
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
