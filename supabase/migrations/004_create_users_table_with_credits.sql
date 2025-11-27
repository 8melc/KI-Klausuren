-- Users Tabelle mit Credits-System
-- Automatisch verbunden mit auth.users via Foreign Key

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_users_credits ON public.users(credits);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies: SELECT, UPDATE (verwende SELECT auth.uid() für bessere caching)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Optional: Allow INSERT by authenticated only if user creates their own row
-- If you want users to be able to create their own profile row, enable this:
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Funktion: Vergibt automatisch 1 kostenloses Credit bei Registrierung
CREATE OR REPLACE FUNCTION public.give_free_test_credit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, credits)
  VALUES (NEW.id, 1)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute from public for safety
REVOKE EXECUTE ON FUNCTION public.give_free_test_credit() FROM PUBLIC;

-- Trigger: Wird ausgelöst, sobald ein neuer Auth-User erzeugt wird
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.give_free_test_credit();

-- RPC-Funktion: Credits hinzufügen (für Stripe-Webhook)
-- Mit null-check und updated_at
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  IF amount IS NULL OR amount = 0 THEN
    RETURN;
  END IF;
  UPDATE public.users
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute from public for safety
REVOKE EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER) FROM PUBLIC;

