CREATE OR REPLACE FUNCTION public.demo_talent_list()
RETURNS SETOF public.demo_talents
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id, full_name, category, city, education, experience, score, status FROM public.demo_talents ORDER BY id $$;
REVOKE ALL ON FUNCTION public.demo_talent_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.demo_talent_list() TO anon, authenticated;
DROP POLICY IF EXISTS demo_read ON public.demo_talents;
REVOKE SELECT ON public.demo_talents FROM anon, authenticated;