-- nap_logs RLS: 본인 행만 SELECT/INSERT/UPDATE/DELETE 허용
ALTER TABLE public.nap_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nap_logs_select_policy ON public.nap_logs;
CREATE POLICY nap_logs_select_policy ON public.nap_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS nap_logs_insert_policy ON public.nap_logs;
CREATE POLICY nap_logs_insert_policy ON public.nap_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS nap_logs_update_policy ON public.nap_logs;
CREATE POLICY nap_logs_update_policy ON public.nap_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS nap_logs_delete_policy ON public.nap_logs;
CREATE POLICY nap_logs_delete_policy ON public.nap_logs
  FOR DELETE USING (auth.uid() = user_id);
