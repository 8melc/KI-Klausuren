-- Ändere die ID-Spalte von UUID zu TEXT
-- Falls die Tabelle bereits existiert, muss sie angepasst werden

-- Schritt 1: Erstelle temporäre Tabelle mit neuer Struktur
CREATE TABLE IF NOT EXISTS corrections_new (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  course_subject TEXT,
  course_grade_level TEXT,
  course_class_name TEXT,
  course_school_year TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schritt 2: Kopiere Daten (falls vorhanden)
-- Konvertiere UUID zu Text für bestehende Einträge
INSERT INTO corrections_new (id, user_id, student_name, file_name, course_subject, course_grade_level, course_class_name, course_school_year, status, analysis, created_at, updated_at)
SELECT 
  id::TEXT,
  user_id,
  student_name,
  file_name,
  course_subject,
  course_grade_level,
  course_class_name,
  course_school_year,
  status,
  analysis,
  created_at,
  updated_at
FROM corrections
ON CONFLICT DO NOTHING;

-- Schritt 3: Lösche alte Tabelle
DROP TABLE IF EXISTS corrections;

-- Schritt 4: Benenne neue Tabelle um
ALTER TABLE corrections_new RENAME TO corrections;

-- Schritt 5: Erstelle Indizes neu
CREATE INDEX IF NOT EXISTS idx_corrections_user_id ON corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);
CREATE INDEX IF NOT EXISTS idx_corrections_created_at ON corrections(created_at DESC);

-- Schritt 6: Aktiviere RLS
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- Schritt 7: Erstelle Policies neu (lösche zuerst falls vorhanden)
DROP POLICY IF EXISTS "Users can view own corrections" ON corrections;
DROP POLICY IF EXISTS "Users can insert own corrections" ON corrections;
DROP POLICY IF EXISTS "Users can update own corrections" ON corrections;

CREATE POLICY "Users can view own corrections"
  ON corrections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own corrections"
  ON corrections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own corrections"
  ON corrections FOR UPDATE
  USING (auth.uid() = user_id);

