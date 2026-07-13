
-- NGOs
CREATE POLICY "ngos admin update" ON public.ngos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "ngos admin delete" ON public.ngos FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Donations
CREATE POLICY "donations admin update" ON public.donations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "donations admin delete" ON public.donations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Requests
CREATE POLICY "requests admin update" ON public.support_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "requests admin delete" ON public.support_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Testimonials (admin only writes)
CREATE POLICY "testimonials admin insert" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "testimonials admin update" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "testimonials admin delete" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Messages: admin update/delete (mark read/delete). Insert stays open (contact form uses anon key -- allow anon insert)
CREATE POLICY "messages admin update" ON public.messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "messages admin delete" ON public.messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "messages anyone insert" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- NGO application: allow anonymous submission
CREATE POLICY "ngos anon insert" ON public.ngos FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admin status: admin manage
CREATE POLICY "admin_status admin insert" ON public.admin_status FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_status admin update" ON public.admin_status FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- user_roles: admin can manage roles
CREATE POLICY "user_roles admin insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles admin delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
