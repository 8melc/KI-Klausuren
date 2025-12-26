-- 009_ensure_users_update_policy.sql
-- Stellt sicher, dass die RLS-Policy für UPDATE auf public.users korrekt ist
-- Diese Migration ist idempotent und kann mehrfach ausgeführt werden

-- RLS aktivieren (falls noch nicht aktiviert)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Bestehende Policy löschen (falls vorhanden)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;

-- Policy erstellen (mit beiden Namen für Kompatibilität)
-- Diese Policy erlaubt authentifizierten Usern, nur ihre eigene Zeile zu updaten
CREATE POLICY "users_self_update" ON public.users
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);







