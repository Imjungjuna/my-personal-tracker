-- mood_logs RLS: 본인 행만 SELECT/INSERT/UPDATE/DELETE 허용
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mood_logs_select_policy ON public.mood_logs;
CREATE POLICY mood_logs_select_policy ON public.mood_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS mood_logs_insert_policy ON public.mood_logs;
CREATE POLICY mood_logs_insert_policy ON public.mood_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS mood_logs_update_policy ON public.mood_logs;
CREATE POLICY mood_logs_update_policy ON public.mood_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS mood_logs_delete_policy ON public.mood_logs;
CREATE POLICY mood_logs_delete_policy ON public.mood_logs
  FOR DELETE USING (auth.uid() = user_id);
