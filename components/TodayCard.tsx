import Link from "next/link";
import {
  getCachedUser,
  getUserProfile,
  getCachedSleepLogs7Days,
  getCachedMoodLogs7Days,
  getCachedNapLogs7Days,
} from "@/lib/dal";

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getTodayStartTs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

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

export default async function TodayCard() {
  const user = await getCachedUser();
  await getUserProfile();

  const todayISO = getTodayISO();
  const todayStartTs = getTodayStartTs();
  const sevenDaysAgoDate = getDateDaysAgo(6); //test caching
  const sevenDaysAgoTs = getLogTimeFromDaysAgo(7);

  const [sleepLogs, moodLogs, napLogs] = await Promise.all([
    getCachedSleepLogs7Days(user.id, sevenDaysAgoDate),
    getCachedMoodLogs7Days(user.id, sevenDaysAgoTs),
    getCachedNapLogs7Days(user.id, sevenDaysAgoTs),
  ]);

  const hasTodayLog = sleepLogs.some((log) => log.sleep_date === todayISO);
  const todayMoodCount = moodLogs.filter(
    (log) => log.log_time >= todayStartTs,
  ).length;
  const todayNapCount = napLogs.filter(
    (log) => log.start_time >= todayStartTs,
  ).length;

  return (
    <section className="flex flex-1 flex-col pt-5 md:px-2">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        오늘
      </h2>
      <ul className="mt-4 flex flex-1 flex-col space-y-0">
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700 first:pt-0">
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            수면 기록
          </span>
          <span className="flex items-center gap-2">
            <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              {hasTodayLog ? "기록됨" : "없음"}
            </span>
            <Link
              href="/dashboard/checkin"
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              기록하기 →
            </Link>
          </span>
        </li>
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            기분 체크인
          </span>
          <span className="flex items-center gap-2">
            <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              {todayMoodCount}회
            </span>
            <Link
              href="/dashboard/mood-checkin"
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              기록하기 →
            </Link>
          </span>
        </li>
        <li className="flex flex-1 items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-base text-zinc-600 dark:text-zinc-400">
            낮잠
          </span>
          <span className="flex items-center gap-2">
            <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              {todayNapCount}회
            </span>
            <Link
              href="/dashboard/nap-checkin"
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              기록하기 →
            </Link>
          </span>
        </li>
      </ul>
    </section>
  );
}
