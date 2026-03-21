import { createClient } from "@/lib/supabase/server";

function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  let diff = (wake - bed) / 60_000;
  if (diff < 0) diff += 24 * 60;
  return Math.round(diff);
}

const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
};

export default async function RecentSleepLog() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: logs } = await supabase
    .from("sleep_logs")
    .select("sleep_date, bed_time, wake_time")
    .eq("user_id", user.id)
    .order("sleep_date", { ascending: false })
    .limit(1);

  const lastLog = logs?.[0];

  if (!lastLog) return null;

  const durationMin = durationMinutes(lastLog.bed_time, lastLog.wake_time);

  return (
    <div className="pb-4 pt-6 border-b border-zinc-200 dark:border-zinc-700">
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-400">
        최근 기록
      </p>
      <p className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-50">
        {lastLog.sleep_date} · {formatDuration(durationMin)}
      </p>
    </div>
  );
}
