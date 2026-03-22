import { createClient } from "@/lib/supabase/server";
import { SleepCharts } from "@/app/dashboard/(with-nav)/checkin/SleepCharts";

const RECENT_DAYS = 6;

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  let diff = (wake - bed) / 60_000;
  if (diff < 0) diff += 24 * 60;
  return Math.round(diff);
}

export default async function SleepChartWrapper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = getTodayISO();
  const fromDate = getDateDaysAgo(RECENT_DAYS);

  const { data: recentLogs } = await supabase
    .from("sleep_logs")
    .select("sleep_date, bed_time, wake_time")
    .eq("user_id", user.id)
    .gte("sleep_date", fromDate)
    .lte("sleep_date", today)
    .order("sleep_date", { ascending: false });

  const logsWithDuration = (recentLogs ?? []).map((row) => ({
    sleep_date: row.sleep_date,
    bed_time: row.bed_time,
    wake_time: row.wake_time,
    durationMinutes: durationMinutes(row.bed_time, row.wake_time),
  }));

  return <SleepCharts logs={logsWithDuration} />;
}
