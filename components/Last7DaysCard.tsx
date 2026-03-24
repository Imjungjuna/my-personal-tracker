import {
  getCachedUser,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";

import { durationMinutes, formatDuration } from "@/utils/date";

export default async function Last7DaysCard() {
  const user = await getCachedUser();

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id),
    getCachedMoodLogs7Days(user.id),
    getCachedNapLogs7Days(user.id),
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
    (s, n) => s + durationMinutes(n.start_time, n.end_time),
    0,
  );

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
