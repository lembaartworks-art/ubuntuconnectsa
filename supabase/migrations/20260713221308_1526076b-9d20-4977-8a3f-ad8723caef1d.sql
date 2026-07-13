
CREATE POLICY "ngo docs anon upload" ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'ngo-documents');
CREATE POLICY "ngo docs auth upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ngo-documents');
CREATE POLICY "ngo docs admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ngo-documents' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "ngo docs owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ngo-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
