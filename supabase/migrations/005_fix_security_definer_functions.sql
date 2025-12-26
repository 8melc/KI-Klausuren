-- Security Fix: Aktualisiere give_free_test_credit und add_credits mit SET search_path = ''
-- Dies verhindert SQL-Injection-Angriffe durch search_path-Manipulation

-- Aktualisiere give_free_test_credit Funktion
CREATE OR REPLACE FUNCTION public.give_free_test_credit(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users 
  SET credits = credits + 1,
      updated_at = NOW()
  WHERE id = user_id_param;
END;
$$;

-- Revoke execute from public for safety
REVOKE EXECUTE ON FUNCTION public.give_free_test_credit(UUID) FROM PUBLIC;

-- Aktualisiere add_credits Funktion
CREATE OR REPLACE FUNCTION public.add_credits(user_id_param UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF amount IS NULL OR amount = 0 THEN
    RETURN;
  END IF;
  UPDATE public.users 
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_id_param;
END;
$$;

-- Revoke execute from public for safety
REVOKE EXECUTE ON FUNCTION public.add_credits(UUID, INT) FROM PUBLIC;

-- Hinweis: Die Trigger-Funktion give_free_test_credit() ohne Parameter bleibt für den Trigger
-- Die neue Funktion mit Parameter kann für manuelle Aufrufe verwendet werden






