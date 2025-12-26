-- Storage Bucket und Policies für 'klausuren'
-- Dateien werden mit Pfad auth_uid/original_filename gespeichert
-- owner_id wird in Metadaten gesetzt

-- Erstelle Bucket, falls er nicht existiert
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'klausuren',
  'klausuren',
  false, -- Nicht öffentlich, nur für authentifizierte User
  52428800, -- 50MB Limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Lösche alte Policies falls vorhanden
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their files" ON storage.objects;

-- 1. INSERT Policy: User können nur Dateien in ihrem eigenen Ordner (auth_uid/) hochladen
-- Der Pfad muss mit auth_uid/ beginnen (z.B. 3f8a2c4e-.../klausur.pdf)
-- Optional: owner_id in Metadaten als zusätzliche Sicherheitsebene
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'klausuren' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. SELECT Policy: User können nur Dateien in ihrem eigenen Ordner lesen
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'klausuren' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. UPDATE Policy: User können nur ihre eigenen Dateien aktualisieren
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'klausuren' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'klausuren' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. DELETE Policy: User können nur ihre eigenen Dateien löschen
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'klausuren' AND
  (storage.foldername(name))[1] = auth.uid()::text
);






