import { getCachedUser, getCachedSleepLogs7Days } from "@/lib/dal";

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

const formatDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
};

export default async function RecentSleepLog() {
  const user = await getCachedUser();
  const sevenDaysAgoDate = getDateDaysAgo(6); //test caching
  const sleepLogs = await getCachedSleepLogs7Days(user.id, sevenDaysAgoDate);

  const lastLog = sleepLogs[0];

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
