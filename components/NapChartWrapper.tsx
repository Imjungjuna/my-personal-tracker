import { createClient } from "@/lib/supabase/server";
import {
  NapChart,
  type NapLogForChart,
} from "@/app/dashboard/(with-nav)/nap-checkin/NapChart";

const RECENT_DAYS = 6;

function getLogTimeFromDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function napDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 60_000);
}

export default async function NapChartWrapper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fromTs = getLogTimeFromDaysAgo(RECENT_DAYS);

  const { data: napResult } = await supabase
    .from("nap_logs")
    .select("start_time, end_time")
    .eq("user_id", user.id)
    .gte("start_time", fromTs)
    .order("start_time", { ascending: false });

  const napLogsWithDuration: NapLogForChart[] = (napResult ?? []).map(
    (row) => ({
      start_time: row.start_time,
      end_time: row.end_time,
      durationMinutes: napDurationMinutes(row.start_time, row.end_time),
    }),
  );

  return <NapChart logs={napLogsWithDuration} />;
}
