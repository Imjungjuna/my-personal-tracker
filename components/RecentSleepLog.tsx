import { getCachedUser, getCachedSleepLogs7Days } from "@/lib/dal";
import { getDateDaysAgo, durationMinutes, formatDuration } from "@/utils/date";

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
