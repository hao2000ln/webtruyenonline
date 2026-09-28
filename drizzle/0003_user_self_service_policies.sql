-- Create a profile for every new Supabase Auth user. The trigger runs with
-- the function owner's privileges so signup does not need elevated client keys.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_history TO authenticated;

CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "follows_select_own"
ON public.follows FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "follows_insert_own"
ON public.follows FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "follows_delete_own"
ON public.follows FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "reading_history_select_own"
ON public.reading_history FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "reading_history_insert_own"
ON public.reading_history FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reading_history_update_own"
ON public.reading_history FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reading_history_delete_own"
ON public.reading_history FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);
