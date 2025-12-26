-- User Profile Tabelle
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  school TEXT,
  subjects TEXT[], -- Array von Fächern
  bundesland TEXT,
  feedback_style TEXT DEFAULT 'balanced' CHECK (feedback_style IN ('motivating', 'direct', 'balanced')),
  feedback_length TEXT DEFAULT 'medium' CHECK (feedback_length IN ('short', 'medium', 'long')),
  use_formal_address BOOLEAN DEFAULT FALSE, -- false = duzen
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Classes Tabelle
CREATE TABLE IF NOT EXISTS user_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  student_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Preferences Tabelle
CREATE TABLE IF NOT EXISTS email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  correction_finished BOOLEAN DEFAULT TRUE,
  credits_low BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT FALSE,
  feature_updates BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_user_classes_user_id ON user_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_id ON user_profile(id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Lösche bestehende Policies falls vorhanden
DROP POLICY IF EXISTS "Users can view own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile;

DROP POLICY IF EXISTS "Users can view own classes" ON user_classes;
DROP POLICY IF EXISTS "Users can insert own classes" ON user_classes;
DROP POLICY IF EXISTS "Users can update own classes" ON user_classes;
DROP POLICY IF EXISTS "Users can delete own classes" ON user_classes;

DROP POLICY IF EXISTS "Users can view own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can update own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can insert own email preferences" ON email_preferences;

-- User Profile Policies
CREATE POLICY "Users can view own profile"
  ON user_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profile FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profile FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Classes Policies
CREATE POLICY "Users can view own classes"
  ON user_classes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own classes"
  ON user_classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classes"
  ON user_classes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own classes"
  ON user_classes FOR DELETE
  USING (auth.uid() = user_id);

-- Email Preferences Policies
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);






