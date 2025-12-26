-- 008_add_profile_fields_to_users.sql
-- Fügt Profilspalten zu public.users hinzu, falls sie noch nicht existieren.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS bundesland text,
  ADD COLUMN IF NOT EXISTS subjects text[] DEFAULT '{}'::text[];

-- Optional: GIN-Index für subjects (schnelle Suche / Contains)
CREATE INDEX IF NOT EXISTS idx_users_subjects_gin ON public.users USING gin (subjects);

-- Kommentare für Dokumentation
COMMENT ON COLUMN public.users.name IS 'Vollständiger Name des Benutzers';
COMMENT ON COLUMN public.users.school IS 'Schule oder Institution';
COMMENT ON COLUMN public.users.subjects IS 'Array von unterrichteten Fächern';
COMMENT ON COLUMN public.users.bundesland IS 'Bundesland der Schule';

