-- Korrekturen/Ergebnisse Tabelle
CREATE TABLE IF NOT EXISTS corrections (
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

-- Erwartungshorizonte Tabelle
CREATE TABLE IF NOT EXISTS expectation_horizons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_corrections_user_id ON corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);
CREATE INDEX IF NOT EXISTS idx_corrections_created_at ON corrections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expectation_horizons_user_id ON expectation_horizons(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE expectation_horizons ENABLE ROW LEVEL SECURITY;

-- Lösche bestehende Policies falls vorhanden (für idempotente Migration)
DROP POLICY IF EXISTS "Users can view own corrections" ON corrections;
DROP POLICY IF EXISTS "Users can insert own corrections" ON corrections;
DROP POLICY IF EXISTS "Users can update own corrections" ON corrections;
DROP POLICY IF EXISTS "Users can view own expectation horizons" ON expectation_horizons;
DROP POLICY IF EXISTS "Users can insert own expectation horizons" ON expectation_horizons;

-- Users können nur ihre eigenen Korrekturen sehen
CREATE POLICY "Users can view own corrections"
  ON corrections FOR SELECT
  USING (auth.uid() = user_id);

-- Users können nur ihre eigenen Korrekturen erstellen
CREATE POLICY "Users can insert own corrections"
  ON corrections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users können nur ihre eigenen Korrekturen aktualisieren
CREATE POLICY "Users can update own corrections"
  ON corrections FOR UPDATE
  USING (auth.uid() = user_id);

-- Users können nur ihre eigenen Erwartungshorizonte sehen
CREATE POLICY "Users can view own expectation horizons"
  ON expectation_horizons FOR SELECT
  USING (auth.uid() = user_id);

-- Users können nur ihre eigenen Erwartungshorizonte erstellen
CREATE POLICY "Users can insert own expectation horizons"
  ON expectation_horizons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

