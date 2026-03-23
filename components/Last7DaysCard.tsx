import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function getLogTimeFromDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function durationMinutes(bedTime: string, wakeTime: string): number {
  const bed = new Date(bedTime).getTime();
  const wake = new Date(wakeTime).getTime();
  let diff = (wake - bed) / 60_000;
  if (diff < 0) diff += 24 * 60;
  return Math.round(diff);
}

function napDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 60_000);
}

export default async function Last7DaysCard() {
  const user = await getCachedUser();

  const sevenDaysAgoDate = getDateDaysAgo(6); //test caching
  const sevenDaysAgoTs = getLogTimeFromDaysAgo(7);

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id, sevenDaysAgoDate),
    getCachedMoodLogs7Days(user.id, sevenDaysAgoTs),
    getCachedNapLogs7Days(user.id, sevenDaysAgoTs),
  ]);

  const avgMinutesLast7 =
    sleepLogs.length > 0
      ? Math.round(
          sleepLogs.reduce(
            (s, l) => s + durationMinutes(l.bed_time, l.wake_time),
            0,
          ) / sleepLogs.length,
        )
      : null;

  const avgMoodLast7 =
    moodLogs.length > 0
      ? Math.round(
          (moodLogs.reduce((s, m) => s + m.score, 0) / moodLogs.length) * 10,
        ) / 10
      : null;

  const totalNapMinLast7 = napLogs.reduce(
    (s, n) => s + napDurationMinutes(n.start_time, n.end_time),
    0,
  );

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  };

  return (
    <section className="flex flex-1 flex-col pt-5 mb-5 md:mb-0 md:px-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        최근 7일
      </h2>
      <ul className="mt-4 flex flex-1 flex-col space-y-0 h-20">
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 first:pt-0">
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            평균 수면
          </span>
          <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {avgMinutesLast7 != null ? formatDuration(avgMinutesLast7) : "—"}
          </span>
        </li>
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            평균 기분
          </span>
          <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {avgMoodLast7 != null ? `${avgMoodLast7}` : "—"}
          </span>
        </li>
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            낮잠
          </span>
          <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {napLogs.length > 0
              ? `${napLogs.length}회 · ${formatDuration(totalNapMinLast7)}`
              : "—"}
          </span>
        </li>
      </ul>
    </section>
  );
}
