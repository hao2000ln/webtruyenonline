INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-covers',
  'story-covers',
  true,
  1048576,
  ARRAY['image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
--> statement-breakpoint
CREATE POLICY "story_covers_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'story-covers'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
--> statement-breakpoint
CREATE POLICY "story_covers_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'story-covers'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  bucket_id = 'story-covers'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
--> statement-breakpoint
CREATE POLICY "story_covers_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'story-covers'
  AND (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
