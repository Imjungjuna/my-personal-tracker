import { createClient } from "@/lib/supabase/server";
import {
  MoodChart,
  type MoodLogForChart,
} from "@/app/dashboard/(with-nav)/mood-checkin/MoodChart";

const RECENT_DAYS = 6;

function getLogTimeFromDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function MoodChartWrapper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const fromTs = getLogTimeFromDaysAgo(RECENT_DAYS);

  const { data: moodResult } = await supabase
    .from("mood_logs")
    .select("log_time, score")
    .eq("user_id", user.id)
    .gte("log_time", fromTs)
    .order("log_time", { ascending: false });

  const moodLogs: MoodLogForChart[] = (moodResult ?? []).map((row) => ({
    log_time: row.log_time,
    score: row.score,
  }));

  return <MoodChart logs={moodLogs} />;
}
